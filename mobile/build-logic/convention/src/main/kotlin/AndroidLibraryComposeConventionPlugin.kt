import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure

/**
 * `thepowertrainer.android.library.compose` — a library module with Compose
 * but no Hilt/feature-module baggage. Today this is exactly `:core:designsystem`'s
 * shape: `thepowertrainer.android.library` + Compose, nothing else.
 */
class AndroidLibraryComposeConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("thepowertrainer.android.library")

            extensions.configure<LibraryExtension> {
                configureAndroidCompose(this)
            }
        }
    }
}
