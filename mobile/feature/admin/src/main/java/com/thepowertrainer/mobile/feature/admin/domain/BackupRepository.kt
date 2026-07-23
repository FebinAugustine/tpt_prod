package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface BackupRepository {
    suspend fun export(type: ExportType, format: ExportFormat, dateRange: ExportDateRange): AppResult<ExportedFile>
}
