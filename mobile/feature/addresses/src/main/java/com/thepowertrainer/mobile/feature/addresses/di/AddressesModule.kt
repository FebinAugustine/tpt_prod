package com.thepowertrainer.mobile.feature.addresses.di

import com.thepowertrainer.mobile.feature.addresses.data.AddressesApi
import com.thepowertrainer.mobile.feature.addresses.data.AddressesRepositoryImpl
import com.thepowertrainer.mobile.feature.addresses.domain.AddressesRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AddressesModule {

    @Binds
    @Singleton
    abstract fun bindAddressesRepository(impl: AddressesRepositoryImpl): AddressesRepository

    companion object {
        @Provides
        @Singleton
        fun provideAddressesApi(retrofit: Retrofit): AddressesApi = retrofit.create(AddressesApi::class.java)
    }
}
