package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttBadgeTone
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.feature.admin.domain.AdminCareer
import com.thepowertrainer.mobile.feature.admin.domain.CareerInput

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CareersAdminRoute(
    onBack: () -> Unit,
    viewModel: CareersAdminViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    var pendingDelete by remember { mutableStateOf<AdminCareer?>(null) }

    if (uiState.showAddForm) {
        CareerFormScreen("Add Career", null, uiState.isSaving, uiState.formError, viewModel::closeForms, viewModel::addCareer)
        return
    }
    uiState.editingCareer?.let { career ->
        CareerFormScreen("Edit Career", career, uiState.isSaving, uiState.formError, viewModel::closeForms) { input ->
            viewModel.updateCareer(career.id, input)
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Careers") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = viewModel::openAddForm, containerColor = GreenDark) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = Color.White)
            }
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                }
                uiState.careers.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("No openings yet") }
                else -> LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.careers, key = { it.id }) { career ->
                        CareerRow(career, onEdit = { viewModel.openEditForm(career) }, onDelete = { pendingDelete = career })
                    }
                }
            }
        }
    }

    pendingDelete?.let { career ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete \"${career.title}\"?") },
            text = { Text("This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = { viewModel.deleteCareer(career.id); pendingDelete = null }) {
                    Text("Delete", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = { TextButton(onClick = { pendingDelete = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun CareerRow(career: AdminCareer, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(GreenDark.copy(alpha = 0.14f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.Work, contentDescription = null, tint = GreenDark, modifier = Modifier.size(18.dp))
            }
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(career.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Text(
                    "${career.department} • ${career.location}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400,
                )
                if (!career.isActive) {
                    PttStatusBadge(text = "Inactive", tone = PttBadgeTone.DANGER, modifier = Modifier.padding(top = 4.dp))
                }
            }
            IconButton(onClick = onEdit) { Icon(Icons.Filled.Edit, contentDescription = "Edit", tint = Slate400) }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, contentDescription = "Delete", tint = Rose) }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CareerFormScreen(
    title: String,
    initial: AdminCareer?,
    isSaving: Boolean,
    error: String?,
    onCancel: () -> Unit,
    onSave: (CareerInput) -> Unit,
) {
    var jobTitle by remember { mutableStateOf(initial?.title ?: "") }
    var department by remember { mutableStateOf(initial?.department ?: "") }
    var location by remember { mutableStateOf(initial?.location ?: "") }
    var type by remember { mutableStateOf(initial?.type ?: "Full-time") }
    var description by remember { mutableStateOf(initial?.description ?: "") }
    var requirements by remember { mutableStateOf(initial?.requirements?.joinToString(", ") ?: "") }
    var isActive by remember { mutableStateOf(initial?.isActive ?: true) }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(title) },
            navigationIcon = { IconButton(onClick = onCancel) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Cancel") } },
        )
        Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp)) {
            error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 8.dp)) }
            OutlinedTextField(jobTitle, { jobTitle = it }, label = { Text("Job title") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(department, { department = it }, label = { Text("Department") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            OutlinedTextField(location, { location = it }, label = { Text("Location") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            OutlinedTextField(type, { type = it }, label = { Text("Type (e.g. Full-time)") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            OutlinedTextField(description, { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            OutlinedTextField(requirements, { requirements = it }, label = { Text("Requirements (comma-separated)") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Active", modifier = Modifier.padding(top = 12.dp))
                Checkbox(checked = isActive, onCheckedChange = { isActive = it })
            }
            Button(
                onClick = {
                    onSave(
                        CareerInput(
                            title = jobTitle,
                            department = department,
                            location = location,
                            type = type,
                            description = description,
                            requirements = requirements.split(",").map { it.trim() }.filter { it.isNotBlank() },
                            isActive = isActive,
                        ),
                    )
                },
                enabled = !isSaving && jobTitle.isNotBlank() && department.isNotBlank(),
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 24.dp),
            ) {
                Text(if (isSaving) "Saving..." else "Save")
            }
        }
    }
}
