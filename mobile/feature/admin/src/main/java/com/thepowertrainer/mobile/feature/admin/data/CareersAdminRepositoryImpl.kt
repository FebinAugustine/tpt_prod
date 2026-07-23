package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminCareer
import com.thepowertrainer.mobile.feature.admin.domain.CareerInput
import com.thepowertrainer.mobile.feature.admin.domain.CareersAdminRepository
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class CareersAdminRepositoryImpl @Inject constructor(
    private val api: CareersAdminApi,
) : CareersAdminRepository {

    override suspend fun getCareers(): AppResult<List<AdminCareer>> = safeCall {
        AppResult.Success(api.getCareers().map { it.toDomain() })
    }

    override suspend fun addCareer(input: CareerInput): AppResult<AdminCareer> = safeCall {
        AppResult.Success(api.addCareer(input.toRequest()).toDomain())
    }

    override suspend fun updateCareer(id: String, input: CareerInput): AppResult<AdminCareer> = safeCall {
        AppResult.Success(api.updateCareer(id, input.toRequest()).toDomain())
    }

    override suspend fun deleteCareer(id: String): AppResult<Unit> = safeCall {
        api.deleteCareer(id)
        AppResult.Success(Unit)
    }

    private fun CareerInput.toRequest() = CareerRequest(
        title = title,
        department = department,
        location = location,
        type = type,
        description = description,
        requirements = requirements,
        isActive = isActive,
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

    private fun CareerAdminDto.toDomain() = AdminCareer(
        id = id ?: "",
        title = title ?: "",
        department = department ?: "",
        location = location ?: "",
        type = type ?: "",
        description = description ?: "",
        requirements = requirements ?: emptyList(),
        isActive = isActive ?: true,
    )
}
