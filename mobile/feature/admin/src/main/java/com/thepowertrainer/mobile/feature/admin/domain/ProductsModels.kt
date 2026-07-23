package com.thepowertrainer.mobile.feature.admin.domain

data class AdminProduct(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val offerPrice: Double?,
    val weight: String?,
    val flavour: String?,
    val company: String?,
    val manufacturer: String?,
    val images: List<String>,
    val inStock: Boolean,
    val isTrending: Boolean,
    val isPopular: Boolean,
    val isRecommended: Boolean,
    val categoryId: String?,
    val categoryName: String?,
)

data class AdminCategoryOption(val id: String, val name: String)

data class ProductInput(
    val name: String,
    val description: String,
    val price: Double,
    val offerPrice: Double?,
    val weight: String,
    val flavour: String,
    val company: String,
    val manufacturer: String,
    val categoryId: String?,
    val inStock: Boolean,
    val isTrending: Boolean,
    val isPopular: Boolean,
    val isRecommended: Boolean,
)
