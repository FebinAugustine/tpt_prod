package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface SettingsAdminRepository {
    suspend fun getUpiSettings(): AppResult<AdminUpiSettings?>
    suspend fun setUpiSettings(input: UpiSettingsInput, image: PickedImage?): AppResult<Unit>
}
