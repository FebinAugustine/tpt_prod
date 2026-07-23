package com.thepowertrainer.mobile.feature.wishlist.data

import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistItem
import kotlinx.serialization.Serializable

@Serializable
data class WishlistItemDto(
    val id: String,
    val name: String,
    val price: Double,
    val offerPrice: Double? = null,
    val imageUrl: String? = null,
    val inStock: Boolean = true,
)

fun WishlistItemDto.toDomain() = WishlistItem(id, name, price, offerPrice, imageUrl, inStock)

fun WishlistItem.toDto() = WishlistItemDto(id, name, price, offerPrice, imageUrl, inStock)
