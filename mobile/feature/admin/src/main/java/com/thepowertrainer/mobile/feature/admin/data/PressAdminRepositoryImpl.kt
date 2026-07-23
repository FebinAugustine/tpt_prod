package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminPress
import com.thepowertrainer.mobile.feature.admin.domain.PressAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.PressInput
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class PressAdminRepositoryImpl @Inject constructor(
    private val api: PressAdminApi,
) : PressAdminRepository {

    override suspend fun getPress(): AppResult<List<AdminPress>> = safeCall {
        AppResult.Success(api.getPress().map { it.toDomain() })
    }

    override suspend fun addPress(input: PressInput): AppResult<AdminPress> = safeCall {
        AppResult.Success(api.addPress(input.toRequest()).toDomain())
    }

    override suspend fun updatePress(id: String, input: PressInput): AppResult<AdminPress> = safeCall {
        AppResult.Success(api.updatePress(id, input.toRequest()).toDomain())
    }

    override suspend fun deletePress(id: String): AppResult<Unit> = safeCall {
        api.deletePress(id)
        AppResult.Success(Unit)
    }

    private fun PressInput.toRequest() = PressRequest(
        title = title,
        type = type,
        description = description,
        date = date.ifBlank { null },
        publication = publication.ifBlank { null },
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

    private fun PressAdminDto.toDomain() = AdminPress(
        id = id ?: "",
        title = title ?: "",
        type = type ?: "press_release",
        description = description ?: "",
        date = date,
        publication = publication,
        isActive = isActive ?: true,
    )
}
