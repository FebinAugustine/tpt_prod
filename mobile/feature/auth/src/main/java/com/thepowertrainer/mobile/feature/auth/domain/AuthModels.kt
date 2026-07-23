package com.thepowertrainer.mobile.feature.auth.domain

/** Domain-level user model — decoupled from the wire-format UserDto. */
data class AuthUser(
    val id: String,
    val fullName: String,
    val email: String,
    val phone: String?,
    val role: String,
    val isVerified: Boolean,
)
