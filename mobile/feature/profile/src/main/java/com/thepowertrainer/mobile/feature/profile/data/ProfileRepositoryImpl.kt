package com.thepowertrainer.mobile.feature.profile.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.network.backendMessage
import com.thepowertrainer.mobile.feature.profile.domain.ChangePasswordInput
import com.thepowertrainer.mobile.feature.profile.domain.ProfileInput
import com.thepowertrainer.mobile.feature.profile.domain.ProfileRepository
import com.thepowertrainer.mobile.feature.profile.domain.ProfileUser
import kotlinx.serialization.json.Json
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class ProfileRepositoryImpl @Inject constructor(
    private val api: ProfileApi,
    private val json: Json,
) : ProfileRepository {

    override suspend fun getProfile(): AppResult<ProfileUser> = safeCall {
        AppResult.Success(api.getProfile().toDomain())
    }

    override suspend fun updateProfile(input: ProfileInput): AppResult<ProfileUser> = safeCall {
        val envelope = api.updateProfile(
            UpdateProfileRequest(fullName = input.fullName, email = input.email, phone = input.phone),
        )
        val user = envelope.data ?: return@safeCall AppResult.Error(envelope.error ?: envelope.message ?: "Update failed")
        AppResult.Success(user.toDomain())
    }

    override suspend fun changePassword(input: ChangePasswordInput): AppResult<Unit> = safeCall {
        api.changePassword(ChangePasswordRequest(input.currentPassword, input.newPassword))
        AppResult.Success(Unit)
    }

    override suspend fun deleteAccount(): AppResult<Unit> = safeCall {
        api.deleteAccount()
        AppResult.Success(Unit)
    }

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.backendMessage(json), e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun UserDto.toDomain() = ProfileUser(
        id = id ?: "",
        fullName = fullName ?: "",
        email = email ?: "",
        phone = phone ?: "",
        role = role ?: "user",
        isVerified = isVerified ?: false,
        createdAt = createdAt,
    )
}
