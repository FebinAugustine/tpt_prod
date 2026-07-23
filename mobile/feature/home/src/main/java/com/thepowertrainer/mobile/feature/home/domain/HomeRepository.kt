package com.thepowertrainer.mobile.feature.home.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface HomeRepository {
    suspend fun loadHomeFeed(): AppResult<HomeFeed>
}
