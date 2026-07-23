package com.thepowertrainer.mobile.feature.wishlist.data

import com.thepowertrainer.mobile.core.common.wishlist.WishlistGateway
import com.thepowertrainer.mobile.core.common.wishlist.WishlistItemInput
import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistItem
import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WishlistRepositoryImpl @Inject constructor(
    private val localStore: WishlistLocalStore,
) : WishlistRepository, WishlistGateway {

    override fun observeWishlist(): Flow<List<WishlistItem>> =
        localStore.itemsFlow.map { list -> list.map { it.toDomain() } }

    override suspend fun addToWishlist(item: WishlistItem) {
        val current = localStore.getItems()
        if (current.none { it.id == item.id }) {
            localStore.saveItems(current + item.toDto())
        }
    }

    override suspend fun removeFromWishlist(productId: String) {
        localStore.saveItems(localStore.getItems().filterNot { it.id == productId })
    }

    override suspend fun toggleWishlist(item: WishlistItem) {
        val current = localStore.getItems()
        if (current.any { it.id == item.id }) {
            removeFromWishlist(item.id)
        } else {
            addToWishlist(item)
        }
    }

    // --- WishlistGateway (cross-feature contract) ---

    override suspend fun toggle(item: WishlistItemInput) {
        toggleWishlist(
            WishlistItem(
                id = item.productId,
                name = item.name,
                price = item.price,
                offerPrice = item.offerPrice,
                imageUrl = item.imageUrl,
                inStock = item.inStock,
            ),
        )
    }

    override fun observeProductIds(): Flow<Set<String>> =
        observeWishlist().map { items -> items.map { it.id }.toSet() }

    override fun observeItemCount(): Flow<Int> =
        observeWishlist().map { it.size }
}
