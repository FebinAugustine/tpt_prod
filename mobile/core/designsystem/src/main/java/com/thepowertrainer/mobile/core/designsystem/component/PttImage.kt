package com.thepowertrainer.mobile.core.designsystem.component

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.thepowertrainer.mobile.core.designsystem.theme.PttGradients

/**
 * Loads [imageUrl] via Coil, but falls back to a branded gradient +
 * dumbbell-icon placeholder both when the URL is null/blank (e.g. a product
 * added without photos yet) **and** when Coil actually fails to load a
 * non-blank URL (network/DNS error, timeout, decode failure, etc.).
 *
 * 2026-07-23 fix: previously this only checked `imageUrl.isNullOrBlank()` —
 * if the URL was real but Coil's request failed for any reason, `AsyncImage`
 * rendered nothing at all (a blank box), which is indistinguishable from "no
 * image configured" from the outside. Reported after a clean
 * uninstall/reinstall still showed no images anywhere. Now `onError` flips a
 * local flag so a failed load falls back to the same visible placeholder —
 * so if this placeholder still appears everywhere after this fix, it's a
 * strong signal the failure is a *load* failure (network/DNS unreachable
 * from the device/emulator to Cloudinary), not "no image data", and the
 * `PttImageLoad` logcat tag (see [coil3.util.DebugLogger] wired in
 * `TptApplication`) will show the actual underlying exception per request.
 */
@Composable
fun PttImageOrPlaceholder(
    imageUrl: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
) {
    var loadFailed by remember(imageUrl) { mutableStateOf(false) }

    if (!imageUrl.isNullOrBlank() && !loadFailed) {
        AsyncImage(
            model = imageUrl,
            contentDescription = contentDescription,
            contentScale = contentScale,
            modifier = modifier,
            onError = { state ->
                loadFailed = true
                val t = state.result.throwable
                Log.w("PttImageLoad", "Failed to load $imageUrl — ${t::class.simpleName}: ${t.message}", t)
            },
        )
    } else {
        Box(
            modifier = modifier.background(PttGradients.primaryButton),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                Icons.Filled.FitnessCenter,
                contentDescription = contentDescription,
                tint = Color.White.copy(alpha = 0.85f),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(28.dp),
            )
        }
    }
}
