package com.thepowertrainer.mobile.feature.cart.domain

/**
 * Mirrors the shape of frontend/app/store/cartStore.ts's CartItem exactly,
 * since cart here is also a purely client-side concern (no backend endpoint).
 */
data class CartItem(
    val id: String,
    val name: String,
    val price: Double,
    val offerPrice: Double?,
    val imageUrl: String?,
    val inStock: Boolean,
    val quantity: Int,
    val weight: String?,
    val flavour: String?,
) {
    val unitPrice: Double get() = offerPrice ?: price
    val lineTotal: Double get() = unitPrice * quantity
    val hasDiscount: Boolean get() = offerPrice != null && offerPrice < price
}
