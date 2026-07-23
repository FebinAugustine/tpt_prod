package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface CareersAdminRepository {
    suspend fun getCareers(): AppResult<List<AdminCareer>>
    suspend fun addCareer(input: CareerInput): AppResult<AdminCareer>
    suspend fun updateCareer(id: String, input: CareerInput): AppResult<AdminCareer>
    suspend fun deleteCareer(id: String): AppResult<Unit>
}
