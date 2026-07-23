package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Shape matches `AuthController.getDashboardStats()` exactly — a flat
 * object, no `@WrapResponse()` envelope. */
@Serializable
data class DashboardStatsDto(
    val totalUsers: Int? = null,
    val activeUsers: Int? = null,
    val pendingVerifications: Int? = null,
    val totalRevenue: Double? = null,
    val totalCategories: Int? = null,
    val totalProducts: Int? = null,
    val totalOrders: Int? = null,
)

@Serializable
data class AdminUserDto(
    @SerialName("_id") val id: String? = null,
    val fullName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val role: String? = null,
    val isVerified: Boolean? = null,
)

/** Matches the backend's generic `PaginatedResponseDto<T>` (`items`, `total`,
 * `page`, `totalPages`, optional `limit` + alias key — we only read `items`). */
@Serializable
data class PaginatedUsersDto(
    val items: List<AdminUserDto>? = null,
    val total: Int? = null,
    val page: Int? = null,
    val totalPages: Int? = null,
)

@Serializable
data class AddUserRequest(
    val fullName: String,
    val email: String,
    val password: String,
    val role: String,
)

@Serializable
data class UpdateUserRequest(
    val fullName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val role: String? = null,
)
