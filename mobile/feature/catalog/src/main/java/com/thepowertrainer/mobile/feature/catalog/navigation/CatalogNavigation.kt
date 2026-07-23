package com.thepowertrainer.mobile.feature.catalog.navigation

object CatalogRoutes {
    const val PRODUCT_LIST = "catalog/products"
    private const val PRODUCT_DETAIL_BASE = "catalog/products/detail"
    const val PRODUCT_DETAIL = "$PRODUCT_DETAIL_BASE/{productId}"
    const val PRODUCT_ID_ARG = "productId"
    const val SEARCH = "catalog/search"

    fun productDetail(productId: String) = "$PRODUCT_DETAIL_BASE/$productId"
}
