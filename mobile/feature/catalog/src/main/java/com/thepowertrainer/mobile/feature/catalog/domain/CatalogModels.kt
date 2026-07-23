package com.thepowertrainer.mobile.feature.catalog.domain

data class Category(
    val id: String,
    val name: String,
    val description: String?,
)

data class Product(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val offerPrice: Double?,
    val trainerPrice: Double?,
    val weight: String?,
    val serve: String?,
    val flavour: String?,
    val company: String?,
    val manufacturer: String?,
    val howToUse: String?,
    val whenToUse: String?,
    val isImported: Boolean,
    val images: List<String>,
    val inStock: Boolean,
    val isTrending: Boolean,
    val isPopular: Boolean,
    val isRecommended: Boolean,
    val categoryId: String?,
    val categoryName: String?,
) {
    /** Effective selling price — offerPrice when present and lower, otherwise price. */
    val displayPrice: Double get() = offerPrice?.takeIf { it in 0.0..price } ?: price
    val hasDiscount: Boolean get() = offerPrice != null && offerPrice < price

    /** Matches frontend's `getDiscount()` — whole-percent markdown for the ribbon/badge. */
    val discountPercent: Int
        get() = if (hasDiscount && price > 0) (((price - displayPrice) / price) * 100).toInt() else 0
}
