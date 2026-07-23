package com.thepowertrainer.mobile.feature.admin.domain

data class DashboardStats(
    val totalUsers: Int,
    val activeUsers: Int,
    val pendingVerifications: Int,
    val totalRevenue: Double,
    val totalCategories: Int,
    val totalProducts: Int,
    val totalOrders: Int,
)

data class AdminUser(
    val id: String,
    val fullName: String,
    val email: String,
    val phone: String?,
    val role: String,
    val isVerified: Boolean,
)

data class NewUserInput(
    val fullName: String,
    val email: String,
    val password: String,
    val role: String,
)

data class UpdateUserInput(
    val fullName: String,
    val email: String,
    val role: String,
)
