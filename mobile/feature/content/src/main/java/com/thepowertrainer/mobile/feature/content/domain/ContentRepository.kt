package com.thepowertrainer.mobile.feature.content.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/** Feature-owned — no shared :core:domain (see root CLAUDE.md Decision #2). */
interface ContentRepository {
    suspend fun getCareers(): AppResult<List<Career>>
    suspend fun getPress(): AppResult<List<PressItem>>
}
