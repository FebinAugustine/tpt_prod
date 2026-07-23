package com.thepowertrainer.mobile.feature.auth.data

import com.thepowertrainer.mobile.feature.auth.data.dto.LoginRequest
import com.thepowertrainer.mobile.feature.auth.data.dto.LoginResponse
import com.thepowertrainer.mobile.feature.auth.data.dto.LogoutResponse
import com.thepowertrainer.mobile.feature.auth.data.dto.RefreshRequest
import com.thepowertrainer.mobile.feature.auth.data.dto.RefreshResponse
import com.thepowertrainer.mobile.feature.auth.data.dto.RegisterRequest
import com.thepowertrainer.mobile.feature.auth.data.dto.RegisterResponse
import com.thepowertrainer.mobile.feature.auth.data.dto.UserDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Routes match `AuthController` exactly (`api/v1/auth/...` — the `v1`
 * prefix + version is applied via ApiConfig.BASE_URL, see :core:network).
 *
 * Login already returns tokens in the JSON body server-side (no change was
 * needed there). Refresh/logout were extended on the backend to accept the
 * refresh token in the body as a mobile-friendly alternative to the
 * httpOnly cookie the web frontend uses — see backend `RefreshTokenDto`.
 */
interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): RegisterResponse

    @POST("auth/refresh")
    suspend fun refresh(@Body request: RefreshRequest): RefreshResponse

    @POST("auth/logout")
    suspend fun logout(@Body request: RefreshRequest): LogoutResponse

    @GET("auth/profile")
    suspend fun getProfile(): UserDto
}
