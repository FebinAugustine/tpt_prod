package com.thepowertrainer.mobile.feature.orders.domain

data class OrderItem(
    val name: String,
    val quantity: Int,
    val price: Double,
    val offerPrice: Double?,
    val imageUrl: String?,
) {
    val lineTotal: Double get() = (offerPrice ?: price) * quantity
}

data class OrderShippingAddress(
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
)

data class Order(
    val id: String,
    val items: List<OrderItem>,
    val shippingAddress: OrderShippingAddress?,
    val subtotal: Double,
    val shippingCost: Double,
    val total: Double,
    val paymentMethod: String,
    val paymentStatus: String,
    val orderStatus: String,
    val upiTransactionId: String?,
    val upiReferenceNo: String?,
    val createdAt: String?,
) {
    /** Last 8 chars uppercased, mirrors frontend's `order._id.slice(-8).toUpperCase()`. */
    val shortId: String get() = id.takeLast(8).uppercase()
}
