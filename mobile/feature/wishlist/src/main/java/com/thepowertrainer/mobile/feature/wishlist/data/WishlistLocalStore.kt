package com.thepowertrainer.mobile.feature.wishlist.data

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

private val Context.wishlistDataStore by preferencesDataStore(name = "tpt_wishlist")

/** Client-only persistence, mirrors frontend/app/store/wishlistStore.ts's localStorage persist. */
@Singleton
class WishlistLocalStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val ITEMS_JSON = stringPreferencesKey("wishlist_items_json")
    }

    private val json = Json { ignoreUnknownKeys = true }

    val itemsFlow: Flow<List<WishlistItemDto>> = context.wishlistDataStore.data.map { prefs ->
        val raw = prefs[Keys.ITEMS_JSON] ?: return@map emptyList()
        runCatching { json.decodeFromString<List<WishlistItemDto>>(raw) }.getOrDefault(emptyList())
    }

    suspend fun getItems(): List<WishlistItemDto> = itemsFlow.first()

    suspend fun saveItems(items: List<WishlistItemDto>) {
        context.wishlistDataStore.edit { prefs ->
            prefs[Keys.ITEMS_JSON] = json.encodeToString(items)
        }
    }
}
