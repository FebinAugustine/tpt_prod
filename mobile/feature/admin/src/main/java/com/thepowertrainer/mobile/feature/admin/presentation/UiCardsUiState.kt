package com.thepowertrainer.mobile.feature.admin.presentation

import com.thepowertrainer.mobile.feature.admin.domain.AdminUiCard

/** Shared UI state shape for BannersViewModel/OfferCardsViewModel — same
 * fields, two separate ViewModel classes since each is bound to a different
 * Hilt-injected repository (Banners vs Offer Cards). */
data class UiCardsUiState(
    val isLoading: Boolean = true,
    val items: List<AdminUiCard> = emptyList(),
    val error: String? = null,
    val showAddForm: Boolean = false,
    val editingCard: AdminUiCard? = null,
    val isSaving: Boolean = false,
    val formError: String? = null,
)
