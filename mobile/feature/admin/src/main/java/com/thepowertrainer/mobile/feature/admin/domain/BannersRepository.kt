package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface BannersRepository {
    suspend fun getBanners(): AppResult<List<AdminUiCard>>
    suspend fun addBanner(input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard>
    suspend fun updateBanner(id: String, input: UiCardInput, image: PickedImage?): AppResult<AdminUiCard>
    suspend fun deleteBanner(id: String): AppResult<Unit>
}
