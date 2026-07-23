package com.thepowertrainer.mobile.feature.addresses.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface AddressesRepository {
    suspend fun getAddresses(): AppResult<List<Address>>
    suspend fun addAddress(input: AddressInput): AppResult<Address>
    suspend fun updateAddress(id: String, input: AddressInput): AppResult<Address>
    suspend fun deleteAddress(id: String): AppResult<Unit>
    suspend fun setDefaultAddress(id: String): AppResult<Address>
}
