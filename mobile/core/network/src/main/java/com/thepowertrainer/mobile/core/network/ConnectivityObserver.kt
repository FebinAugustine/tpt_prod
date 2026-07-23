package com.thepowertrainer.mobile.core.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import javax.inject.Inject
import javax.inject.Singleton

/**
 * App-wide connectivity signal, added 2026-07-23 so any screen can show an
 * offline indicator (first consumer: Home's banner-area snackbar) without
 * each feature reimplementing its own [ConnectivityManager] callback. Lives
 * in `:core:network` (already Hilt-enabled, already the home of other
 * app-wide session/network state like [TokenStorage]) rather than
 * `:core:common`, since it needs an Android [Context] — see root CLAUDE.md
 * Decision #2 for why `:core:common` itself stays free of platform deps.
 */
@Singleton
class ConnectivityObserver @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    /** Emits the current connectivity state immediately on collection, then
     * again whenever it changes. `true` = has internet-capable network. */
    val isOnline: Flow<Boolean> = callbackFlow {
        val connectivityManager =
            context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

        fun currentlyOnline(): Boolean {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            // Deliberately NOT checking NET_CAPABILITY_VALIDATED — that
            // requires Android to successfully reach Google's captive-portal
            // check servers, which routinely fails or never completes on
            // emulators, restricted networks, or VPNs even though the app's
            // actual traffic (e.g. to a local dev backend) works fine. That
            // caused a real false-positive "offline" banner during testing.
            // NET_CAPABILITY_INTERNET alone (network is *declared* capable of
            // reaching the internet) is the right signal here.
            return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        }

        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(currentlyOnline())
            }

            override fun onLost(network: Network) {
                trySend(currentlyOnline())
            }

            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                trySend(currentlyOnline())
            }
        }

        connectivityManager.registerNetworkCallback(NetworkRequest.Builder().build(), callback)
        trySend(currentlyOnline())

        awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
    }.distinctUntilChanged()
}
