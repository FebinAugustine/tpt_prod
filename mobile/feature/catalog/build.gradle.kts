plugins {
    id("thepowertrainer.android.feature")
}

android {
    namespace = "com.thepowertrainer.mobile.feature.catalog"
}

dependencies {
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
}
