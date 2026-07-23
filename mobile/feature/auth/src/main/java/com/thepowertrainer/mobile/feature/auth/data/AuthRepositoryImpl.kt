package com.thepowertrainer.mobile.feature.auth.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.network.TokenStorage
import com.thepowertrainer.mobile.feature.auth.data.dto.LoginRequest
import com.thepowertrainer.mobile.feature.auth.data.dto.RefreshRequest
import com.thepowertrainer.mobile.feature.auth.data.dto.RegisterRequest
import com.thepowertrainer.mobile.feature.auth.data.dto.UserDto
import com.thepowertrainer.mobile.feature.auth.domain.AuthRepository
import com.thepowertrainer.mobile.feature.auth.domain.AuthUser
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
    private val tokenStorage: TokenStorage,
) : AuthRepository {

    override suspend fun login(email: String, password: String): AppResult<AuthUser> = safeCall {
        val response = api.login(LoginRequest(email, password))
        val accessToken = response.accessToken
        val refreshToken = response.refreshToken
        val user = response.user

        if (accessToken == null || refreshToken == null || user == null) {
            return AppResult.Error(response.message ?: "Login failed")
        }

        tokenStorage.saveTokens(accessToken, refreshToken)
        tokenStorage.saveRole(user.role ?: "user")
        tokenStorage.saveIsVerified(user.isVerified ?: false)
        AppResult.Success(user.toDomain())
    }

    override suspend fun register(
        fullName: String,
        email: String,
        password: String,
        phone: String,
    ): AppResult<Unit> = safeCall {
        api.register(RegisterRequest(fullName, email, password, phone))
        AppResult.Success(Unit)
    }

    override suspend fun logout(): AppResult<Unit> = safeCall {
        val refreshToken = tokenStorage.getRefreshToken()
        if (refreshToken != null) {
            // Best-effort: still clear local tokens even if the network
            // call fails (e.g. offline logout should still log the user out
            // of *this device*).
            runCatching { api.logout(RefreshRequest(refreshToken)) }
        }
        tokenStorage.clear()
        AppResult.Success(Unit)
    }

    override suspend fun getProfile(): AppResult<AuthUser> = safeCall {
        AppResult.Success(api.getProfile().toDomain())
    }

    override suspend fun isLoggedIn(): Boolean = tokenStorage.getAccessToken() != null

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.message() ?: "Server error", e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun UserDto.toDomain(): AuthUser = AuthUser(
        id = id ?: "",
        fullName = fullName ?: "",
        email = email ?: "",
        phone = phone,
        role = role ?: "user",
        isVerified = isVerified ?: false,
    )
}
