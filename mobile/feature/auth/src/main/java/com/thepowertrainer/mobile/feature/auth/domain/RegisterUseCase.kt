package com.thepowertrainer.mobile.feature.auth.domain

import com.thepowertrainer.mobile.core.common.result.AppResult
import javax.inject.Inject

/** Feature-owned validation for registration — see Decision #2 (no shared :core:domain). */
class RegisterUseCase @Inject constructor(
    private val repository: AuthRepository,
) {
    suspend operator fun invoke(
        fullName: String,
        email: String,
        password: String,
        confirmPassword: String,
        phone: String,
    ): AppResult<Unit> {
        val trimmedName = fullName.trim()
        val trimmedEmail = email.trim()
        val trimmedPhone = phone.trim()

        if (trimmedName.isEmpty()) {
            return AppResult.Error("Enter your full name")
        }
        if (trimmedEmail.isEmpty() || !trimmedEmail.contains("@")) {
            return AppResult.Error("Enter a valid email address")
        }
        if (trimmedPhone.isEmpty()) {
            return AppResult.Error("Enter a phone number")
        }
        if (password.length < 8) {
            return AppResult.Error("Password must be at least 8 characters")
        }
        if (password != confirmPassword) {
            return AppResult.Error("Passwords don't match")
        }

        return repository.register(trimmedName, trimmedEmail, password, trimmedPhone)
    }
}
