package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.BackupRepository
import com.thepowertrainer.mobile.feature.admin.domain.ExportDateRange
import com.thepowertrainer.mobile.feature.admin.domain.ExportFormat
import com.thepowertrainer.mobile.feature.admin.domain.ExportType
import com.thepowertrainer.mobile.feature.admin.domain.ExportedFile
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BackupSectionState(
    val dateRange: ExportDateRange = ExportDateRange.ALL,
    val isExporting: Boolean = false,
    val error: String? = null,
)

data class BackupUiState(
    val sections: Map<ExportType, BackupSectionState> = ExportType.entries.associateWith { BackupSectionState() },
    /** Non-empty once an export (or the last successful legs of an "All
     * Data" export) is ready — the screen observes this once, launches
     * Android's share sheet (single file → `ACTION_SEND`, multiple →
     * `ACTION_SEND_MULTIPLE`, mirroring "All Data" producing 4 separate
     * files just like the web version), then calls [BackupViewModel.onFilesShared]
     * to clear it so it doesn't re-fire on recomposition. */
    val filesToShare: List<ExportedFile> = emptyList(),
)

/** Mobile equivalent of the frontend's `BackupSection.tsx` + `admin-dashboard`'s
 * "Data Backup" block — lets an admin export Users/Products/Orders/Categories
 * (or all four) as JSON/Excel/PDF, per a date-range filter, then share/save
 * the resulting file via Android's share sheet (there's no browser download
 * manager to hand a Blob to on mobile, so a share sheet is the closest
 * equivalent action). Was previously missing entirely on mobile — closes
 * that gap. */
@HiltViewModel
class BackupViewModel @Inject constructor(
    private val repository: BackupRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BackupUiState())
    val uiState: StateFlow<BackupUiState> = _uiState.asStateFlow()

    fun onDateRangeChanged(type: ExportType, range: ExportDateRange) {
        updateSection(type) { it.copy(dateRange = range) }
    }

    fun export(type: ExportType, format: ExportFormat) {
        viewModelScope.launch {
            val dateRange = _uiState.value.sections[type]?.dateRange ?: ExportDateRange.ALL
            updateSection(type) { it.copy(isExporting = true, error = null) }

            val exported = mutableListOf<ExportedFile>()
            var lastError: String? = null

            // "All Data" has no single combined file on the backend — same
            // as the web's exportAllData, it's 4 separate export calls.
            val typesToExport = if (type == ExportType.ALL) {
                listOf(ExportType.USERS, ExportType.PRODUCTS, ExportType.CATEGORIES, ExportType.ORDERS)
            } else {
                listOf(type)
            }

            for (t in typesToExport) {
                when (val result = repository.export(t, format, dateRange)) {
                    is AppResult.Success -> exported += result.data
                    is AppResult.Error -> lastError = result.message
                }
            }

            updateSection(type) { it.copy(isExporting = false, error = if (exported.isEmpty()) lastError else null) }
            if (exported.isNotEmpty()) {
                _uiState.value = _uiState.value.copy(filesToShare = exported)
            }
        }
    }

    fun onFilesShared() {
        _uiState.value = _uiState.value.copy(filesToShare = emptyList())
    }

    private inline fun updateSection(type: ExportType, transform: (BackupSectionState) -> BackupSectionState) {
        val current = _uiState.value.sections[type] ?: BackupSectionState()
        _uiState.value = _uiState.value.copy(sections = _uiState.value.sections + (type to transform(current)))
    }
}
