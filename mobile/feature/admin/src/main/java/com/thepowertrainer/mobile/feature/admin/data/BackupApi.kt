package com.thepowertrainer.mobile.feature.admin.data

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query
import retrofit2.http.Streaming

/** Matches `BackupController.exportData` — admin-guarded, returns a raw
 * binary file (`Content-Disposition: attachment`), not a JSON envelope.
 * `@Streaming` tells Retrofit/OkHttp not to buffer the whole response body
 * into memory before we get to read it (export files can be large). */
interface BackupApi {
    @Streaming
    @GET("backup/export")
    suspend fun exportData(
        @Query("format") format: String,
        @Query("type") type: String,
        @Query("dateRange") dateRange: String? = null,
    ): Response<ResponseBody>
}
