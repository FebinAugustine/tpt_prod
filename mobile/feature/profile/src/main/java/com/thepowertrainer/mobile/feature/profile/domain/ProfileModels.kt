package com.thepowertrainer.mobile.feature.profile.domain

data class ProfileUser(
    val id: String,
    val fullName: String,
    val email: String,
    val phone: String,
    val role: String,
    val isVerified: Boolean,
    val createdAt: String?,
)

data class ProfileInput(
    val fullName: String,
    val email: String,
    val phone: String,
)

data class ChangePasswordInput(
    val currentPassword: String,
    val newPassword: String,
)
