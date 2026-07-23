package com.thepowertrainer.mobile.feature.addresses.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AddressDto(
    @SerialName("_id") val id: String,
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean = false,
)

@Serializable
data class AddressRequest(
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean = false,
)
