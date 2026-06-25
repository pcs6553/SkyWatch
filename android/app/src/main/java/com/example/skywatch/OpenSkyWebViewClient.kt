package com.example.skywatch

import android.util.Base64
import android.util.Log
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import java.io.ByteArrayInputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

/**
 * WebViewClient that intercepts /api/opensky requests and proxies them to
 * https://opensky-network.org/api/states/all with Basic Auth injected.
 *
 * This is the native Android equivalent of the Vite dev proxy — it means
 * the exact same client JS code works in the WebView without modification.
 */
class OpenSkyWebViewClient : WebViewClient() {

    companion object {
        private const val TAG = "OpenSkyProxy"

        // Credentials from credentials.json
        private const val CLIENT_ID     = "prashanthcs-api-client"
        private const val CLIENT_SECRET = "REPLACE_WITH_YOUR_OPENSKY_CLIENT_SECRET"

        private val BASIC_AUTH: String by lazy {
            val raw = "$CLIENT_ID:$CLIENT_SECRET"
            "Basic " + Base64.encodeToString(raw.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
        }

        private const val OPENSKY_BASE = "https://data-cloud.flightradar24.com/zones/fcgi/feed.js"

        // Timeout: OpenSky can take up to 20 s to respond
        private const val CONNECT_TIMEOUT_MS = 10_000
        private const val READ_TIMEOUT_MS    = 25_000
    }

    override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest
    ): WebResourceResponse? {
        val url = request.url.toString()

        // Only intercept our proxy path
        if (!url.contains("/api/opensky")) {
            return super.shouldInterceptRequest(view, request)
        }

        Log.d(TAG, "Intercepting: $url")

        return try {
            // Extract query string from the intercepted URL and append to OpenSky endpoint
            val query = request.url.query
            val upstreamUrl = if (query != null) "$OPENSKY_BASE?$query" else OPENSKY_BASE

            Log.d(TAG, "Forwarding to: $upstreamUrl")

            val connection = (URL(upstreamUrl).openConnection() as HttpURLConnection).apply {
                requestMethod     = "GET"
                connectTimeout    = CONNECT_TIMEOUT_MS
                readTimeout       = READ_TIMEOUT_MS
                setRequestProperty("Accept", "application/json")
                setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36")
                setRequestProperty("Referer", "https://www.flightradar24.com/")
                setRequestProperty("Origin", "https://www.flightradar24.com")
                instanceFollowRedirects = true
            }

            connection.connect()

            val statusCode    = connection.responseCode
            val contentType   = connection.contentType ?: "application/json"
            val mimeType      = contentType.substringBefore(";").trim()
            val encoding      = contentType.substringAfter("charset=", "utf-8").trim()

            Log.d(TAG, "OpenSky response: HTTP $statusCode")

            if (statusCode == HttpURLConnection.HTTP_OK) {
                val body = connection.inputStream.readBytes()
                WebResourceResponse(
                    mimeType,
                    encoding,
                    statusCode,
                    "OK",
                    mapOf(
                        "Access-Control-Allow-Origin" to "*",
                        "Cache-Control"              to "no-store",
                        "Content-Type"               to "application/json; charset=utf-8"
                    ),
                    ByteArrayInputStream(body)
                )
            } else {
                // Pass through error code
                val errorBody = (connection.errorStream ?: connection.inputStream).readBytes()
                val reason = connection.responseMessage
                val reasonPhrase = if (reason.isNullOrBlank()) "Error" else reason
                WebResourceResponse(
                    "application/json",
                    "utf-8",
                    statusCode,
                    reasonPhrase,
                    mapOf("Access-Control-Allow-Origin" to "*"),
                    ByteArrayInputStream(errorBody)
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Proxy error: ${e.message}", e)
            // Return a 502 so the JS error handler can see it
            WebResourceResponse(
                "application/json",
                "utf-8",
                502,
                "Bad Gateway",
                mapOf("Access-Control-Allow-Origin" to "*"),
                ByteArrayInputStream("""{"error":"${e.message}"}""".toByteArray())
            )
        }
    }

    // Allow loading local assets + external content (map tiles, CDN fonts, etc.)
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        return false
    }
}
