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

/**
 * WebViewClient that intercepts two API paths the bundled web app calls and
 * proxies them natively (the Android equivalent of the Vite dev proxy /
 * Vercel serverless functions, so the same client JS works unmodified):
 *
 *  - /api/opensky        → FlightRadar24's live feed (spoofed browser headers)
 *  - /api/aircraft-photo → Planespotters' public photo API (descriptive UA)
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
        private const val PLANESPOTTERS_BASE = "https://api.planespotters.net/pub/photos/hex"
        private const val PLANESPOTTERS_UA = "SkyWatch/1.0 (+https://github.com/pcs6553/SkyWatch)"

        // Timeout: OpenSky can take up to 20 s to respond
        private const val CONNECT_TIMEOUT_MS = 10_000
        private const val READ_TIMEOUT_MS    = 25_000
    }

    override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest
    ): WebResourceResponse? {
        val url = request.url.toString()

        if (url.contains("/api/aircraft-photo")) {
            return proxyAircraftPhoto(request)
        }
        if (url.contains("/api/opensky")) {
            return proxyOpenSky(request)
        }
        return super.shouldInterceptRequest(view, request)
    }

    private fun proxyOpenSky(request: WebResourceRequest): WebResourceResponse {
        val url = request.url.toString()
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

    // Planespotters rejects requests without a descriptive User-Agent
    // (browsers can't set that header from fetch()/XHR, so it's proxied here
    // the same way the Vite dev proxy / Vercel function do).
    private fun proxyAircraftPhoto(request: WebResourceRequest): WebResourceResponse {
        val url = request.url.toString()
        Log.d(TAG, "Intercepting: $url")

        return try {
            val hex = request.url.getQueryParameter("hex") ?: ""
            val upstreamUrl = "$PLANESPOTTERS_BASE/${java.net.URLEncoder.encode(hex, "UTF-8")}"

            Log.d(TAG, "Forwarding to: $upstreamUrl")

            val connection = (URL(upstreamUrl).openConnection() as HttpURLConnection).apply {
                requestMethod  = "GET"
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout    = READ_TIMEOUT_MS
                setRequestProperty("Accept", "application/json")
                setRequestProperty("User-Agent", PLANESPOTTERS_UA)
                instanceFollowRedirects = true
            }

            connection.connect()
            val statusCode = connection.responseCode
            Log.d(TAG, "Planespotters response: HTTP $statusCode")

            val body = if (statusCode == HttpURLConnection.HTTP_OK) {
                connection.inputStream.readBytes()
            } else {
                (connection.errorStream ?: connection.inputStream).readBytes()
            }

            WebResourceResponse(
                "application/json",
                "utf-8",
                statusCode,
                if (statusCode == HttpURLConnection.HTTP_OK) "OK" else "Error",
                mapOf(
                    "Access-Control-Allow-Origin" to "*",
                    "Cache-Control"              to "max-age=86400",
                    "Content-Type"               to "application/json; charset=utf-8"
                ),
                ByteArrayInputStream(body)
            )
        } catch (e: Exception) {
            Log.e(TAG, "Photo proxy error: ${e.message}", e)
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
