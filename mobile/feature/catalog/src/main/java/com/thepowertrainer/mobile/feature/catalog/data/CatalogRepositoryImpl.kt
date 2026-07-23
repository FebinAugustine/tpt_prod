package com.thepowertrainer.mobile.feature.catalog.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.catalog.data.dto.CategoryDto
import com.thepowertrainer.mobile.feature.catalog.data.dto.ProductDto
import com.thepowertrainer.mobile.feature.catalog.domain.Category
import com.thepowertrainer.mobile.feature.catalog.domain.CatalogRepository
import com.thepowertrainer.mobile.feature.catalog.domain.Product
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class CatalogRepositoryImpl @Inject constructor(
    private val api: CatalogApi,
) : CatalogRepository {

    override suspend fun getProducts(): AppResult<List<Product>> = safeCall {
        AppResult.Success(api.getProducts().map { it.toDomain() })
    }

    override suspend fun getProductById(id: String): AppResult<Product> = safeCall {
        AppResult.Success(api.getProductById(id).toDomain())
    }

    override suspend fun searchProducts(query: String, limit: Int): AppResult<List<Product>> = safeCall {
        if (query.isBlank()) return AppResult.Success(emptyList())
        AppResult.Success(api.searchProducts(query, limit).map { it.toDomain() })
    }

    override suspend fun getCategories(): AppResult<List<Category>> = safeCall {
        AppResult.Success(api.getCategories().map { it.toDomain() })
    }

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.message() ?: "Server error", e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun CategoryDto.toDomain(): Category = Category(
        id = id ?: "",
        name = name ?: "",
        description = description,
    )

    private fun ProductDto.toDomain(): Product {
        val (categoryId, categoryName) = category.parseCategoryRef()
        return Product(
            id = id ?: "",
            name = name ?: "",
            description = description,
            price = price ?: 0.0,
            offerPrice = offerPrice,
            trainerPrice = trainerPrice,
            weight = weight,
            serve = serve,
            flavour = flavour,
            company = company,
            manufacturer = manufacturer,
            howToUse = howToUse,
            whenToUse = whenToUse,
            isImported = isImported ?: false,
            images = images ?: emptyList(),
            inStock = inStock ?: true,
            isTrending = isTrending ?: false,
            isPopular = isPopular ?: false,
            isRecommended = isRecommended ?: false,
            categoryId = categoryId,
            categoryName = categoryName,
        )
    }

    /**
     * The backend populates `category` as a full `{ _id, name }` object for
     * products with a valid category ref, but as a plain ObjectId string (or
     * omits it) otherwise — see ProductDto's kdoc. Handle both without
     * throwing.
     */
    private fun JsonElement?.parseCategoryRef(): Pair<String?, String?> {
        return when (this) {
            null -> null to null
            is JsonObject -> {
                val id = (this["_id"] as? JsonPrimitive)?.contentOrNullSafe()
                val name = (this["name"] as? JsonPrimitive)?.contentOrNullSafe()
                id to name
            }
            is JsonPrimitive -> this.contentOrNullSafe() to null
            else -> null to null
        }
    }

    private fun JsonPrimitive.contentOrNullSafe(): String? =
        runCatching { jsonPrimitive.content }.getOrNull()
}
