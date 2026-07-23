package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminUiCard
import com.thepowertrainer.mobile.feature.admin.domain.BannersRepository
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.UiCardInput
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class BannersRepositoryImpl @Inject constructor(
    private val api: BannersApi,
) : BannersRepository {

    override suspend fun getBanners(): AppResult<List<AdminUiCard>> = safeCall {
        AppResult.Success(api.getBanners().map { it.toDomain() })
    }

    override suspend fun addBanner(input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard> = safeCall {
        val body = UiCardMultipart.payloadBody(input)
        val part = UiCardMultipart.imagePart("image", image)
        AppResult.Success(api.addBanner(body, part).toDomain())
    }

    override suspend fun updateBanner(id: String, input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard> = safeCall {
        val body = UiCardMultipart.payloadBody(input)
        val part = UiCardMultipart.imagePart("image", image)
        AppResult.Success(api.updateBanner(id, body, part).toDomain())
    }

    override suspend fun deleteBanner(id: String): AppResult<Unit> = safeCall {
        api.deleteBanner(id)
        AppResult.Success(Unit)
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

    private fun UiCardDto.toDomain() = AdminUiCard(
        id = id ?: "",
        title = title ?: "",
        subtitle = subtitle,
        imageUrl = image,
        buttonText = buttonText,
        buttonLink = buttonLink,
        isActive = isActive ?: true,
        sortOrder = sortOrder ?: 0,
    )
}
