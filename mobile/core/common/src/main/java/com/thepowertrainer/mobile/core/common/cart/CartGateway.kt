package com.thepowertrainer.mobile.core.common.cart

import kotlinx.coroutines.flow.Flow

/**
 * Minimal cross-feature contract so other features (e.g. :feature:catalog's
 * product detail screen) can add an item to the cart without depending on
 * :feature:cart's internals. This is the one deliberate exception to the
 * "no shared domain module" rule (see CLAUDE.md Decision #2/#6): it's a
 * generic wiring contract — a plain input DTO + interface, no business logic
 * or storage. The real cart logic/persistence lives entirely in
 * :feature:cart's CartRepositoryImpl, which provides the Hilt binding.
 */
data class CartItemInput(
    val productId: String,
    val name: String,
    val price: Double,
    val offerPrice: Double?,
    val imageUrl: String?,
    val inStock: Boolean,
    val weight: String?,
    val flavour: String?,
)

/** A cart line as seen from outside :feature:cart (e.g. by :feature:checkout). */
data class CartLine(val item: CartItemInput, val quantity: Int)

interface CartGateway {
    suspend fun addItem(item: CartItemInput, quantity: Int = 1)
    fun observeItemCount(): Flow<Int>

    /** Full cart contents — used by :feature:checkout to build the order payload. */
    fun observeItems(): Flow<List<CartLine>>

    /** Called by :feature:checkout after an order is placed successfully. */
    suspend fun clear()
}
