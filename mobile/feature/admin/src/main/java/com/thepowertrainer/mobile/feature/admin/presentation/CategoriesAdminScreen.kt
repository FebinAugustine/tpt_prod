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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
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
import com.thepowertrainer.mobile.feature.admin.domain.AdminCategory
import com.thepowertrainer.mobile.feature.admin.domain.CategoryInput

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesAdminRoute(
    onBack: () -> Unit,
    viewModel: CategoriesAdminViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    var pendingDelete by remember { mutableStateOf<AdminCategory?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Categories") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = viewModel::openAddForm, containerColor = GreenDark) {
                Icon(Icons.Filled.Add, contentDescription = "Add category", tint = Color.White)
            }
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                }
                uiState.categories.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No categories yet")
                }
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(uiState.categories, key = { it.id }) { category ->
                        CategoryRow(
                            category = category,
                            onEdit = { viewModel.openEditForm(category) },
                            onDelete = { pendingDelete = category },
                        )
                    }
                }
            }
        }
    }

    if (uiState.showAddForm) {
        CategoryFormDialog(
            title = "Add Category",
            initial = null,
            isSaving = uiState.isSaving,
            error = uiState.formError,
            onDismiss = viewModel::closeForms,
            onSave = viewModel::addCategory,
        )
    }

    uiState.editingCategory?.let { category ->
        CategoryFormDialog(
            title = "Edit Category",
            initial = category,
            isSaving = uiState.isSaving,
            error = uiState.formError,
            onDismiss = viewModel::closeForms,
            onSave = { input -> viewModel.updateCategory(category.id, input) },
        )
    }

    pendingDelete?.let { category ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete Category") },
            text = { Text("Delete \"${category.name}\"? This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteCategory(category.id)
                    pendingDelete = null
                }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun CategoryRow(category: AdminCategory, onEdit: () -> Unit, onDelete: () -> Unit) {
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
                Icon(Icons.Filled.Category, contentDescription = null, tint = GreenDark, modifier = Modifier.size(18.dp))
            }
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(category.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                category.description?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = Slate400)
                }
                if (!category.isActive) {
                    PttStatusBadge(text = "Inactive", tone = PttBadgeTone.DANGER, modifier = Modifier.padding(top = 4.dp))
                }
            }
            IconButton(onClick = onEdit) { Icon(Icons.Filled.Edit, contentDescription = "Edit", tint = Slate400) }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, contentDescription = "Delete", tint = Rose) }
        }
    }
}

@Composable
private fun CategoryFormDialog(
    title: String,
    initial: AdminCategory?,
    isSaving: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onSave: (CategoryInput) -> Unit,
) {
    var name by remember { mutableStateOf(initial?.name ?: "") }
    var description by remember { mutableStateOf(initial?.description ?: "") }
    var sortOrder by remember { mutableStateOf(initial?.sortOrder?.toString() ?: "0") }
    var isActive by remember { mutableStateOf(initial?.isActive ?: true) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column {
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 8.dp)) }
                OutlinedTextField(name, { name = it }, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(description, { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                OutlinedTextField(sortOrder, { sortOrder = it }, label = { Text("Sort order") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("Active", modifier = Modifier.padding(top = 12.dp))
                    Checkbox(checked = isActive, onCheckedChange = { isActive = it })
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(CategoryInput(name, description, isActive, sortOrder.toIntOrNull() ?: 0))
                },
                enabled = !isSaving && name.isNotBlank(),
            ) {
                Text(if (isSaving) "Saving..." else "Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
