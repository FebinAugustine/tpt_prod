package com.thepowertrainer.mobile.feature.admin.domain

/**
 * Shared shape for Banners and Offer Cards — the backend's `AddBannerDto`
 * and `AddOfferCardDto` are field-for-field identical (title/subtitle/image/
 * buttonText/buttonLink/isActive/sortOrder), just served from different
 * `UIManagerController` routes (`/uimanager/banners` vs `/uimanager/offer-cards`).
 * Kept as one shared model within :feature:admin (not exported to other
 * features) to avoid duplicating an identical shape twice.
 */
data class AdminUiCard(
    val id: String,
    val title: String,
    val subtitle: String?,
    val imageUrl: String?,
    val buttonText: String?,
    val buttonLink: String?,
    val isActive: Boolean,
    val sortOrder: Int,
)

data class UiCardInput(
    val title: String,
    val subtitle: String,
    val buttonText: String,
    val buttonLink: String,
    val isActive: Boolean,
    val sortOrder: Int,
)

/** Raw bytes for a newly picked image, read from the content URI by the
 * screen (which has Context) before being handed down to the repository —
 * keeps the repository layer platform-plumbing-free beyond okhttp types. */
data class PickedImage(val bytes: ByteArray, val fileName: String, val mimeType: String)
