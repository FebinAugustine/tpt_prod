package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminUpiSettings
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.SettingsAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.UpiSettingsInput
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class SettingsAdminRepositoryImpl @Inject constructor(
    private val api: SettingsAdminApi,
) : SettingsAdminRepository {

    override suspend fun getUpiSettings(): AppResult<AdminUpiSettings?> = safeCall {
        val dto = api.getUpiSettings()
        AppResult.Success(
            if (dto == null || dto.upiId.isNullOrBlank()) null
            else AdminUpiSettings(upiId = dto.upiId, qrCodeUrl = dto.qrCodeUrl, merchantName = dto.merchantName),
        )
    }

    override suspend fun setUpiSettings(input: UpiSettingsInput, image: PickedImage?): AppResult<Unit> = safeCall {
        val upiIdPart = textPart(input.upiId)
        val merchantNamePart = textPart(input.merchantName)
        val imagePart = image?.let {
            MultipartBody.Part.createFormData("qrCodeImage", it.fileName, it.bytes.toRequestBody(it.mimeType.toMediaType()))
        }
        api.setUpiSettings(upiIdPart, merchantNamePart, null, imagePart)
        AppResult.Success(Unit)
    }

    private fun textPart(value: String): RequestBody = value.toRequestBody("text/plain".toMediaType())

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.message() ?: "Server error", e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }
}
