package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminCategory
import com.thepowertrainer.mobile.feature.admin.domain.CategoriesAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.CategoryInput
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class CategoriesAdminRepositoryImpl @Inject constructor(
    private val api: CategoriesAdminApi,
) : CategoriesAdminRepository {

    override suspend fun getCategories(): AppResult<List<AdminCategory>> = safeCall {
        AppResult.Success(api.getCategories().map { it.toDomain() })
    }

    override suspend fun addCategory(input: CategoryInput): AppResult<AdminCategory> = safeCall {
        AppResult.Success(api.addCategory(input.toRequest()).toDomain())
    }

    override suspend fun updateCategory(id: String, input: CategoryInput): AppResult<AdminCategory> = safeCall {
        AppResult.Success(api.updateCategory(id, input.toRequest()).toDomain())
    }

    override suspend fun deleteCategory(id: String): AppResult<Unit> = safeCall {
        api.deleteCategory(id)
        AppResult.Success(Unit)
    }

    private fun CategoryInput.toRequest() = CategoryRequest(
        name = name,
        description = description.ifBlank { null },
        isActive = isActive,
        sortOrder = sortOrder,
    )

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.message() ?: "Server error", e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun CategoryAdminFullDto.toDomain() = AdminCategory(
        id = id ?: "",
        name = name ?: "",
        description = description,
        isActive = isActive ?: true,
        sortOrder = sortOrder ?: 0,
    )
}
