package com.thepowertrainer.mobile.feature.admin.presentation

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.core.designsystem.theme.Sky
import com.thepowertrainer.mobile.feature.admin.domain.ExportDateRange
import com.thepowertrainer.mobile.feature.admin.domain.ExportFormat
import com.thepowertrainer.mobile.feature.admin.domain.ExportType
import com.thepowertrainer.mobile.feature.admin.domain.ExportedFile

/**
 * Mirrors the frontend's admin-dashboard "Data Backup" section — one card
 * per export type (Users/Products/Orders/Categories/All Data), each with a
 * date-range picker and JSON/Excel/PDF export buttons. Previously entirely
 * missing on mobile (see root CLAUDE.md's admin feature-parity audit,
 * 2026-07-23).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BackupRoute(onBack: () -> Unit, viewModel: BackupViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(uiState.filesToShare) {
        if (uiState.filesToShare.isEmpty()) return@LaunchedEffect
        val files = uiState.filesToShare
        val intent = if (files.size == 1) {
            buildSingleShareIntent(files.first())
        } else {
            buildMultiShareIntent(files)
        }
        context.startActivity(Intent.createChooser(intent, "Share export"))
        viewModel.onFilesShared()
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Backup & Export", fontWeight = FontWeight.Bold) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )

        Text(
            "Export data in JSON, Excel, or PDF format for backup purposes.",
            style = MaterialTheme.typography.bodySmall,
            color = Slate400,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        )

        LazyColumn(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(ExportType.entries) { type ->
                val sectionState = uiState.sections[type] ?: BackupSectionState()
                BackupCard(
                    type = type,
                    state = sectionState,
                    onDateRangeChanged = { viewModel.onDateRangeChanged(type, it) },
                    onExport = { format -> viewModel.export(type, format) },
                )
            }
        }
    }
}

private fun buildSingleShareIntent(file: ExportedFile): Intent = Intent(Intent.ACTION_SEND).apply {
    type = file.mimeType
    putExtra(Intent.EXTRA_STREAM, file.uri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

private fun buildMultiShareIntent(files: List<ExportedFile>): Intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
    type = "*/*"
    putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(files.map { it.uri }))
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BackupCard(
    type: ExportType,
    state: BackupSectionState,
    onDateRangeChanged: (ExportDateRange) -> Unit,
    onExport: (ExportFormat) -> Unit,
) {
    var rangeExpanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(18.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(type.icon, style = MaterialTheme.typography.titleMedium)
                Text(
                    type.label,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(start = 8.dp),
                )
            }

            Text(
                "Date Range",
                style = MaterialTheme.typography.labelSmall,
                color = Slate400,
                modifier = Modifier.padding(top = 12.dp, bottom = 4.dp),
            )
            ExposedDropdownMenuBox(expanded = rangeExpanded, onExpandedChange = { rangeExpanded = it }) {
                OutlinedTextField(
                    value = state.dateRange.label,
                    onValueChange = {},
                    readOnly = true,
                    textStyle = MaterialTheme.typography.bodySmall,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = rangeExpanded) },
                    modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true).fillMaxWidth(),
                )
                DropdownMenu(expanded = rangeExpanded, onDismissRequest = { rangeExpanded = false }) {
                    ExportDateRange.entries.forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option.label) },
                            onClick = { onDateRangeChanged(option); rangeExpanded = false },
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ExportFormatButton("JSON", Sky, state.isExporting, modifier = Modifier.weight(1f)) { onExport(ExportFormat.JSON) }
                ExportFormatButton("Excel", Emerald, state.isExporting, modifier = Modifier.weight(1f)) { onExport(ExportFormat.EXCEL) }
                ExportFormatButton("PDF", Rose, state.isExporting, modifier = Modifier.weight(1f)) { onExport(ExportFormat.PDF) }
            }

            if (state.isExporting) {
                Text(
                    "Exporting… please wait",
                    style = MaterialTheme.typography.labelSmall,
                    color = com.thepowertrainer.mobile.core.designsystem.theme.Amber,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
            state.error?.let {
                Text(
                    "Error: $it",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
        }
    }
}

@Composable
private fun ExportFormatButton(label: String, color: androidx.compose.ui.graphics.Color, disabled: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        enabled = !disabled,
        shape = RoundedCornerShape(10.dp),
        color = color.copy(alpha = if (disabled) 0.08f else 0.16f),
        modifier = modifier.clip(RoundedCornerShape(10.dp)),
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            color = if (disabled) color.copy(alpha = 0.5f) else color,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
        )
    }
}
