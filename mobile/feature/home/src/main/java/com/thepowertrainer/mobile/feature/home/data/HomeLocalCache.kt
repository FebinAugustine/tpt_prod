package com.thepowertrainer.mobile.feature.home.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.thepowertrainer.mobile.feature.home.data.dto.BannerDto
import com.thepowertrainer.mobile.feature.home.data.dto.HomeCategoryDto
import com.thepowertrainer.mobile.feature.home.data.dto.HomeProductDto
import com.thepowertrainer.mobile.feature.home.data.dto.OfferCardDto
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

private val Context.homeCacheDataStore by preferencesDataStore(name = "tpt_home_cache")

@Serializable
data class HomeFeedCacheDto(
    val banners: List<BannerDto> = emptyList(),
    val categories: List<HomeCategoryDto> = emptyList(),
    val offerCards: List<OfferCardDto> = emptyList(),
    val products: List<HomeProductDto> = emptyList(),
)

/**
 * First slice of offline-first support for the app (2026-07-23) — persists
 * the last successful Home feed response as JSON in DataStore so the screen
 * always has something real to render immediately, and can fall back to it
 * when the network is unreachable instead of a bare error screen.
 *
 * This is deliberately "cache-then-revalidate", not a true offline cache
 * with TTL-based invalidation: every successful network fetch overwrites
 * the cache unconditionally (see [HomeRepositoryImpl]), and the cache is
 * only ever *read* when a live fetch fails. There's no expiry — stale data
 * is always better than a blank screen for a feed like this, and it's
 * self-correcting the next time the app has connectivity.
 *
 * Scoped to Home only for now. A broader offline-first pass (Catalog,
 * Orders, etc., possibly backed by Room instead of a single JSON blob)
 * is flagged as a future item in root CLAUDE.md rather than attempted here.
 */
@Singleton
class HomeLocalCache @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val FEED_JSON = stringPreferencesKey("home_feed_json")
    }

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun save(cache: HomeFeedCacheDto) {
        context.homeCacheDataStore.edit { prefs ->
            prefs[Keys.FEED_JSON] = json.encodeToString(HomeFeedCacheDto.serializer(), cache)
        }
    }

    suspend fun load(): HomeFeedCacheDto? {
        val raw = context.homeCacheDataStore.data.first()[Keys.FEED_JSON] ?: return null
        return runCatching { json.decodeFromString(HomeFeedCacheDto.serializer(), raw) }.getOrNull()
    }
}
