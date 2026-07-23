package com.thepowertrainer.mobile.feature.content.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Routes/shape match `CareersController`/`Career` schema exactly. */
@Serializable
data class CareerDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val department: String? = null,
    val location: String? = null,
    val type: String? = null,
    val description: String? = null,
    val requirements: List<String>? = null,
    val isActive: Boolean? = null,
)

/** Routes/shape match `PressController`/`Press` schema exactly. `type` is
 * either `"press_release"` or `"media_coverage"` (backend's `PressType` enum). */
@Serializable
data class PressDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val type: String? = null,
    val description: String? = null,
    val date: String? = null,
    val publication: String? = null,
    val isActive: Boolean? = null,
)
