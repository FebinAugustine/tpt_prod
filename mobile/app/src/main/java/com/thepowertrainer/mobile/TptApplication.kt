package com.thepowertrainer.mobile

import android.app.Application
import coil3.ImageLoader
import coil3.PlatformContext
import coil3.SingletonImageLoader
import coil3.network.okhttp.OkHttpNetworkFetcherFactory
import coil3.request.crossfade
import coil3.util.DebugLogger
import dagger.hilt.android.HiltAndroidApp

/**
 * Registers Coil3's network fetcher app-wide (2026-07-23 bugfix — product/
 * banner/category images were not rendering anywhere in the app). Unlike
 * coil2, coil3 does NOT automatically wire up [OkHttpNetworkFetcherFactory]
 * just because `coil-network-okhttp` is on the classpath — every module
 * that used `AsyncImage`/`PttImageOrPlaceholder` (Catalog, Home, Cart,
 * Wishlist, Product Detail, Admin) had no fetcher registered at all, so
 * every remote (Cloudinary) image URL silently failed to load and only the
 * gradient placeholder ever showed. A [SingletonImageLoader.Factory] here
 * is the one app-wide place this needs wiring — no per-feature-module fix
 * needed. Uses a plain new OkHttpClient (not the auth-interceptor-attached
 * one from :core:network) since these are public, unauthenticated image URLs.
 */
@HiltAndroidApp
class TptApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: PlatformContext): ImageLoader =
        ImageLoader.Builder(context)
            .components { add(OkHttpNetworkFetcherFactory()) }
            .crossfade(true)
            // Debug-only: logs every Coil request's success/failure (with the
            // real exception) to Logcat under the "Coil" tag — added
            // 2026-07-23 to diagnose "images still not showing after a clean
            // reinstall". Filter Logcat for "Coil" to see exactly why a given
            // Cloudinary URL failed (DNS/network unreachable, timeout, 404,
            // decode error, etc.) instead of guessing blind.
            .apply { if (BuildConfig.DEBUG) logger(DebugLogger()) }
            .build()
}
