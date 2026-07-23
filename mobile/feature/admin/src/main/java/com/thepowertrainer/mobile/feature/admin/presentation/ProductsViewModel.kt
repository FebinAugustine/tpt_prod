package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminCategoryOption
import com.thepowertrainer.mobile.feature.admin.domain.AdminProduct
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.ProductInput
import com.thepowertrainer.mobile.feature.admin.domain.ProductsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Mirrors the frontend admin/all-products stock-status filter options. */
enum class StockFilter { ALL, IN_STOCK, OUT_OF_STOCK }

data class ProductsUiState(
    val isLoading: Boolean = true,
    val products: List<AdminProduct> = emptyList(),
    val categories: List<AdminCategoryOption> = emptyList(),
    val searchQuery: String = "",
    val categoryFilter: String? = null,
    val stockFilter: StockFilter = StockFilter.ALL,
    val error: String? = null,
    val showAddForm: Boolean = false,
    val editingProduct: AdminProduct? = null,
    val isSaving: Boolean = false,
    val formError: String? = null,
) {
    val activeFilterCount: Int
        get() = listOfNotNull(
            categoryFilter,
            if (stockFilter != StockFilter.ALL) stockFilter else null,
        ).size

    val visibleProducts: List<AdminProduct>
        get() = products
            .filter {
                searchQuery.isBlank() ||
                    it.name.contains(searchQuery, ignoreCase = true) ||
                    it.company?.contains(searchQuery, ignoreCase = true) == true ||
                    it.description?.contains(searchQuery, ignoreCase = true) == true ||
                    it.flavour?.contains(searchQuery, ignoreCase = true) == true
            }
            .filter { categoryFilter == null || it.categoryId == categoryFilter }
            .filter {
                when (stockFilter) {
                    StockFilter.ALL -> true
                    StockFilter.IN_STOCK -> it.inStock
                    StockFilter.OUT_OF_STOCK -> !it.inStock
                }
            }
}

@HiltViewModel
class ProductsViewModel @Inject constructor(
    private val repository: ProductsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductsUiState())
    val uiState: StateFlow<ProductsUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val productsResult = repository.getProducts()
            val categoriesResult = repository.getCategoryOptions()
            val products = (productsResult as? AppResult.Success)?.data
            val categories = (categoriesResult as? AppResult.Success)?.data
            val error = (productsResult as? AppResult.Error)?.message
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                products = products ?: _uiState.value.products,
                categories = categories ?: _uiState.value.categories,
                error = error,
            )
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun onCategoryFilterChanged(categoryId: String?) {
        _uiState.value = _uiState.value.copy(categoryFilter = categoryId)
    }

    fun onStockFilterChanged(filter: StockFilter) {
        _uiState.value = _uiState.value.copy(stockFilter = filter)
    }

    fun clearFilters() {
        _uiState.value = _uiState.value.copy(categoryFilter = null, stockFilter = StockFilter.ALL, searchQuery = "")
    }

    fun openAddForm() {
        _uiState.value = _uiState.value.copy(showAddForm = true, formError = null)
    }

    fun openEditForm(product: AdminProduct) {
        _uiState.value = _uiState.value.copy(editingProduct = product, formError = null)
    }

    fun closeForms() {
        _uiState.value = _uiState.value.copy(showAddForm = false, editingProduct = null, formError = null)
    }

    fun addProduct(input: ProductInput, newImages: List<PickedImage>) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.addProduct(input, newImages)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, showAddForm = false)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun updateProduct(id: String, input: ProductInput, keptImageUrls: List<String>, newImages: List<PickedImage>) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.updateProduct(id, input, keptImageUrls, newImages)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, editingProduct = null)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun deleteProduct(id: String) {
        viewModelScope.launch {
            when (val result = repository.deleteProduct(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
