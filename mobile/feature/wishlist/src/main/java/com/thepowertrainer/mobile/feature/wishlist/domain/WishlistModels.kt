package com.thepowertrainer.mobile.feature.wishlist.domain

/** Mirrors frontend/app/store/wishlistStore.ts's WishlistItem — client-only, no backend endpoint. */
data class WishlistItem(
    val id: String,
    val name: String,
    val price: Double,
    val offerPrice: Double?,
    val imageUrl: String?,
    val inStock: Boolean,
) {
    val displayPrice: Double get() = offerPrice ?: price
}
