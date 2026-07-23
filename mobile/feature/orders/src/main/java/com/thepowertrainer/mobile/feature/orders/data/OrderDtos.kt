package com.thepowertrainer.mobile.feature.orders.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OrderItemDto(
    val name: String? = null,
    val quantity: Int = 0,
    val price: Double = 0.0,
    val offerPrice: Double? = null,
    val images: List<String>? = null,
)

@Serializable
data class ShippingAddressDto(
    val fullName: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val pincode: String? = null,
)

@Serializable
data class UpiPaymentDetailsDto(
    val transactionId: String? = null,
    val referenceNo: String? = null,
)

@Serializable
data class OrderDto(
    @SerialName("_id") val id: String,
    val items: List<OrderItemDto> = emptyList(),
    val shippingAddress: ShippingAddressDto? = null,
    val subtotal: Double = 0.0,
    val shippingCost: Double = 0.0,
    val total: Double = 0.0,
    val paymentMethod: String? = null,
    val paymentStatus: String? = null,
    val orderStatus: String? = null,
    val upiPaymentDetails: UpiPaymentDetailsDto? = null,
    val createdAt: String? = null,
)

/** Matches OrdersController.findAll's non-admin branch response shape exactly. */
@Serializable
data class OrdersListResponseDto(
    val orders: List<OrderDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val totalPages: Int = 1,
)
