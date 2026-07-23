package com.thepowertrainer.mobile.feature.wishlist.domain

import kotlinx.coroutines.flow.Flow

interface WishlistRepository {
    fun observeWishlist(): Flow<List<WishlistItem>>
    suspend fun addToWishlist(item: WishlistItem)
    suspend fun removeFromWishlist(productId: String)
    suspend fun toggleWishlist(item: WishlistItem)
}
