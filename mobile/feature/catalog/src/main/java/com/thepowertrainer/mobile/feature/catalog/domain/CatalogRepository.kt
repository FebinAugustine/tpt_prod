package com.thepowertrainer.mobile.feature.catalog.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/** Feature-owned — no shared :core:domain (see root CLAUDE.md Decision #2). */
interface CatalogRepository {
    suspend fun getProducts(): AppResult<List<Product>>
    suspend fun getProductById(id: String): AppResult<Product>
    suspend fun searchProducts(query: String, limit: Int = 10): AppResult<List<Product>>
    suspend fun getCategories(): AppResult<List<Category>>
}
