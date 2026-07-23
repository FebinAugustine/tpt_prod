import com.android.build.api.dsl.ApplicationExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure

/**
 * `thepowertrainer.android.application` — applied by `:app` only.
 * Common Android app config (compileSdk/minSdk/compileOptions via
 * [configureKotlinAndroid]) + targetSdk, which is an application-only
 * concept (library modules don't set it — see KotlinAndroid.kt).
 * Also wires up Compose ([configureAndroidCompose]) since `:app` hosts
 * the root Composable (`AppNavHost`) — unlike bare library modules,
 * this one convention plugin covers both.
 */
class AndroidApplicationConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("com.android.application")

            extensions.configure<ApplicationExtension> {
                configureKotlinAndroid(this)
                defaultConfig.targetSdk = 36
                configureAndroidCompose(this)
            }
        }
    }
}
