package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface PressAdminRepository {
    suspend fun getPress(): AppResult<List<AdminPress>>
    suspend fun addPress(input: PressInput): AppResult<AdminPress>
    suspend fun updatePress(id: String, input: PressInput): AppResult<AdminPress>
    suspend fun deletePress(id: String): AppResult<Unit>
}
