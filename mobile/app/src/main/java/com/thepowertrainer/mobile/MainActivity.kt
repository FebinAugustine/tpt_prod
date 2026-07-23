package com.thepowertrainer.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.thepowertrainer.mobile.core.designsystem.theme.TptTheme
import com.thepowertrainer.mobile.navigation.AppNavHost
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // AppNavHost owns the single Scaffold (bottom nav bar + content
            // inset padding) so it can react to the current back stack entry
            // — don't reintroduce an outer Scaffold here, it would double up
            // insets/padding.
            TptTheme {
                AppNavHost()
            }
        }
    }
}
