package com.thepowertrainer.mobile.feature.catalog.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.common.wishlist.WishlistGateway
import com.thepowertrainer.mobile.core.common.wishlist.WishlistItemInput
import com.thepowertrainer.mobile.feature.catalog.domain.CatalogRepository
import com.thepowertrainer.mobile.feature.catalog.domain.Category
import com.thepowertrainer.mobile.feature.catalog.domain.Product
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CatalogUiState(
    val isLoading: Boolean = true,
    val products: List<Product> = emptyList(),
    val categories: List<Category> = emptyList(),
    val selectedCategoryId: String? = null,
    val searchQuery: String = "",
    val error: String? = null,
) {
    /** Client-side filter by category — the backend doesn't offer a
     * category query param on GET /products, so this filters the already-
     * fetched list rather than re-hitting the network. Fine at this catalog
     * size; revisit with server-side filtering/pagination if it grows. */
    val visibleProducts: List<Product>
        get() = selectedCategoryId?.let { catId -> products.filter { it.categoryId == catId } } ?: products
}

@HiltViewModel
class CatalogViewModel @Inject constructor(
    private val repository: CatalogRepository,
    private val wishlistGateway: WishlistGateway,
    cartGateway: CartGateway,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CatalogUiState())
    val uiState: StateFlow<CatalogUiState> = _uiState.asStateFlow()

    val cartItemCount: StateFlow<Int> = cartGateway.observeItemCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0)

    val wishlistedIds: StateFlow<Set<String>> = wishlistGateway.observeProductIds()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptySet())

    init {
        loadCatalog()
    }

    fun onWishlistToggle(product: Product) {
        viewModelScope.launch {
            wishlistGateway.toggle(
                WishlistItemInput(
                    productId = product.id,
                    name = product.name,
                    price = product.price,
                    offerPrice = product.offerPrice,
                    imageUrl = product.images.firstOrNull(),
                    inStock = product.inStock,
                ),
            )
        }
    }

    fun loadCatalog() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            val productsResult = repository.getProducts()
            val categoriesResult = repository.getCategories()

            val products = (productsResult as? AppResult.Success)?.data
            val categories = (categoriesResult as? AppResult.Success)?.data

            val error = (productsResult as? AppResult.Error)?.message
                ?: (categoriesResult as? AppResult.Error)?.message

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                products = products ?: _uiState.value.products,
                categories = categories ?: _uiState.value.categories,
                error = if (products == null) error else null,
            )
        }
    }

    fun onCategorySelected(categoryId: String?) {
        _uiState.value = _uiState.value.copy(
            selectedCategoryId = if (_uiState.value.selectedCategoryId == categoryId) null else categoryId,
        )
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }
}
