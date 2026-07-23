package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive

/** Admin's own copy of the order shape (not shared with :feature:orders —
 * root CLAUDE.md Decision #2). `user` is populated by the backend
 * (`OrdersService.findAllPaginated` populates `fullName email phone`) as an
 * object, but kept as JsonElement defensively in case of an unpopulated ref. */
@Serializable
data class OrderAdminDto(
    @SerialName("_id") val id: String? = null,
    val user: JsonElement? = null,
    val total: Double? = null,
    val paymentMethod: String? = null,
    val paymentStatus: String? = null,
    val orderStatus: String? = null,
    val createdAt: String? = null,
) {
    fun userDisplayName(): String? = when (val u = user) {
        is JsonObject -> (u["fullName"] as? JsonPrimitive)?.let { runCatching { it.jsonPrimitive.content }.getOrNull() }
        else -> null
    }
}

/** Matches the backend's generic `PaginatedResponseDto<T>` — we only read `items`. */
@Serializable
data class PaginatedOrdersDto(
    val items: List<OrderAdminDto>? = null,
    val total: Int? = null,
    val page: Int? = null,
    val totalPages: Int? = null,
)

@Serializable
data class UpdateOrderStatusRequest(val orderStatus: String)

@Serializable
data class UpdatePaymentStatusRequest(val paymentStatus: String)
