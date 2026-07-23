package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminUiCard
import com.thepowertrainer.mobile.feature.admin.domain.OfferCardsRepository
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.UiCardInput
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class OfferCardsRepositoryImpl @Inject constructor(
    private val api: OfferCardsApi,
) : OfferCardsRepository {

    override suspend fun getOfferCards(): AppResult<List<AdminUiCard>> = safeCall {
        AppResult.Success(api.getOfferCards().map { it.toDomain() })
    }

    override suspend fun addOfferCard(input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard> = safeCall {
        val body = UiCardMultipart.payloadBody(input)
        val part = UiCardMultipart.imagePart("image", image)
        AppResult.Success(api.addOfferCard(body, part).toDomain())
    }

    override suspend fun updateOfferCard(id: String, input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard> = safeCall {
        val body = UiCardMultipart.payloadBody(input)
        val part = UiCardMultipart.imagePart("image", image)
        AppResult.Success(api.updateOfferCard(id, body, part).toDomain())
    }

    override suspend fun deleteOfferCard(id: String): AppResult<Unit> = safeCall {
        api.deleteOfferCard(id)
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
