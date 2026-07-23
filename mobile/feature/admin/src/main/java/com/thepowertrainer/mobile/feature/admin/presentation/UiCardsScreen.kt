package com.thepowertrainer.mobile.feature.admin.presentation

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.ViewCarousel
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
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.thepowertrainer.mobile.core.designsystem.component.PttBadgeTone
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.feature.admin.domain.AdminUiCard
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.UiCardInput

@Composable
fun BannersRoute(onBack: () -> Unit, viewModel: BannersViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    UiCardsContent(
        title = "Banners",
        uiState = uiState,
        onBack = onBack,
        onAdd = viewModel::openAddForm,
        onEdit = viewModel::openEditForm,
        onCloseForms = viewModel::closeForms,
        onSaveNew = viewModel::addCard,
        onSaveEdit = { id, input, image -> viewModel.updateCard(id, input, image) },
        onDelete = viewModel::deleteCard,
    )
}

@Composable
fun OfferCardsRoute(onBack: () -> Unit, viewModel: OfferCardsViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    UiCardsContent(
        title = "Offer Cards",
        uiState = uiState,
        onBack = onBack,
        onAdd = viewModel::openAddForm,
        onEdit = viewModel::openEditForm,
        onCloseForms = viewModel::closeForms,
        onSaveNew = viewModel::addCard,
        onSaveEdit = { id, input, image -> viewModel.updateCard(id, input, image) },
        onDelete = viewModel::deleteCard,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun UiCardsContent(
    title: String,
    uiState: UiCardsUiState,
    onBack: () -> Unit,
    onAdd: () -> Unit,
    onEdit: (AdminUiCard) -> Unit,
    onCloseForms: () -> Unit,
    onSaveNew: (UiCardInput, PickedImage?) -> Unit,
    onSaveEdit: (String, UiCardInput, PickedImage?) -> Unit,
    onDelete: (String) -> Unit,
) {
    var pendingDelete by remember { mutableStateOf<AdminUiCard?>(null) }

    if (uiState.showAddForm) {
        UiCardFormScreen(
            title = "Add $title",
            initial = null,
            isSaving = uiState.isSaving,
            error = uiState.formError,
            onCancel = onCloseForms,
            onSave = { input, image -> onSaveNew(input, image) },
        )
        return
    }

    uiState.editingCard?.let { card ->
        UiCardFormScreen(
            title = "Edit $title",
            initial = card,
            isSaving = uiState.isSaving,
            error = uiState.formError,
            onCancel = onCloseForms,
            onSave = { input, image -> onSaveEdit(card.id, input, image) },
        )
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAdd, containerColor = GreenDark) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = Color.White)
            }
        },
    ) { padding ->
        Box(modifier = Modifier
            .fillMaxSize()
            .padding(padding)) {
            when {
                uiState.isLoading -> Box(
                    Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }

                uiState.error != null -> Box(
                    Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(uiState.error, color = MaterialTheme.colorScheme.error)
                }

                uiState.items.isEmpty() -> Box(
                    Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("None yet")
                }

                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(uiState.items, key = { it.id }) { card ->
                        UiCardRow(
                            card = card,
                            onEdit = { onEdit(card) },
                            onDelete = { pendingDelete = card })
                    }
                }
            }
        }
    }

    pendingDelete?.let { card ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete \"${card.title}\"?") },
            text = { Text("This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = { onDelete(card.id); pendingDelete = null }) {
                    Text("Delete", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = { TextButton(onClick = { pendingDelete = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun UiCardRow(card: AdminUiCard, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(
                alpha = 0.35f
            )
        ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (card.imageUrl != null) {
                AsyncImage(
                    model = card.imageUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(10.dp)),
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(GreenDark.copy(alpha = 0.14f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Filled.ViewCarousel,
                        contentDescription = null,
                        tint = GreenDark,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Column(modifier = Modifier
                .padding(start = 12.dp)
                .weight(1f)) {
                Text(
                    card.title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                card.subtitle?.let {
                    Text(
                        it,
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate400
                    )
                }
                if (!card.isActive) {
                    PttStatusBadge(
                        text = "Inactive",
                        tone = PttBadgeTone.DANGER,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
            IconButton(onClick = onEdit) {
                Icon(
                    Icons.Filled.Edit,
                    contentDescription = "Edit",
                    tint = Slate400
                )
            }
            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Filled.Delete,
                    contentDescription = "Delete",
                    tint = Rose
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun UiCardFormScreen(
    title: String,
    initial: AdminUiCard?,
    isSaving: Boolean,
    error: String?,
    onCancel: () -> Unit,
    onSave: (UiCardInput, PickedImage?) -> Unit,
) {
    val context = LocalContext.current
    var cardTitle by remember { mutableStateOf(initial?.title ?: "") }
    var subtitle by remember { mutableStateOf(initial?.subtitle ?: "") }
    var buttonText by remember { mutableStateOf(initial?.buttonText ?: "") }
    var buttonLink by remember { mutableStateOf(initial?.buttonLink ?: "") }
    var isActive by remember { mutableStateOf(initial?.isActive ?: true) }
    var sortOrder by remember { mutableStateOf("0") }
    var pickedUri by remember { mutableStateOf<Uri?>(null) }

    val pickMedia =
        rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
            pickedUri = uri
        }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(title) },
            navigationIcon = {
                IconButton(onClick = onCancel) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Cancel")
                }
            },
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            error?.let {
                Text(
                    it,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            val previewModel = pickedUri ?: initial?.imageUrl
            if (previewModel != null) {
                AsyncImage(
                    model = previewModel,
                    contentDescription = "Image preview",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .padding(bottom = 8.dp),
                )
            }
            OutlinedButton(
                onClick = { pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(
                    Icons.Filled.Image,
                    contentDescription = null,
                    modifier = Modifier.padding(end = 8.dp)
                )
                Text(if (previewModel != null) "Change image" else "Pick image")
            }

            OutlinedTextField(
                cardTitle,
                { cardTitle = it },
                label = { Text("Title") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )
            OutlinedTextField(
                subtitle,
                { subtitle = it },
                label = { Text("Subtitle") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )
            OutlinedTextField(
                buttonText,
                { buttonText = it },
                label = { Text("Button text") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )
            OutlinedTextField(
                buttonLink,
                { buttonLink = it },
                label = { Text("Button link") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )
            OutlinedTextField(
                sortOrder,
                { sortOrder = it },
                label = { Text("Sort order") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Active", modifier = Modifier.padding(top = 12.dp))
                Checkbox(checked = isActive, onCheckedChange = { isActive = it })
            }

            Button(
                onClick = {
                    val input = UiCardInput(
                        cardTitle,
                        subtitle,
                        buttonText,
                        buttonLink,
                        isActive,
                        sortOrder.toIntOrNull() ?: 0
                    )
                    val uri = pickedUri
                    if (uri != null) {
                        val bytes =
                            context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                        val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
                        val image = bytes?.let {
                            PickedImage(
                                it,
                                "image.${mimeType.substringAfterLast('/')}",
                                mimeType
                            )
                        }
                        onSave(input, image)
                    } else {
                        onSave(input, null)
                    }
                },
                enabled = !isSaving && cardTitle.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, bottom = 24.dp),
            ) {
                Text(if (isSaving) "Saving..." else "Save")
            }
        }
    }
}
