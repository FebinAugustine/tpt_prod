package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Matches `CategoriesController`/`AddCategoryDto` exactly. */
@Serializable
data class CategoryAdminFullDto(
    @SerialName("_id") val id: String? = null,
    val name: String? = null,
    val description: String? = null,
    val isActive: Boolean? = null,
    val sortOrder: Int? = null,
)

@Serializable
data class CategoryRequest(
    val name: String,
    val description: String? = null,
    val isActive: Boolean = true,
    val sortOrder: Int = 0,
)
