package com.thepowertrainer.mobile.feature.addresses.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.network.backendMessage
import com.thepowertrainer.mobile.feature.addresses.domain.Address
import com.thepowertrainer.mobile.feature.addresses.domain.AddressInput
import com.thepowertrainer.mobile.feature.addresses.domain.AddressesRepository
import kotlinx.serialization.json.Json
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AddressesRepositoryImpl @Inject constructor(
    private val api: AddressesApi,
    private val json: Json,
) : AddressesRepository {

    override suspend fun getAddresses(): AppResult<List<Address>> = safeCall {
        AppResult.Success(api.getAddresses().map { it.toDomain() })
    }

    override suspend fun addAddress(input: AddressInput): AppResult<Address> = safeCall {
        AppResult.Success(api.addAddress(input.toRequest()).toDomain())
    }

    override suspend fun updateAddress(id: String, input: AddressInput): AppResult<Address> = safeCall {
        AppResult.Success(api.updateAddress(id, input.toRequest()).toDomain())
    }

    override suspend fun deleteAddress(id: String): AppResult<Unit> = safeCall {
        api.deleteAddress(id)
        AppResult.Success(Unit)
    }

    override suspend fun setDefaultAddress(id: String): AppResult<Address> = safeCall {
        AppResult.Success(api.setDefaultAddress(id).toDomain())
    }

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.backendMessage(json), e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun AddressDto.toDomain() = Address(id, label, fullName, phone, address, city, state, pincode, isDefault)

    private fun AddressInput.toRequest() = AddressRequest(label, fullName, phone, address, city, state, pincode, isDefault)
}
