package com.thepowertrainer.mobile.feature.content.domain

data class Career(
    val id: String,
    val title: String,
    val department: String,
    val location: String,
    val type: String,
    val description: String,
    val requirements: List<String>,
)

enum class PressType { PRESS_RELEASE, MEDIA_COVERAGE, UNKNOWN }

data class PressItem(
    val id: String,
    val title: String,
    val type: PressType,
    val description: String,
    val date: String,
    val publication: String?,
)
