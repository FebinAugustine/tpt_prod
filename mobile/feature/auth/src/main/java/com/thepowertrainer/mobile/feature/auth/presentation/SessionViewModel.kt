package com.thepowertrainer.mobile.feature.auth.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.network.TokenStorage
import com.thepowertrainer.mobile.feature.auth.domain.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Resolved once at app start so the nav host can pick Home vs. Login as the real destination. */
enum class SessionState { LOADING, LOGGED_IN, LOGGED_OUT }

@HiltViewModel
class SessionViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val tokenStorage: TokenStorage,
) : ViewModel() {

    private val _sessionState = MutableStateFlow(SessionState.LOADING)
    val sessionState: StateFlow<SessionState> = _sessionState.asStateFlow()

    /** Only meaningful once [sessionState] is [SessionState.LOGGED_IN] — lets
     * the nav host send an already-logged-in admin straight to the Admin
     * Dashboard on app relaunch, not the customer Home feed. */
    private val _isAdmin = MutableStateFlow(false)
    val isAdmin: StateFlow<Boolean> = _isAdmin.asStateFlow()

    init {
        viewModelScope.launch {
            if (authRepository.isLoggedIn()) {
                _isAdmin.value = tokenStorage.getRole() == "admin"
                _sessionState.value = SessionState.LOGGED_IN
            } else {
                _sessionState.value = SessionState.LOGGED_OUT
            }
        }
    }
}
