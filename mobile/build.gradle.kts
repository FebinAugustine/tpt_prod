// Top-level build file where you can add configuration options common to all sub-projects/modules.
// No module applies these plugins directly anymore — every module goes through the
// thepowertrainer.android.* convention plugins (see /build-logic) instead. BUT this
// `apply false` block must stay: it's what resolves the actual AGP/Kotlin/Hilt/KSP
// plugin JARs onto the root project's classpath. build-logic/convention's own
// `compileOnly` deps on these same artifacts only give build-logic's Kotlin code
// compile-time visibility to their API types (e.g. ApplicationExtension) — they do
// NOT make the plugin JARs resolvable at runtime when a convention plugin calls
// pluginManager.apply("com.android.application") inside a module. Removing this
// block (tried once, 2026-07-22) breaks every module with
// "Could not generate a decorated class ... com/android/build/api/dsl/ApplicationExtension"
// because the real plugin classes aren't on the classpath anywhere.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.hilt.android) apply false
    alias(libs.plugins.ksp) apply false
}