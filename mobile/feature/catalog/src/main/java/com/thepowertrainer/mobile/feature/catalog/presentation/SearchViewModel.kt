package com.thepowertrainer.mobile.feature.catalog.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.catalog.domain.CatalogRepository
import com.thepowertrainer.mobile.feature.catalog.domain.Product
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchUiState(
    val query: String = "",
    val isLoading: Boolean = false,
    val hasSearched: Boolean = false,
    val results: List<Product> = emptyList(),
    val error: String? = null,
)

/**
 * Mirrors the frontend's dedicated `/search?query=` page: hits the real
 * `GET /products/search` backend endpoint (full catalog text search), as
 * opposed to :feature:catalog's grid screen, which only client-side
 * filters the already-loaded product list.
 */
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val repository: CatalogRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    private var debounceJob: Job? = null

    fun onQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(query = query)
        debounceJob?.cancel()
        if (query.isBlank()) {
            _uiState.value = _uiState.value.copy(results = emptyList(), hasSearched = false, isLoading = false)
            return
        }
        debounceJob = viewModelScope.launch {
            delay(400)
            search(query)
        }
    }

    fun onSearchSubmit() {
        debounceJob?.cancel()
        val query = _uiState.value.query
        if (query.isNotBlank()) {
            viewModelScope.launch { search(query) }
        }
    }

    private suspend fun search(query: String) {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        when (val result = repository.searchProducts(query, limit = 20)) {
            is AppResult.Success -> _uiState.value = _uiState.value.copy(
                isLoading = false,
                hasSearched = true,
                results = result.data,
            )
            is AppResult.Error -> _uiState.value = _uiState.value.copy(
                isLoading = false,
                hasSearched = true,
                error = result.message,
            )
        }
    }
}
