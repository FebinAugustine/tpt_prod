package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive

/** Read shape matches `ProductsController.getProducts()` — same
 * "category can be a populated object or a bare id string" quirk documented
 * on :feature:catalog's ProductDto; :feature:admin keeps its own copy rather
 * than depending on :feature:catalog (root CLAUDE.md Decision #2). */
@Serializable
data class ProductAdminDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val offerPrice: Double? = null,
    val weight: String? = null,
    val flavour: String? = null,
    val company: String? = null,
    val manufacturer: String? = null,
    val images: List<String>? = null,
    val inStock: Boolean? = null,
    val isTrending: Boolean? = null,
    val isPopular: Boolean? = null,
    val isRecommended: Boolean? = null,
    val category: JsonElement? = null,
) {
    fun categoryRef(): Pair<String?, String?> = when (val c = category) {
        null -> null to null
        is JsonObject -> {
            val id = (c["_id"] as? JsonPrimitive)?.let { runCatching { it.jsonPrimitive.content }.getOrNull() }
            val name = (c["name"] as? JsonPrimitive)?.let { runCatching { it.jsonPrimitive.content }.getOrNull() }
            id to name
        }
        is JsonPrimitive -> runCatching { c.jsonPrimitive.content }.getOrNull() to null
        else -> null to null
    }
}

@Serializable
data class CategoryAdminDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
)

/** Sent as a multipart "product" JSON part — matches the backend's
 * `AddProductDto` (only the subset the mobile admin form edits; image
 * upload is a known follow-up, see root CLAUDE.md). */
@Serializable
data class ProductPayload(
    val name: String,
    val description: String? = null,
    val price: Double,
    val offerPrice: Double? = null,
    val weight: String? = null,
    val flavour: String? = null,
    val company: String? = null,
    val manufacturer: String? = null,
    val category: String? = null,
    val inStock: Boolean = true,
    val isTrending: Boolean = false,
    val isPopular: Boolean = false,
    val isRecommended: Boolean = false,
)
