package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface OfferCardsRepository {
    suspend fun getOfferCards(): AppResult<List<AdminUiCard>>
    suspend fun addOfferCard(input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard>
    suspend fun updateOfferCard(id: String, input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard>
    suspend fun deleteOfferCard(id: String): AppResult<Unit>
}
