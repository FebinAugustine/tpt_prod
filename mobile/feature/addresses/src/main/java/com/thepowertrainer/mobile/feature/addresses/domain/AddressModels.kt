package com.thepowertrainer.mobile.feature.addresses.domain

data class Address(
    val id: String,
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean,
)

data class AddressInput(
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean = false,
)

/** Mirrors the frontend's hardcoded 3-address cap (addresses/page.tsx, profile/page.tsx). */
const val MAX_ADDRESSES = 3
