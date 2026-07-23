package com.thepowertrainer.mobile.feature.admin.domain

data class AdminOrder(
    val id: String,
    val customerName: String?,
    val total: Double,
    val paymentMethod: String?,
    val paymentStatus: String,
    val orderStatus: String,
    val createdAt: String?,
)

val ORDER_STATUS_OPTIONS = listOf("pending", "confirmed", "shipped", "delivered", "cancelled")
val PAYMENT_STATUS_OPTIONS = listOf("pending", "verified", "failed")
