package com.thepowertrainer.mobile.feature.admin.domain

data class AdminCareer(
    val id: String,
    val title: String,
    val department: String,
    val location: String,
    val type: String,
    val description: String,
    val requirements: List<String>,
    val isActive: Boolean,
)

data class CareerInput(
    val title: String,
    val department: String,
    val location: String,
    val type: String,
    val description: String,
    val requirements: List<String>,
    val isActive: Boolean,
)
