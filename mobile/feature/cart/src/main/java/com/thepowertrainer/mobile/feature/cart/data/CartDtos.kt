package com.thepowertrainer.mobile.feature.cart.data

import com.thepowertrainer.mobile.feature.cart.domain.CartItem
import kotlinx.serialization.Serializable

/** Plain serializable mirror of [CartItem], persisted as a JSON blob. */
@Serializable
data class CartItemDto(
    val id: String,
    val name: String,
    val price: Double,
    val offerPrice: Double? = null,
    val imageUrl: String? = null,
    val inStock: Boolean = true,
    val quantity: Int,
    val weight: String? = null,
    val flavour: String? = null,
)

fun CartItemDto.toDomain() = CartItem(
    id = id,
    name = name,
    price = price,
    offerPrice = offerPrice,
    imageUrl = imageUrl,
    inStock = inStock,
    quantity = quantity,
    weight = weight,
    flavour = flavour,
)

fun CartItem.toDto() = CartItemDto(
    id = id,
    name = name,
    price = price,
    offerPrice = offerPrice,
    imageUrl = imageUrl,
    inStock = inStock,
    quantity = quantity,
    weight = weight,
    flavour = flavour,
)
