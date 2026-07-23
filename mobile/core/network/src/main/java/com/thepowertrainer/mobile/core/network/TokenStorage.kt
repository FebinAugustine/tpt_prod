package com.thepowertrainer.mobile.core.network

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.authDataStore by preferencesDataStore(name = "tpt_auth_tokens")

/**
 * Holds the JWT access/refresh token pair for the mobile bearer-token auth
 * mode (see backend CLAUDE.md Decision #1 — same rotation strategy as the
 * web frontend, just a bearer-header transport instead of httpOnly cookies).
 *
 * Backed by Jetpack DataStore today. TODO(hardening): wrap with
 * androidx.security EncryptedSharedPreferences (or a DataStore + Android
 * Keystore-backed cipher) once that library exits its long-running alpha —
 * tokens are sensitive enough to warrant at-rest encryption before this
 * ships to the Play Store.
 */
@Singleton
class TokenStorage @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val ACCESS_TOKEN = stringPreferencesKey("access_token")
        val REFRESH_TOKEN = stringPreferencesKey("refresh_token")
        val ROLE = stringPreferencesKey("role")
        val IS_VERIFIED = androidx.datastore.preferences.core.booleanPreferencesKey("is_verified")
    }

    val accessTokenFlow: Flow<String?> =
        context.authDataStore.data.map { it[Keys.ACCESS_TOKEN] }

    val refreshTokenFlow: Flow<String?> =
        context.authDataStore.data.map { it[Keys.REFRESH_TOKEN] }

    /** Persisted alongside the token pair at login so feature modules (e.g.
     * :feature:home's admin-entry-point gate) can check "is this user an
     * admin" without depending on :feature:auth or :feature:profile directly
     * — see root CLAUDE.md Decision #2 (no shared :core:domain, but :core:network
     * already owns session state, so role is a natural extension of that). */
    val roleFlow: Flow<String?> =
        context.authDataStore.data.map { it[Keys.ROLE] }

    /** Persisted alongside role at login — lets :feature:catalog gate the
     * verified-only trainer price/offer-price display (mirrors the
     * frontend's `user?.isVerified` checks in product/[id]/page.tsx)
     * without depending on :feature:auth or :feature:profile directly. */
    val isVerifiedFlow: Flow<Boolean> =
        context.authDataStore.data.map { it[Keys.IS_VERIFIED] ?: false }

    suspend fun getAccessToken(): String? = accessTokenFlow.first()

    suspend fun getRefreshToken(): String? = refreshTokenFlow.first()

    suspend fun getRole(): String? = roleFlow.first()

    suspend fun getIsVerified(): Boolean = isVerifiedFlow.first()

    suspend fun saveTokens(accessToken: String, refreshToken: String) {
        context.authDataStore.edit { prefs ->
            prefs[Keys.ACCESS_TOKEN] = accessToken
            prefs[Keys.REFRESH_TOKEN] = refreshToken
        }
    }

    suspend fun saveRole(role: String) {
        context.authDataStore.edit { prefs -> prefs[Keys.ROLE] = role }
    }

    suspend fun saveIsVerified(isVerified: Boolean) {
        context.authDataStore.edit { prefs -> prefs[Keys.IS_VERIFIED] = isVerified }
    }

    suspend fun clear() {
        context.authDataStore.edit { it.clear() }
    }
}
