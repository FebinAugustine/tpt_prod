package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminCategoryOption
import com.thepowertrainer.mobile.feature.admin.domain.AdminProduct
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.ProductInput
import com.thepowertrainer.mobile.feature.admin.domain.ProductsRepository
import kotlinx.serialization.json.Json
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class ProductsRepositoryImpl @Inject constructor(
    private val api: ProductsApi,
) : ProductsRepository {

    private val json = Json { ignoreUnknownKeys = true }

    override suspend fun getProducts(): AppResult<List<AdminProduct>> = safeCall {
        AppResult.Success(api.getProducts().map { it.toDomain() })
    }

    override suspend fun getCategoryOptions(): AppResult<List<AdminCategoryOption>> = safeCall {
        AppResult.Success(
            api.getCategoriesForProducts()
                .mapNotNull { dto -> dto.id?.let { id -> AdminCategoryOption(id, dto.name ?: "") } },
        )
    }

    override suspend fun addProduct(input: ProductInput, newImages: List<PickedImage>): AppResult<AdminProduct> = safeCall {
        val body = input.toPayloadJson().toRequestBody("application/json".toMediaType())
        AppResult.Success(api.addProduct(body, imageParts(newImages)).toDomain())
    }

    override suspend fun updateProduct(
        id: String,
        input: ProductInput,
        keptImageUrls: List<String>,
        newImages: List<PickedImage>,
    ): AppResult<AdminProduct> = safeCall {
        val body = input.toPayloadJson().toRequestBody("application/json".toMediaType())
        val keptUrlsBody = json.encodeToString(ListSerializer(String.serializer()), keptImageUrls)
            .toRequestBody("application/json".toMediaType())
        AppResult.Success(api.updateProduct(id, body, keptUrlsBody, imageParts(newImages)).toDomain())
    }

    override suspend fun deleteProduct(id: String): AppResult<Unit> = safeCall {
        api.deleteProduct(id)
        AppResult.Success(Unit)
    }

    private fun imageParts(images: List<PickedImage>): List<MultipartBody.Part> = images.map { image ->
        val requestBody: RequestBody = image.bytes.toRequestBody(image.mimeType.toMediaType())
        MultipartBody.Part.createFormData("images", image.fileName, requestBody)
    }

    private fun ProductInput.toPayloadJson(): String = json.encodeToString(
        ProductPayload.serializer(),
        ProductPayload(
            name = name,
            description = description.ifBlank { null },
            price = price,
            offerPrice = offerPrice,
            weight = weight.ifBlank { null },
            flavour = flavour.ifBlank { null },
            company = company.ifBlank { null },
            manufacturer = manufacturer.ifBlank { null },
            category = categoryId,
            inStock = inStock,
            isTrending = isTrending,
            isPopular = isPopular,
            isRecommended = isRecommended,
        ),
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

    private fun ProductAdminDto.toDomain(): AdminProduct {
        val (categoryId, categoryName) = categoryRef()
        return AdminProduct(
            id = id ?: "",
            name = name ?: "",
            description = description,
            price = price ?: 0.0,
            offerPrice = offerPrice,
            weight = weight,
            flavour = flavour,
            company = company,
            manufacturer = manufacturer,
            images = images ?: emptyList(),
            inStock = inStock ?: true,
            isTrending = isTrending ?: false,
            isPopular = isPopular ?: false,
            isRecommended = isRecommended ?: false,
            categoryId = categoryId,
            categoryName = categoryName,
        )
    }
}
