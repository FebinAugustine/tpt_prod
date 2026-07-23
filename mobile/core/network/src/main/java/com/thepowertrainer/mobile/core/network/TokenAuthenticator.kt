package com.thepowertrainer.mobile.core.network

import kotlinx.coroutines.runBlocking
import kotlinx.serialization.Serializable
import okhttp3.Authenticator
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

@Serializable
private data class MobileRefreshRequest(val refreshToken: String)

@Serializable
private data class MobileRefreshResponse(
    val success: Boolean = false,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val error: String? = null,
)

/**
 * Implements the "401 -> refresh -> retry, transparently" flow from
 * CLAUDE.md Decision #1. OkHttp calls this synchronously on a background
 * thread whenever a request comes back 401, so it's safe to block here.
 *
 * Uses a plain (non-DI-provided) OkHttpClient for the refresh call itself to
 * avoid a circular dependency on the authenticated client. Provider<Retrofit>
 * isn't used here specifically to keep this class framework-light and easy
 * to unit test — it talks to POST /auth/refresh directly.
 *
 * Reuses the exact same backend rotation endpoint the web frontend calls
 * (`/auth/refresh`) — just passes the refresh token in the JSON body instead
 * of relying on an httpOnly cookie, since native apps have no cookie jar.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenStorage: TokenStorage,
    private val json: kotlinx.serialization.json.Json,
) : Authenticator {

    private val refreshClient = OkHttpClient.Builder().build()

    override fun authenticate(route: Route?, response: Response): Request? {
        // Avoid infinite retry loops: if we've already tried once for this
        // request chain, give up and let the 401 propagate.
        if (responseCount(response) >= 2) return null

        val refreshToken = runBlocking { tokenStorage.getRefreshToken() } ?: return null

        val newTokens = runBlocking { performRefresh(refreshToken) } ?: run {
            // Refresh token is dead too — clear stored tokens so the app can
            // route the user back to login instead of looping on 401s.
            runBlocking { tokenStorage.clear() }
            return null
        }

        return response.request.newBuilder()
            .header("Authorization", "Bearer ${newTokens.first}")
            .build()
    }

    private suspend fun performRefresh(refreshToken: String): Pair<String, String>? {
        val body = json.encodeToString(
            MobileRefreshRequest.serializer(),
            MobileRefreshRequest(refreshToken),
        ).toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url(ApiConfig.BASE_URL + "auth/refresh")
            .post(body)
            .build()

        return refreshClient.newCall(request).execute().use { httpResponse ->
            if (!httpResponse.isSuccessful) return null
            val raw = httpResponse.body?.string() ?: return null
            val parsed = runCatching {
                json.decodeFromString(MobileRefreshResponse.serializer(), raw)
            }.getOrNull() ?: return null

            if (!parsed.success || parsed.accessToken == null || parsed.refreshToken == null) {
                return null
            }

            tokenStorage.saveTokens(parsed.accessToken, parsed.refreshToken)
            parsed.accessToken to parsed.refreshToken
        }
    }

    private fun responseCount(response: Response): Int {
        var result = 1
        var prior = response.priorResponse
        while (prior != null) {
            result++
            prior = prior.priorResponse
        }
        return result
    }
}
