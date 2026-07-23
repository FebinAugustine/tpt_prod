package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/** Feature-owned — no shared :core:domain (see root CLAUDE.md Decision #2). */
interface ProductsRepository {
    suspend fun getProducts(): AppResult<List<AdminProduct>>
    suspend fun getCategoryOptions(): AppResult<List<AdminCategoryOption>>

    /** New products have no existing images to keep, only ones the admin
     * just picked (up to 8, matching the backend's file limit). */
    suspend fun addProduct(input: ProductInput, newImages: List<PickedImage>): AppResult<AdminProduct>

    /** [keptImageUrls] is the authoritative list of the product's *existing*
     * Cloudinary image URLs the admin did not remove — sent as-is to the
     * backend's `keptImageUrls` field, which replaces the images array
     * wholesale (see products.service.ts's updateProduct). An empty list
     * means "remove all existing images". [newImages] are appended after. */
    suspend fun updateProduct(
        id: String,
        input: ProductInput,
        keptImageUrls: List<String>,
        newImages: List<PickedImage>,
    ): AppResult<AdminProduct>

    suspend fun deleteProduct(id: String): AppResult<Unit>
}
