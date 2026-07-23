package com.thepowertrainer.mobile.feature.admin.data

import android.content.Context
import androidx.core.content.FileProvider
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.BackupRepository
import com.thepowertrainer.mobile.feature.admin.domain.ExportDateRange
import com.thepowertrainer.mobile.feature.admin.domain.ExportFormat
import com.thepowertrainer.mobile.feature.admin.domain.ExportType
import com.thepowertrainer.mobile.feature.admin.domain.ExportedFile
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.File
import java.io.IOException
import javax.inject.Inject

/**
 * Downloads an export file from `GET /backup/export` and saves it under
 * `cacheDir/exports/`, then wraps it in a `content://` [android.net.Uri] via
 * [FileProvider] so [BackupViewModel] can hand it to Android's share sheet —
 * this is the mobile equivalent of the web's `URL.createObjectURL` + a
 * synthetic `<a download>` click, since there's no browser download manager
 * on Android to hand a Blob to.
 *
 * Requires a `<provider>` entry for `androidx.core.content.FileProvider`
 * declared in `:app`'s manifest with authority `${applicationId}.fileprovider`
 * — see `mobile/app/src/main/AndroidManifest.xml` and
 * `mobile/app/src/main/res/xml/file_paths.xml` (a `cache-path` covering the
 * `exports/` subfolder used here).
 */
class BackupRepositoryImpl @Inject constructor(
    private val api: BackupApi,
    @ApplicationContext private val context: Context,
) : BackupRepository {

    override suspend fun export(
        type: ExportType,
        format: ExportFormat,
        dateRange: ExportDateRange,
    ): AppResult<ExportedFile> = withContext(Dispatchers.IO) {
        try {
            val response = api.exportData(format.apiValue, type.apiValue, dateRange.apiValue)
            if (!response.isSuccessful) {
                return@withContext AppResult.Error("Export failed (HTTP ${response.code()})")
            }
            val body = response.body()
                ?: return@withContext AppResult.Error("Export returned no data")

            val filename = response.headers()["Content-Disposition"]
                ?.substringAfter("filename=\"", missingDelimiterValue = "")
                ?.substringBefore("\"")
                ?.takeIf { it.isNotBlank() }
                ?: "${type.apiValue}_export_${System.currentTimeMillis()}.${format.fileExtension}"

            val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
            val file = File(exportDir, filename)
            body.byteStream().use { input ->
                file.outputStream().use { output -> input.copyTo(output) }
            }

            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
            AppResult.Success(ExportedFile(uri = uri, filename = filename, mimeType = format.mimeType))
        } catch (e: HttpException) {
            AppResult.Error(e.message() ?: "Server error", e)
        } catch (e: IOException) {
            AppResult.Error("Network error — check your connection", e)
        } catch (e: Exception) {
            AppResult.Error(e.message ?: "Export failed", e)
        }
    }
}
