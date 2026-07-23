package com.thepowertrainer.mobile.feature.cart.data

import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.core.common.cart.CartItemInput
import com.thepowertrainer.mobile.core.common.cart.CartLine
import com.thepowertrainer.mobile.feature.cart.domain.CartItem
import com.thepowertrainer.mobile.feature.cart.domain.CartRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implements both the feature-owned [CartRepository] and the cross-feature
 * [CartGateway] contract (see :core:common's CartGateway kdoc) — one
 * implementation, two interfaces, so :feature:catalog can add items without
 * depending on this class directly.
 */
@Singleton
class CartRepositoryImpl @Inject constructor(
    private val localStore: CartLocalStore,
) : CartRepository, CartGateway {

    override fun observeCart(): Flow<List<CartItem>> =
        localStore.itemsFlow.map { list -> list.map { it.toDomain() } }

    override suspend fun addToCart(item: CartItem, quantity: Int) {
        val current = localStore.getItems()
        val existing = current.find { it.id == item.id }
        val updated = if (existing != null) {
            current.map {
                if (it.id == item.id) it.copy(quantity = it.quantity + quantity) else it
            }
        } else {
            current + item.toDto().copy(quantity = quantity)
        }
        localStore.saveItems(updated)
    }

    override suspend fun removeFromCart(productId: String) {
        val current = localStore.getItems()
        localStore.saveItems(current.filterNot { it.id == productId })
    }

    override suspend fun updateQuantity(productId: String, quantity: Int) {
        val current = localStore.getItems()
        val updated = if (quantity <= 0) {
            current.filterNot { it.id == productId }
        } else {
            current.map { if (it.id == productId) it.copy(quantity = quantity) else it }
        }
        localStore.saveItems(updated)
    }

    override suspend fun clearCart() {
        localStore.saveItems(emptyList())
    }

    // --- CartGateway (cross-feature contract) ---

    override suspend fun addItem(item: CartItemInput, quantity: Int) {
        addToCart(
            item = CartItem(
                id = item.productId,
                name = item.name,
                price = item.price,
                offerPrice = item.offerPrice,
                imageUrl = item.imageUrl,
                inStock = item.inStock,
                quantity = quantity,
                weight = item.weight,
                flavour = item.flavour,
            ),
            quantity = quantity,
        )
    }

    override fun observeItemCount(): Flow<Int> =
        observeCart().map { items -> items.sumOf { it.quantity } }

    override fun observeItems(): Flow<List<CartLine>> =
        observeCart().map { items ->
            items.map { item ->
                CartLine(
                    item = CartItemInput(
                        productId = item.id,
                        name = item.name,
                        price = item.price,
                        offerPrice = item.offerPrice,
                        imageUrl = item.imageUrl,
                        inStock = item.inStock,
                        weight = item.weight,
                        flavour = item.flavour,
                    ),
                    quantity = item.quantity,
                )
            }
        }

    override suspend fun clear() = clearCart()
}
