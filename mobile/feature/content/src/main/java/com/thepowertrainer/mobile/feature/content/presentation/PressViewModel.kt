package com.thepowertrainer.mobile.feature.content.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.content.domain.ContentRepository
import com.thepowertrainer.mobile.feature.content.domain.PressItem
import com.thepowertrainer.mobile.feature.content.domain.PressType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PressUiState(
    val isLoading: Boolean = true,
    val pressReleases: List<PressItem> = emptyList(),
    val mediaCoverage: List<PressItem> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class PressViewModel @Inject constructor(
    private val repository: ContentRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PressUiState())
    val uiState: StateFlow<PressUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getPress()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    pressReleases = result.data.filter { it.type == PressType.PRESS_RELEASE },
                    mediaCoverage = result.data.filter { it.type == PressType.MEDIA_COVERAGE },
                )
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }
}
