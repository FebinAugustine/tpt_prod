import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure

/**
 * `thepowertrainer.android.library` — the bare-minimum convention for any
 * Android library module in this project: just the common
 * compileSdk/minSdk/compileOptions block (see [configureKotlinAndroid]).
 * Used directly by modules with no Compose/Hilt (`:core:common`), and as
 * the base every other convention plugin here builds on top of.
 */
class AndroidLibraryConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("com.android.library")

            extensions.configure<LibraryExtension> {
                configureKotlinAndroid(this)
            }
        }
    }
}
