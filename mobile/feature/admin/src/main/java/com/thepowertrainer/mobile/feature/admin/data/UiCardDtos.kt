package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Shared response shape for both Banners and Offer Cards — see
 * `AdminUiCard`'s kdoc for why these are field-identical on the backend. */
@Serializable
data class UiCardDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val subtitle: String? = null,
    val image: String? = null,
    val buttonText: String? = null,
    val buttonLink: String? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)

@Serializable
data class UiCardPayload(
    val title: String,
    val subtitle: String? = null,
    val buttonText: String? = null,
    val buttonLink: String? = null,
    val isActive: Boolean = true,
    val sortOrder: Int = 0,
)
