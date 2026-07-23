package com.thepowertrainer.mobile.feature.cart.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

private val Context.cartDataStore by preferencesDataStore(name = "tpt_cart")

/**
 * Client-only persistence for the cart — mirrors frontend/app/store/cartStore.ts's
 * `persist(..., storage: localStorage)` middleware. There is no backend cart
 * endpoint (see CLAUDE.md Decision #6), so this is the entire "repository":
 * a JSON-encoded list of items in a single DataStore Preferences key.
 */
@Singleton
class CartLocalStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val ITEMS_JSON = stringPreferencesKey("cart_items_json")
    }

    private val json = Json { ignoreUnknownKeys = true }

    val itemsFlow: Flow<List<CartItemDto>> = context.cartDataStore.data.map { prefs ->
        val raw = prefs[Keys.ITEMS_JSON] ?: return@map emptyList()
        runCatching { json.decodeFromString<List<CartItemDto>>(raw) }.getOrDefault(emptyList())
    }

    suspend fun getItems(): List<CartItemDto> = itemsFlow.first()

    suspend fun saveItems(items: List<CartItemDto>) {
        context.cartDataStore.edit { prefs ->
            prefs[Keys.ITEMS_JSON] = json.encodeToString(items)
        }
    }
}
