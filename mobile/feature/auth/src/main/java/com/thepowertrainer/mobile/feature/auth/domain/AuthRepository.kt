package com.thepowertrainer.mobile.feature.auth.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/**
 * Owned entirely by :feature:auth — no shared :core:domain module (see
 * root CLAUDE.md Decision #2). Other feature modules that need to know
 * "is the user logged in" depend on this module's public API directly.
 */
interface AuthRepository {
    suspend fun login(email: String, password: String): AppResult<AuthUser>
    suspend fun register(fullName: String, email: String, password: String, phone: String): AppResult<Unit>
    suspend fun logout(): AppResult<Unit>
    suspend fun getProfile(): AppResult<AuthUser>
    suspend fun isLoggedIn(): Boolean
}
