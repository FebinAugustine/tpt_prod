package com.thepowertrainer.mobile.feature.home.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/** Mirrors backend `Banner` schema (`uimanager/schemas/banner.schema.ts`),
 * served by `GET /uimanager/banners` (public, no auth). */
@Serializable
data class BannerDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val subtitle: String? = null,
    val image: String? = null,
    val buttonText: String? = null,
    val buttonLink: String? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)

/** Mirrors backend `Category` schema — Home only needs id/name for the
 * "Shop by Category" row, unlike `:feature:catalog`'s fuller `CategoryDto`. */
@Serializable
data class HomeCategoryDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)

/** Mirrors backend `OfferCard` schema, served by `GET /uimanager/offer-cards`
 * (public, no auth) — same shape as [BannerDto] but `image` is required and
 * it also carries `buttonText`/`buttonLink`. This is the frontend's third
 * product-adjacent home section (Popular → Offer Cards → Trending). */
@Serializable
data class OfferCardDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val subtitle: String? = null,
    val image: String? = null,
    val buttonText: String? = null,
    val buttonLink: String? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)

/**
 * Home's own copy of the product shape (per root CLAUDE.md Decision #2 —
 * no shared domain/DTOs across features, each feature owns its own network
 * calls). Only the fields the Home feed's cards actually render.
 */
@Serializable
data class HomeProductDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
    val price: Double? = null,
    val offerPrice: Double? = null,
    val company: String? = null,
    val images: List<String>? = null,
    val inStock: Boolean? = null,
    val isTrending: Boolean? = null,
    val isPopular: Boolean? = null,
    val isRecommended: Boolean? = null,
    val category: JsonElement? = null,
)
