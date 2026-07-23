package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/** Feature-owned — no shared :core:domain (see root CLAUDE.md Decision #2). */
interface AdminRepository {
    suspend fun getDashboardStats(): AppResult<DashboardStats>
    suspend fun getUsers(page: Int = 1, search: String? = null): AppResult<List<AdminUser>>
    suspend fun addUser(input: NewUserInput): AppResult<AdminUser>
    suspend fun updateUser(id: String, input: UpdateUserInput): AppResult<AdminUser>
    suspend fun deleteUser(id: String): AppResult<Unit>
}
