package com.example.skywatch

import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.webkit.*
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import android.Manifest
import android.view.View
import android.view.WindowManager

/**
 * SkyWatch — Full-screen WebView Activity
 *
 * Loads the bundled Vite build from assets/web/index.html and intercepts
 * /api/opensky calls, forwarding them to the real OpenSky Network API
 * with Basic Auth injected natively — so CORS is never an issue.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    // Location permission launcher
    private val locationPermLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { /* permissions result handled by WebView geolocation callback */ }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // True edge-to-edge full-screen (including status bar)
        window.apply {
            addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
            statusBarColor = Color.parseColor("#040810")
            navigationBarColor = Color.parseColor("#040810")
        }

        // Enable Chrome DevTools remote debugging (chrome://inspect) for diagnostics
        WebView.setWebContentsDebuggingEnabled(true)

        // Build the WebView
        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#040810"))
        }

        // Configure WebView settings
        webView.settings.apply {
            javaScriptEnabled          = true
            domStorageEnabled          = true
            allowFileAccess            = true
            allowContentAccess         = true
            loadWithOverviewMode       = true
            useWideViewPort            = true
            setSupportZoom(false)
            builtInZoomControls        = false
            displayZoomControls        = false
            mediaPlaybackRequiresUserGesture = false
            // Allow mixed content for map tiles (some served over HTTP)
            mixedContentMode           = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode                  = WebSettings.LOAD_DEFAULT
            databaseEnabled            = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
        }

        // Geolocation permission grant
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String,
                callback: GeolocationPermissions.Callback
            ) {
                val fineGranted = ContextCompat.checkSelfPermission(
                    this@MainActivity, Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED

                if (fineGranted) {
                    callback.invoke(origin, true, false)
                } else {
                    // Request from OS, then re-try via WebView reload
                    locationPermLauncher.launch(arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    ))
                    callback.invoke(origin, false, false)
                }
            }
        }

        // Intercept /api/opensky requests and proxy to OpenSky Network with auth
        webView.webViewClient = OpenSkyWebViewClient()

        // Hide system UI for immersive mode
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )

        setContentView(FrameLayout(this).apply {
            addView(webView)
        })

        // Load the bundled web app
        webView.loadUrl("file:///android_asset/web/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }
}
