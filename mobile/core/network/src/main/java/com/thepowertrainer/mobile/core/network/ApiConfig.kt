package com.thepowertrainer.mobile.core.network

object ApiConfig {
    /**
     * Kept as a plain constant (mirrored from BuildConfig.API_BASE_URL) so
     * non-Hilt call sites like [TokenAuthenticator]'s raw refresh call don't
     * need a full DI graph just to know the base URL.
     */
    const val BASE_URL = BuildConfig.API_BASE_URL
}
