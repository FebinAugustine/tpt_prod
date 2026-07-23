package com.thepowertrainer.mobile.feature.admin.domain

import android.net.Uri

/** Mirrors `backend/src/backup/dto/export-data.dto.ts`'s `ExportFormat`. */
enum class ExportFormat(val apiValue: String, val label: String, val fileExtension: String, val mimeType: String) {
    JSON("json", "JSON", "json", "application/json"),
    EXCEL("excel", "Excel", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    PDF("pdf", "PDF", "pdf", "application/pdf"),
}

/** Mirrors `ExportType`. `ALL` has no single combined file on the backend —
 * same as the frontend's `exportAllData`, it's really 4 separate exports
 * (users/products/categories/orders) fired one after another. */
enum class ExportType(val apiValue: String, val label: String, val icon: String) {
    USERS("users", "Users", "👥"),
    PRODUCTS("products", "Products", "📦"),
    ORDERS("orders", "Orders", "🛒"),
    CATEGORIES("categories", "Categories", "📂"),
    ALL("all", "All Data", "💾"),
}

/** Mirrors `DateRange`. `apiValue = null` for "All Time" — the query param
 * is simply omitted, matching the frontend's `dateRange !== 'all'` check. */
enum class ExportDateRange(val apiValue: String?, val label: String) {
    ALL(null, "All Time"),
    LAST_WEEK("last_week", "Last Week"),
    LAST_MONTH("last_month", "Last Month"),
    LAST_3_MONTHS("last_3_months", "Last 3 Months"),
    LAST_6_MONTHS("last_6_months", "Last 6 Months"),
}

/** A single exported file, already saved to the app's cache dir and wrapped
 * in a shareable `content://` [Uri] via FileProvider — the mobile equivalent
 * of the web's client-side Blob download. */
data class ExportedFile(val uri: Uri, val filename: String, val mimeType: String)
