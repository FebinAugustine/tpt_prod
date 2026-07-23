package com.thepowertrainer.mobile.feature.checkout.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Mirrors GET /settings/upi's response shape exactly (see backend
 * SettingsController.getUpiSettings — returns the raw settings object, or a
 * JSON `null` literal if no admin has configured it yet). No Razorpay DTOs
 * here: per Febin's 2026-07-22 decision, mobile checkout is UPI-QR only,
 * same as the frontend's primary (non-"Coming Soon") payment path.
 */
@Serializable
data class UpiSettingsDto(
    val upiId: String? = null,
    val qrCodeUrl: String? = null,
    val merchantName: String? = null,
)

@Serializable
data class AddressDto(
    @SerialName("_id") val id: String,
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean = false,
)

@Serializable
data class CreateAddressRequest(
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean = false,
)

@Serializable
data class ShippingAddressPayload(
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
)

@Serializable
data class OrderItemPayload(
    val product: String,
    val name: String,
    val quantity: Int,
    val price: Double,
    val offerPrice: Double? = null,
    val images: List<String> = emptyList(),
)

@Serializable
data class UpiPaymentDetailsPayload(
    val transactionId: String,
    val referenceNo: String,
)

/** Matches backend CreateOrderDto exactly. paymentMethod is always "upi" here. */
@Serializable
data class CreateOrderRequest(
    val items: List<OrderItemPayload>,
    val shippingAddress: ShippingAddressPayload,
    val subtotal: Double,
    val shippingCost: Double = 0.0,
    val total: Double,
    val paymentMethod: String = "upi",
    val upiPaymentDetails: UpiPaymentDetailsPayload,
)

@Serializable
data class OrderResponseDto(
    @SerialName("_id") val id: String,
)
