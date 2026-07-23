package com.thepowertrainer.mobile.feature.admin.domain

data class AdminPress(
    val id: String,
    val title: String,
    val type: String,
    val description: String,
    val date: String?,
    val publication: String?,
    val isActive: Boolean,
)

data class PressInput(
    val title: String,
    val type: String,
    val description: String,
    val date: String,
    val publication: String,
    val isActive: Boolean,
)

val PRESS_TYPE_OPTIONS = listOf("press_release", "media_coverage")
