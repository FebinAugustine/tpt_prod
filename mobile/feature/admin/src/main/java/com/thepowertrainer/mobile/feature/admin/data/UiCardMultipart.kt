package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.UiCardInput
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

/** Shared multipart-building helper for Banners/Offer Cards — both send an
 * identical shape (see UiCardDto/AdminUiCard kdoc), just to different routes. */
internal object UiCardMultipart {
    private val json = Json { ignoreUnknownKeys = true }

    fun payloadBody(input: UiCardInput): RequestBody =
        json.encodeToString(
            UiCardPayload.serializer(),
            UiCardPayload(
                title = input.title,
                subtitle = input.subtitle.ifBlank { null },
                buttonText = input.buttonText.ifBlank { null },
                buttonLink = input.buttonLink.ifBlank { null },
                isActive = input.isActive,
                sortOrder = input.sortOrder,
            ),
        ).toRequestBody("application/json".toMediaType())

    fun imagePart(partName: String, image: PickedImage?): MultipartBody.Part? {
        if (image == null) return null
        val body = image.bytes.toRequestBody(image.mimeType.toMediaType())
        return MultipartBody.Part.createFormData(partName, image.fileName, body)
    }
}
