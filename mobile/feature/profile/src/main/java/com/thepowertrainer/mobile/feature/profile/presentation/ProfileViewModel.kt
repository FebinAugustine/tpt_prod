package com.thepowertrainer.mobile.feature.profile.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.network.TokenStorage
import com.thepowertrainer.mobile.feature.profile.domain.ChangePasswordInput
import com.thepowertrainer.mobile.feature.profile.domain.ProfileInput
import com.thepowertrainer.mobile.feature.profile.domain.ProfileRepository
import com.thepowertrainer.mobile.feature.profile.domain.ProfileUser
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException
import javax.inject.Inject

data class ProfileUiState(
    val isLoading: Boolean = true,
    val user: ProfileUser? = null,
    val isEditing: Boolean = false,
    val error: String? = null,
    val isSavingProfile: Boolean = false,
    val passwordError: String? = null,
    val passwordSuccess: String? = null,
    val isChangingPassword: Boolean = false,
    val showDeleteConfirm: Boolean = false,
    val isDeletingAccount: Boolean = false,
    val loggedOut: Boolean = false,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val repository: ProfileRepository,
    private val tokenStorage: TokenStorage,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getProfile()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, user = result.data)
                is AppResult.Error -> {
                    // A 404 here means the JWT's user id genuinely doesn't
                    // exist anymore (deleted account, or a token cached from
                    // a different backend/DB than the one currently running
                    // — see root CLAUDE.md's "Profile 404" note). Previously
                    // this just showed the error message forever with no way
                    // out; now it clears the stale session and routes back
                    // to Login automatically so the user can sign in fresh
                    // instead of being stuck on a dead-end screen.
                    val isStaleSession = (result.cause as? HttpException)?.code() == 404
                    if (isStaleSession) {
                        tokenStorage.clear()
                        _uiState.value = _uiState.value.copy(isLoading = false, loggedOut = true)
                    } else {
                        _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
                    }
                }
            }
        }
    }

    fun setEditing(editing: Boolean) {
        _uiState.value = _uiState.value.copy(isEditing = editing)
    }

    fun saveProfile(input: ProfileInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSavingProfile = true, error = null)
            when (val result = repository.updateProfile(input)) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(
                    isSavingProfile = false,
                    isEditing = false,
                    user = result.data,
                )
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSavingProfile = false, error = result.message)
            }
        }
    }

    fun changePassword(input: ChangePasswordInput) {
        if (input.newPassword.length < 8) {
            _uiState.value = _uiState.value.copy(passwordError = "New password must be at least 8 characters")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isChangingPassword = true, passwordError = null, passwordSuccess = null)
            when (val result = repository.changePassword(input)) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(
                    isChangingPassword = false,
                    passwordSuccess = "Password updated successfully",
                )
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isChangingPassword = false, passwordError = result.message)
            }
        }
    }

    fun requestDeleteAccount() {
        _uiState.value = _uiState.value.copy(showDeleteConfirm = true)
    }

    fun dismissDeleteAccount() {
        _uiState.value = _uiState.value.copy(showDeleteConfirm = false)
    }

    fun confirmDeleteAccount() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isDeletingAccount = true)
            when (val result = repository.deleteAccount()) {
                is AppResult.Success -> {
                    tokenStorage.clear()
                    _uiState.value = _uiState.value.copy(isDeletingAccount = false, loggedOut = true)
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isDeletingAccount = false, error = result.message)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            tokenStorage.clear()
            _uiState.value = _uiState.value.copy(loggedOut = true)
        }
    }
}
