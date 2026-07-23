plugins {
    id("thepowertrainer.android.feature")
}

android {
    namespace = "com.thepowertrainer.mobile.feature.admin"
}

dependencies {
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
    // FileProvider (BackupRepositoryImpl streams export files to cache and
    // shares them via a content:// Uri — mirrors the web's Blob download).
    implementation(libs.androidx.core.ktx)
}
