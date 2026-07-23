package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/** Feature-owned — no shared :core:domain (see root CLAUDE.md Decision #2). */
interface CategoriesAdminRepository {
    suspend fun getCategories(): AppResult<List<AdminCategory>>
    suspend fun addCategory(input: CategoryInput): AppResult<AdminCategory>
    suspend fun updateCategory(id: String, input: CategoryInput): AppResult<AdminCategory>
    suspend fun deleteCategory(id: String): AppResult<Unit>
}
