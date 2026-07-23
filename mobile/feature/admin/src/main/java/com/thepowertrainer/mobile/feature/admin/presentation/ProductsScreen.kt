package com.thepowertrainer.mobile.feature.admin.presentation

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CardDefaults
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
import com.thepowertrainer.mobile.feature.admin.domain.AdminCategoryOption
import com.thepowertrainer.mobile.feature.admin.domain.AdminProduct
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.ProductInput

private const val MAX_PRODUCT_IMAGES = 8

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductsRoute(
    onBack: () -> Unit,
    viewModel: ProductsViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    var pendingDelete by remember { mutableStateOf<AdminProduct?>(null) }

    if (uiState.showAddForm) {
        ProductFormScreen(
            title = "Add Product",
            categories = uiState.categories,
            initial = null,
            isSaving = uiState.isSaving,
            error = uiState.formError,
            onCancel = viewModel::closeForms,
            onSave = { input, _, newImages -> viewModel.addProduct(input, newImages) },
        )
        return
    }

    uiState.editingProduct?.let { product ->
        ProductFormScreen(
            title = "Edit Product",
            categories = uiState.categories,
            initial = product,
            isSaving = uiState.isSaving,
            error = uiState.formError,
            onCancel = viewModel::closeForms,
            onSave = { input, keptImageUrls, newImages ->
                viewModel.updateProduct(product.id, input, keptImageUrls, newImages)
            },
        )
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Products") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = viewModel::openAddForm, containerColor = GreenDark) {
                Icon(Icons.Filled.Add, contentDescription = "Add product", tint = Color.White)
            }
        },
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::onSearchQueryChanged,
                label = { Text("Search products") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            )
            ProductFilterRow(
                categories = uiState.categories,
                categoryFilter = uiState.categoryFilter,
                stockFilter = uiState.stockFilter,
                activeFilterCount = uiState.activeFilterCount,
                onCategoryFilterChanged = viewModel::onCategoryFilterChanged,
                onStockFilterChanged = viewModel::onStockFilterChanged,
                onClearFilters = viewModel::clearFilters,
            )
            when {
                uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                }
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(uiState.visibleProducts, key = { it.id }) { product ->
                        ProductRow(
                            product = product,
                            onEdit = { viewModel.openEditForm(product) },
                            onDelete = { pendingDelete = product },
                        )
                    }
                }
            }
        }
    }

    pendingDelete?.let { product ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete Product") },
            text = { Text("Delete \"${product.name}\"? This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteProduct(product.id)
                    pendingDelete = null
                }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("Cancel") }
            },
        )
    }
}

/** Category + stock-status filters, mirrors frontend's admin/all-products
 * filter panel (Category select, Stock Status select, active-filter count,
 * Clear Filters). Uses two ExposedDropdownMenuBoxes stacked in a row. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProductFilterRow(
    categories: List<AdminCategoryOption>,
    categoryFilter: String?,
    stockFilter: StockFilter,
    activeFilterCount: Int,
    onCategoryFilterChanged: (String?) -> Unit,
    onStockFilterChanged: (StockFilter) -> Unit,
    onClearFilters: () -> Unit,
) {
    var categoryMenuExpanded by remember { mutableStateOf(false) }
    var stockMenuExpanded by remember { mutableStateOf(false) }
    val categoryLabel = categories.find { it.id == categoryFilter }?.name ?: "All Categories"
    val stockLabel = when (stockFilter) {
        StockFilter.ALL -> "All Stock"
        StockFilter.IN_STOCK -> "In Stock"
        StockFilter.OUT_OF_STOCK -> "Out of Stock"
    }

    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ExposedDropdownMenuBox(
            expanded = categoryMenuExpanded,
            onExpandedChange = { categoryMenuExpanded = it },
            modifier = Modifier.weight(1f),
        ) {
            OutlinedTextField(
                value = categoryLabel,
                onValueChange = {},
                readOnly = true,
                singleLine = true,
                label = { Text("Category") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryMenuExpanded) },
                modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true).fillMaxWidth(),
            )
            DropdownMenu(expanded = categoryMenuExpanded, onDismissRequest = { categoryMenuExpanded = false }) {
                DropdownMenuItem(text = { Text("All Categories") }, onClick = { onCategoryFilterChanged(null); categoryMenuExpanded = false })
                categories.forEach { category ->
                    DropdownMenuItem(
                        text = { Text(category.name) },
                        onClick = { onCategoryFilterChanged(category.id); categoryMenuExpanded = false },
                    )
                }
            }
        }

        ExposedDropdownMenuBox(
            expanded = stockMenuExpanded,
            onExpandedChange = { stockMenuExpanded = it },
            modifier = Modifier.weight(1f),
        ) {
            OutlinedTextField(
                value = stockLabel,
                onValueChange = {},
                readOnly = true,
                singleLine = true,
                label = { Text("Stock") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stockMenuExpanded) },
                modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true).fillMaxWidth(),
            )
            DropdownMenu(expanded = stockMenuExpanded, onDismissRequest = { stockMenuExpanded = false }) {
                StockFilter.entries.forEach { filter ->
                    val label = when (filter) {
                        StockFilter.ALL -> "All Stock"
                        StockFilter.IN_STOCK -> "In Stock"
                        StockFilter.OUT_OF_STOCK -> "Out of Stock"
                    }
                    DropdownMenuItem(text = { Text(label) }, onClick = { onStockFilterChanged(filter); stockMenuExpanded = false })
                }
            }
        }
    }

    if (activeFilterCount > 0) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "$activeFilterCount filter(s) active",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            TextButton(onClick = onClearFilters) { Text("Clear Filters") }
        }
    }
}

@Composable
private fun ProductRow(product: AdminProduct, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            if (product.images.isNotEmpty()) {
                AsyncImage(
                    model = product.images.first(),
                    contentDescription = null,
                    modifier = Modifier.size(48.dp).clip(RoundedCornerShape(10.dp)),
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(GreenDark.copy(alpha = 0.14f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Filled.Image, contentDescription = null, tint = GreenDark, modifier = Modifier.size(20.dp))
                }
            }
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(product.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                product.categoryName?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = Slate400)
                }
                Text(
                    "₹${product.price}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = GreenDark,
                    modifier = Modifier.padding(top = 4.dp),
                )
                if (!product.inStock) {
                    PttStatusBadge(text = "Out of stock", tone = PttBadgeTone.DANGER, modifier = Modifier.padding(top = 4.dp))
                }
            }
            IconButton(onClick = onEdit) { Icon(Icons.Filled.Edit, contentDescription = "Edit", tint = Slate400) }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, contentDescription = "Delete", tint = Rose) }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProductFormScreen(
    title: String,
    categories: List<AdminCategoryOption>,
    initial: AdminProduct?,
    isSaving: Boolean,
    error: String?,
    onCancel: () -> Unit,
    onSave: (ProductInput, keptImageUrls: List<String>, newImages: List<PickedImage>) -> Unit,
) {
    val context = LocalContext.current
    var keptImageUrls by remember { mutableStateOf(initial?.images ?: emptyList()) }
    var pickedUris by remember { mutableStateOf<List<Uri>>(emptyList()) }
    val remainingSlots = (MAX_PRODUCT_IMAGES - keptImageUrls.size - pickedUris.size).coerceAtLeast(0)

    val pickImages = rememberLauncherForActivityResult(
        ActivityResultContracts.PickMultipleVisualMedia(maxItems = MAX_PRODUCT_IMAGES.coerceAtLeast(2)),
    ) { uris ->
        val allowed = (MAX_PRODUCT_IMAGES - keptImageUrls.size).coerceAtLeast(0)
        pickedUris = (pickedUris + uris).distinct().take(allowed)
    }

    var name by remember { mutableStateOf(initial?.name ?: "") }
    var description by remember { mutableStateOf(initial?.description ?: "") }
    var price by remember { mutableStateOf(initial?.price?.toString() ?: "") }
    var offerPrice by remember { mutableStateOf(initial?.offerPrice?.toString() ?: "") }
    var weight by remember { mutableStateOf(initial?.weight ?: "") }
    var flavour by remember { mutableStateOf(initial?.flavour ?: "") }
    var company by remember { mutableStateOf(initial?.company ?: "") }
    var manufacturer by remember { mutableStateOf(initial?.manufacturer ?: "") }
    var categoryId by remember { mutableStateOf(initial?.categoryId) }
    var categoryExpanded by remember { mutableStateOf(false) }
    var inStock by remember { mutableStateOf(initial?.inStock ?: true) }
    var isTrending by remember { mutableStateOf(initial?.isTrending ?: false) }
    var isPopular by remember { mutableStateOf(initial?.isPopular ?: false) }
    var isRecommended by remember { mutableStateOf(initial?.isRecommended ?: false) }

    val selectedCategoryName = categories.firstOrNull { it.id == categoryId }?.name ?: "None"

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
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        ) {
            error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 8.dp)) }

            if (keptImageUrls.isNotEmpty() || pickedUris.isNotEmpty()) {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 8.dp)) {
                    items(keptImageUrls) { url ->
                        ProductImageThumbnail(model = url) { keptImageUrls = keptImageUrls - url }
                    }
                    items(pickedUris) { uri ->
                        ProductImageThumbnail(model = uri) { pickedUris = pickedUris - uri }
                    }
                }
            }
            OutlinedButton(
                onClick = { pickImages.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                enabled = remainingSlots > 0,
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
            ) {
                Icon(Icons.Filled.Image, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                Text(if (remainingSlots > 0) "Add images ($remainingSlots left)" else "Image limit reached ($MAX_PRODUCT_IMAGES)")
            }

            OutlinedTextField(name, { name = it }, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(description, { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            Row(modifier = Modifier.padding(top = 8.dp)) {
                OutlinedTextField(price, { price = it }, label = { Text("Price") }, singleLine = true, modifier = Modifier.weight(1f))
                OutlinedTextField(offerPrice, { offerPrice = it }, label = { Text("Offer price") }, singleLine = true, modifier = Modifier.weight(1f).padding(start = 8.dp))
            }
            Row(modifier = Modifier.padding(top = 8.dp)) {
                OutlinedTextField(weight, { weight = it }, label = { Text("Weight") }, singleLine = true, modifier = Modifier.weight(1f))
                OutlinedTextField(flavour, { flavour = it }, label = { Text("Flavour") }, singleLine = true, modifier = Modifier.weight(1f).padding(start = 8.dp))
            }
            OutlinedTextField(company, { company = it }, label = { Text("Company") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            OutlinedTextField(manufacturer, { manufacturer = it }, label = { Text("Manufacturer") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))

            ExposedDropdownMenuBox(
                expanded = categoryExpanded,
                onExpandedChange = { categoryExpanded = it },
                modifier = Modifier.padding(top = 8.dp),
            ) {
                OutlinedTextField(
                    value = selectedCategoryName,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Category") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
                    modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true).fillMaxWidth(),
                )
                DropdownMenu(expanded = categoryExpanded, onDismissRequest = { categoryExpanded = false }) {
                    DropdownMenuItem(text = { Text("None") }, onClick = { categoryId = null; categoryExpanded = false })
                    categories.forEach { option ->
                        DropdownMenuItem(text = { Text(option.name) }, onClick = { categoryId = option.id; categoryExpanded = false })
                    }
                }
            }

            ToggleRow("In stock", inStock) { inStock = it }
            ToggleRow("Trending", isTrending) { isTrending = it }
            ToggleRow("Popular", isPopular) { isPopular = it }
            ToggleRow("Recommended", isRecommended) { isRecommended = it }

            Button(
                onClick = {
                    val newImages = pickedUris.mapNotNull { uri ->
                        val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return@mapNotNull null
                        val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
                        PickedImage(bytes, "image_${System.nanoTime()}.${mimeType.substringAfterLast('/')}", mimeType)
                    }
                    onSave(
                        ProductInput(
                            name = name,
                            description = description,
                            price = price.toDoubleOrNull() ?: 0.0,
                            offerPrice = offerPrice.toDoubleOrNull(),
                            weight = weight,
                            flavour = flavour,
                            company = company,
                            manufacturer = manufacturer,
                            categoryId = categoryId,
                            inStock = inStock,
                            isTrending = isTrending,
                            isPopular = isPopular,
                            isRecommended = isRecommended,
                        ),
                        keptImageUrls,
                        newImages,
                    )
                },
                enabled = !isSaving && name.isNotBlank() && price.toDoubleOrNull() != null,
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 24.dp),
            ) {
                Text(if (isSaving) "Saving..." else "Save")
            }
        }
    }
}

@Composable
private fun ProductImageThumbnail(model: Any, onRemove: () -> Unit) {
    Box(modifier = Modifier.size(80.dp)) {
        AsyncImage(
            model = model,
            contentDescription = "Product image",
            modifier = Modifier.fillMaxSize().aspectRatio(1f),
        )
        IconButton(onClick = onRemove, modifier = Modifier.align(Alignment.TopEnd).size(24.dp)) {
            Icon(
                Icons.Filled.Close,
                contentDescription = "Remove image",
                tint = MaterialTheme.colorScheme.error,
            )
        }
    }
}

@Composable
private fun ToggleRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, modifier = Modifier.padding(top = 12.dp))
        Checkbox(checked = checked, onCheckedChange = onCheckedChange)
    }
}
