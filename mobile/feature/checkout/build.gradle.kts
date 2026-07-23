plugins {
    id("thepowertrainer.android.feature")
}

android {
    namespace = "com.thepowertrainer.mobile.feature.checkout"
}

dependencies {
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.zxing.core)
}
