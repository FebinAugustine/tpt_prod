package com.thepowertrainer.mobile.core.common.wishlist

import kotlinx.coroutines.flow.Flow

/**
 * Cross-feature contract mirroring [com.thepowertrainer.mobile.core.common.cart.CartGateway]'s
 * pattern (see CLAUDE.md Decision #6): :feature:catalog needs to toggle a
 * product's wishlist state and show heart/badge indicators without depending
 * on :feature:wishlist's internals. The actual storage lives entirely in
 * :feature:wishlist's WishlistRepositoryImpl, which provides the Hilt binding.
 */
data class WishlistItemInput(
    val productId: String,
    val name: String,
    val price: Double,
    val offerPrice: Double?,
    val imageUrl: String?,
    val inStock: Boolean,
)

interface WishlistGateway {
    suspend fun toggle(item: WishlistItemInput)

    /** All wishlisted product IDs — cheap membership checks in a product grid. */
    fun observeProductIds(): Flow<Set<String>>

    fun observeItemCount(): Flow<Int>
}
