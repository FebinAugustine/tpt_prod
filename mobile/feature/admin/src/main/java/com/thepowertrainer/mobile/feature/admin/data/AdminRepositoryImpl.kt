package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.AdminUser
import com.thepowertrainer.mobile.feature.admin.domain.DashboardStats
import com.thepowertrainer.mobile.feature.admin.domain.NewUserInput
import com.thepowertrainer.mobile.feature.admin.domain.UpdateUserInput
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AdminRepositoryImpl @Inject constructor(
    private val api: AdminApi,
) : AdminRepository {

    override suspend fun getDashboardStats(): AppResult<DashboardStats> = safeCall {
        val dto = api.getDashboardStats()
        AppResult.Success(
            DashboardStats(
                totalUsers = dto.totalUsers ?: 0,
                activeUsers = dto.activeUsers ?: 0,
                pendingVerifications = dto.pendingVerifications ?: 0,
                totalRevenue = dto.totalRevenue ?: 0.0,
                totalCategories = dto.totalCategories ?: 0,
                totalProducts = dto.totalProducts ?: 0,
                totalOrders = dto.totalOrders ?: 0,
            ),
        )
    }

    override suspend fun getUsers(page: Int, search: String?): AppResult<List<AdminUser>> = safeCall {
        val dto = api.getUsers(page = page, search = search)
        AppResult.Success((dto.items ?: emptyList()).map { it.toDomain() })
    }

    override suspend fun addUser(input: NewUserInput): AppResult<AdminUser> = safeCall {
        AppResult.Success(
            api.addUser(AddUserRequest(input.fullName, input.email, input.password, input.role)).toDomain(),
        )
    }

    override suspend fun updateUser(id: String, input: UpdateUserInput): AppResult<AdminUser> = safeCall {
        AppResult.Success(
            api.updateUser(id, UpdateUserRequest(fullName = input.fullName, email = input.email, role = input.role)).toDomain(),
        )
    }

    override suspend fun deleteUser(id: String): AppResult<Unit> = safeCall {
        api.deleteUser(id)
        AppResult.Success(Unit)
    }

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.message() ?: "Server error", e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun AdminUserDto.toDomain() = AdminUser(
        id = id ?: "",
        fullName = fullName ?: "",
        email = email ?: "",
        phone = phone,
        role = role ?: "user",
        isVerified = isVerified ?: false,
    )
}
