package com.thepowertrainer.mobile.feature.profile.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserDto(
    @SerialName("_id") val id: String? = null,
    val fullName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val role: String? = null,
    val isVerified: Boolean? = null,
    val createdAt: String? = null,
)

@Serializable
data class UpdateProfileRequest(
    val fullName: String,
    val email: String,
    val phone: String,
)

@Serializable
data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String,
)
