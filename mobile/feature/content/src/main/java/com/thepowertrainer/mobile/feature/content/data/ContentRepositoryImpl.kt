package com.thepowertrainer.mobile.feature.content.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.content.domain.Career
import com.thepowertrainer.mobile.feature.content.domain.ContentRepository
import com.thepowertrainer.mobile.feature.content.domain.PressItem
import com.thepowertrainer.mobile.feature.content.domain.PressType
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class ContentRepositoryImpl @Inject constructor(
    private val api: ContentApi,
) : ContentRepository {

    override suspend fun getCareers(): AppResult<List<Career>> = safeCall {
        AppResult.Success(api.getCareers().map { it.toDomain() })
    }

    override suspend fun getPress(): AppResult<List<PressItem>> = safeCall {
        AppResult.Success(api.getPress().map { it.toDomain() })
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

    private fun CareerDto.toDomain() = Career(
        id = id ?: "",
        title = title ?: "",
        department = department ?: "",
        location = location ?: "",
        type = type ?: "",
        description = description ?: "",
        requirements = requirements ?: emptyList(),
    )

    private fun PressDto.toDomain() = PressItem(
        id = id ?: "",
        title = title ?: "",
        type = when (type) {
            "press_release" -> PressType.PRESS_RELEASE
            "media_coverage" -> PressType.MEDIA_COVERAGE
            else -> PressType.UNKNOWN
        },
        description = description ?: "",
        date = date ?: "",
        publication = publication,
    )
}
