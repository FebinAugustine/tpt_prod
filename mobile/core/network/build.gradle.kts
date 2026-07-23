plugins {
    id("thepowertrainer.android.library")
    id("thepowertrainer.android.hilt")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.thepowertrainer.mobile.core.network"

    defaultConfig {
        // Fallback if a build type doesn't override it below.
        buildConfigField("String", "API_BASE_URL", "\"https://api.thepowertrainer.cloud/api/v1/\"")
    }

    buildTypes {
        debug {
            // 10.0.2.2 is the emulator's alias for the host machine's
            // localhost — points at `docker compose up` from the dev
            // docker-compose.yml at the repo root. For a physical device on
            // the same LAN, swap this for the host machine's LAN IP instead.
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:5000/api/v1/\"")
        }
        release {
            buildConfigField("String", "API_BASE_URL", "\"https://api.thepowertrainer.cloud/api/v1/\"")
        }
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation(project(":core:common"))

    implementation(libs.retrofit.core)
    implementation(libs.retrofit.converter.kotlinx.serialization)
    implementation(libs.okhttp.core)
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.datastore.preferences)
}
