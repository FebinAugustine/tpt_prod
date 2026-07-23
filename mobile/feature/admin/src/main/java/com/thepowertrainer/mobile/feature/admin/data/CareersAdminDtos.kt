package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Matches `CareersController`/`Career` schema exactly — admin's own copy,
 * not shared with :feature:content's read-only `CareerDto` (Decision #2). */
@Serializable
data class CareerAdminDto(
    @SerialName("_id") val id: String? = null,
    val title: String? = null,
    val department: String? = null,
    val location: String? = null,
    val type: String? = null,
    val description: String? = null,
    val requirements: List<String>? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)

@Serializable
data class CareerRequest(
    val title: String,
    val department: String,
    val location: String,
    val type: String,
    val description: String,
    val requirements: List<String> = emptyList(),
    val isActive: Boolean = true,
    val sortOrder: Int = 0,
)
