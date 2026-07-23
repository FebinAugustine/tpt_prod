import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.dependencies

/**
 * `thepowertrainer.android.hilt` — applies Hilt + KSP and adds the
 * `hilt-android` / `ksp(hilt-compiler)` dependency pair. Standalone (not
 * folded into the feature convention plugin) because `:core:network` also
 * needs Hilt for its own DI module but is NOT a feature module (no Compose,
 * no navigation, no core-module deps) — see root CLAUDE.md's `:core:network`
 * section.
 *
 * NOTE: this project uses `ksp(hilt-compiler)`, not `kapt(hilt-android-compiler)`
 * — kapt is unusable under AGP 9's built-in Kotlin compilation (see
 * KotlinAndroid.kt's kdoc / root CLAUDE.md "Known gaps" #1, fix #2). Do not
 * reintroduce kapt here.
 */
class AndroidHiltConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply(libs.findPlugin("ksp").get().get().pluginId)
            pluginManager.apply(libs.findPlugin("hilt-android").get().get().pluginId)

            dependencies {
                add("implementation", libs.findLibrary("hilt-android").get())
                add("ksp", libs.findLibrary("hilt-compiler").get())
            }
        }
    }
}
