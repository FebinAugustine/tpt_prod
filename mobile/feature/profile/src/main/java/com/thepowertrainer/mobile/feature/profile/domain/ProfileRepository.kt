package com.thepowertrainer.mobile.feature.profile.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface ProfileRepository {
    suspend fun getProfile(): AppResult<ProfileUser>
    suspend fun updateProfile(input: ProfileInput): AppResult<ProfileUser>
    suspend fun changePassword(input: ChangePasswordInput): AppResult<Unit>
    suspend fun deleteAccount(): AppResult<Unit>
}
