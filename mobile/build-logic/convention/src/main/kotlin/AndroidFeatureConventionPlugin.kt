import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.project

/**
 * `thepowertrainer.android.feature` — the standard `:feature:*` module
 * template. Applies:
 *  - `thepowertrainer.android.library` (compileSdk/minSdk/compileOptions)
 *  - Compose (`thepowertrainer.android.library.compose`'s helper, applied
 *    directly here rather than via that plugin id, since a feature module
 *    also needs Hilt/serialization/navigation on top — not just Compose)
 *  - `thepowertrainer.android.hilt` (Hilt + KSP)
 *  - Kotlin serialization plugin
 *  - The baseline dependency set every feature module needs: the three
 *    `:core:*` modules, navigation-compose, hilt-navigation-compose,
 *    lifecycle-runtime-ktx, activity-compose, coroutines, kotlinx-serialization,
 *    and retrofit (every feature module talks to the backend directly through
 *    its own Retrofit API interface — see root CLAUDE.md Decision #2: no
 *    shared `:core:domain`, each feature owns its own network calls).
 *
 * A module-specific build.gradle.kts still sets its own `namespace` and adds
 * any EXTRA deps beyond this baseline (e.g. `:feature:catalog`/`:feature:admin`
 * additionally pulling in Coil for image loading, or icons-extended).
 */
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            with(pluginManager) {
                apply("thepowertrainer.android.library")
                apply("thepowertrainer.android.hilt")
                apply(libs.findPlugin("kotlin-serialization").get().get().pluginId)
            }

            extensions.configure<LibraryExtension> {
                configureAndroidCompose(this)
            }

            dependencies {
                add("implementation", project(":core:common"))
                add("implementation", project(":core:network"))
                add("implementation", project(":core:designsystem"))

                add("implementation", libs.findLibrary("androidx-navigation-compose").get())
                add("implementation", libs.findLibrary("hilt-navigation-compose").get())
                add("implementation", libs.findLibrary("androidx-lifecycle-runtime-ktx").get())
                add("implementation", libs.findLibrary("androidx-activity-compose").get())
                add("implementation", libs.findLibrary("kotlinx-coroutines-android").get())
                add("implementation", libs.findLibrary("kotlinx-serialization-json").get())
                add("implementation", libs.findLibrary("retrofit-core").get())
            }
        }
    }
}
