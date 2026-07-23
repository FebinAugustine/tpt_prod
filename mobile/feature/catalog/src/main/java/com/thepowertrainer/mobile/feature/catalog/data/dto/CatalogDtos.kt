package com.thepowertrainer.mobile.feature.catalog.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * Mirrors backend `Product` schema (products/schemas/product.schema.ts).
 * None of the GET endpoints here use `@WrapResponse()`, so these are the
 * raw JSON shapes — no `ApiEnvelope<T>` wrapping.
 *
 * `category` is intentionally typed as [JsonElement]: the backend populates
 * it as a full `{ _id, name, ... }` object for products with a valid
 * category ref, but leaves it as a plain string (or omits it) for products
 * with an invalid/empty category — see `ProductsService.getProducts()`.
 * Parse it defensively in the repository layer rather than assuming one shape.
 */
@Serializable
data class ProductDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val offerPrice: Double? = null,
    val trainerPrice: Double? = null,
    val weight: String? = null,
    val serve: String? = null,
    val isImported: Boolean? = null,
    val inStock: Boolean? = null,
    val flavour: String? = null,
    val company: String? = null,
    val manufacturer: String? = null,
    val howToUse: String? = null,
    val whenToUse: String? = null,
    val images: List<String>? = null,
    val isActive: Boolean? = null,
    val category: JsonElement? = null,
    val isTrending: Boolean? = null,
    val isPopular: Boolean? = null,
    val isRecommended: Boolean? = null,
)

/** Mirrors backend `Category` schema (categories/schemas/category.schema.ts). */
@Serializable
data class CategoryDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
    val description: String? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)
