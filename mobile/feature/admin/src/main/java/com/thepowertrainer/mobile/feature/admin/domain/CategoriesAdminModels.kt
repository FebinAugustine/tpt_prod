package com.thepowertrainer.mobile.feature.admin.domain

data class AdminCategory(
    val id: String,
    val name: String,
    val description: String?,
    val isActive: Boolean,
    val sortOrder: Int,
)

data class CategoryInput(
    val name: String,
    val description: String,
    val isActive: Boolean,
    val sortOrder: Int,
)
