package com.thepowertrainer.mobile.feature.auth.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class RegisterRequest(
    val fullName: String,
    val email: String,
    val password: String,
    val phone: String,
)

@Serializable
data class RefreshRequest(
    val refreshToken: String,
)

/**
 * These map 1:1 to `AuthController`/`AuthService` on the backend — none of
 * these auth endpoints use `@WrapResponse()`, so the JSON is flat, not
 * wrapped in the `{ success, data }` envelope other endpoints use.
 */
@Serializable
data class UserDto(
    @SerialName("_id") val id: String? = null,
    val fullName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val role: String? = null,
    val isVerified: Boolean? = null,
)

@Serializable
data class LoginResponse(
    val message: String? = null,
    val user: UserDto? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
)

@Serializable
data class RegisterResponse(
    val message: String? = null,
)

@Serializable
data class RefreshResponse(
    val success: Boolean = false,
    val message: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val error: String? = null,
)

@Serializable
data class LogoutResponse(
    val message: String? = null,
)
