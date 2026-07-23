package com.thepowertrainer.mobile.feature.content.data

import retrofit2.http.GET
import retrofit2.http.Query

/** Both endpoints are public (no `@UseGuards`) and unwrapped (no `@WrapResponse()`),
 * matching `CareersController.findAll`/`PressController.findAll`. */
interface ContentApi {
    @GET("careers")
    suspend fun getCareers(@Query("active") active: String = "true"): List<CareerDto>

    @GET("press")
    suspend fun getPress(@Query("active") active: String = "true"): List<PressDto>
}
