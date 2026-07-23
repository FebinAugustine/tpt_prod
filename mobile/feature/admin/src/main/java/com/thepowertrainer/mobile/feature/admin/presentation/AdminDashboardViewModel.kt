package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.network.TokenStorage
import com.thepowertrainer.mobile.feature.admin.domain.AdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.DashboardStats
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AdminDashboardUiState(
    val isLoading: Boolean = true,
    val stats: DashboardStats? = null,
    val error: String? = null,
    val loggedOut: Boolean = false,
)

@HiltViewModel
class AdminDashboardViewModel @Inject constructor(
    private val repository: AdminRepository,
    private val tokenStorage: TokenStorage,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminDashboardUiState())
    val uiState: StateFlow<AdminDashboardUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getDashboardStats()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, stats = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    /** Same local-only pattern as `:feature:profile`'s `ProfileViewModel.logout()`
     * — clears the token pair from `TokenStorage` directly rather than hitting a
     * backend `/auth/logout` endpoint (no cross-feature dependency on
     * `:feature:auth` needed for this, per root CLAUDE.md Decision #2). */
    fun logout() {
        viewModelScope.launch {
            tokenStorage.clear()
            _uiState.value = _uiState.value.copy(loggedOut = true)
        }
    }
}
