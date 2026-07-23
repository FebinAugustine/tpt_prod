package com.thepowertrainer.mobile.feature.cart.domain

import kotlinx.coroutines.flow.Flow

interface CartRepository {
    fun observeCart(): Flow<List<CartItem>>

    suspend fun addToCart(item: CartItem, quantity: Int = 1)

    suspend fun removeFromCart(productId: String)

    suspend fun updateQuantity(productId: String, quantity: Int)

    suspend fun clearCart()
}
