package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Matches `PressController`/`Press` schema exactly — admin's own copy, not
 * shared with :feature:content's read-only `PressDto` (Decision #2). `type`
 * is the raw backend enum string (`"press_release"` / `"media_coverage"`). */
@Serializable
data class PressAdminDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val type: String? = null,
    val description: String? = null,
    val date: String? = null,
    val publication: String? = null,
    val isActive: Boolean? = null,
)

@Serializable
data class PressRequest(
    val title: String,
    val type: String,
    val description: String,
    val date: String? = null,
    val publication: String? = null,
    val isActive: Boolean = true,
)
