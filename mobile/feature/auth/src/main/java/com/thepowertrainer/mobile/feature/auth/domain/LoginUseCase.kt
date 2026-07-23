package com.thepowertrainer.mobile.feature.auth.domain

import com.thepowertrainer.mobile.core.common.result.AppResult
import javax.inject.Inject

/**
 * Feature-owned use case — basic e-commerce-domain validation lives here
 * (not in the ViewModel, not in a shared :core:domain), per Decision #2.
 */
class LoginUseCase @Inject constructor(
    private val repository: AuthRepository,
) {
    suspend operator fun invoke(email: String, password: String): AppResult<AuthUser> {
        val trimmedEmail = email.trim()
        if (trimmedEmail.isEmpty() || !trimmedEmail.contains("@")) {
            return AppResult.Error("Enter a valid email address")
        }
        if (password.length < 8) {
            return AppResult.Error("Password must be at least 8 characters")
        }
        return repository.login(trimmedEmail, password)
    }
}
