package com.thepowertrainer.mobile.feature.profile.data

import com.thepowertrainer.mobile.core.network.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface ProfileApi {

    @GET("auth/profile")
    suspend fun getProfile(): UserDto

    // Backend annotates PUT /auth/profile with @WrapResponse(), unlike GET —
    // see kdoc on ApiEnvelope and the frontend's authApi.updateProfile comment.
    @PUT("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): ApiEnvelope<UserDto>

    @POST("auth/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest)

    @DELETE("auth/account")
    suspend fun deleteAccount()
}
