plugins {
    id("thepowertrainer.android.application")
    id("thepowertrainer.android.hilt")
}

android {
    namespace = "com.thepowertrainer.mobile"

    defaultConfig {
        applicationId = "com.thepowertrainer.mobile"
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            optimization {
                enable = false
            }
        }
    }
    dependenciesInfo {
        includeInBundle = true
    }
    buildToolsVersion = "36.0.0"
    ndkVersion = "30.0.15729638 rc2"

    // Needed so TptApplication can gate the debug-only Coil DebugLogger on
    // BuildConfig.DEBUG (added 2026-07-23) — the application convention
    // plugin doesn't enable this by default, only AndroidCompose.kt's
    // buildFeatures.compose.
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    // Core (foundational, generic)
    implementation(project(":core:common"))
    implementation(project(":core:network"))
    implementation(project(":core:designsystem"))

    // Features — :app only wires navigation between them; it doesn't
    // contain feature business logic itself.
    implementation(project(":feature:auth"))
    implementation(project(":feature:home"))
    implementation(project(":feature:catalog"))
    implementation(project(":feature:cart"))
    implementation(project(":feature:checkout"))
    implementation(project(":feature:orders"))
    implementation(project(":feature:wishlist"))
    implementation(project(":feature:profile"))
    implementation(project(":feature:addresses"))
    implementation(project(":feature:content"))
    implementation(project(":feature:admin"))

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.hilt.navigation.compose)

    // Coil's SingletonImageLoader.Factory (wired in TptApplication) needs
    // these directly in :app — see TptApplication.kt kdoc for why this was
    // necessary (coil3 does NOT auto-register a network fetcher just because
    // coil-network-okhttp is on the classpath, unlike coil2).
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)

    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
