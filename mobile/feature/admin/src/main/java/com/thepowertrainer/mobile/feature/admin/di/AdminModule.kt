package com.thepowertrainer.mobile.feature.admin.di

import com.thepowertrainer.mobile.feature.admin.data.AdminApi
import com.thepowertrainer.mobile.feature.admin.data.AdminRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.BackupApi
import com.thepowertrainer.mobile.feature.admin.data.BackupRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.BannersApi
import com.thepowertrainer.mobile.feature.admin.data.BannersRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.CareersAdminApi
import com.thepowertrainer.mobile.feature.admin.data.CareersAdminRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.CategoriesAdminApi
import com.thepowertrainer.mobile.feature.admin.data.CategoriesAdminRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.OfferCardsApi
import com.thepowertrainer.mobile.feature.admin.data.OfferCardsRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.OrdersAdminApi
import com.thepowertrainer.mobile.feature.admin.data.OrdersAdminRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.PressAdminApi
import com.thepowertrainer.mobile.feature.admin.data.PressAdminRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.ProductsApi
import com.thepowertrainer.mobile.feature.admin.data.ProductsRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.data.SettingsAdminApi
import com.thepowertrainer.mobile.feature.admin.data.SettingsAdminRepositoryImpl
import com.thepowertrainer.mobile.feature.admin.domain.AdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.BackupRepository
import com.thepowertrainer.mobile.feature.admin.domain.BannersRepository
import com.thepowertrainer.mobile.feature.admin.domain.CareersAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.CategoriesAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.OfferCardsRepository
import com.thepowertrainer.mobile.feature.admin.domain.OrdersAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.PressAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.ProductsRepository
import com.thepowertrainer.mobile.feature.admin.domain.SettingsAdminRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AdminModule {

    @Binds
    @Singleton
    abstract fun bindAdminRepository(impl: AdminRepositoryImpl): AdminRepository

    @Binds
    @Singleton
    abstract fun bindProductsRepository(impl: ProductsRepositoryImpl): ProductsRepository

    @Binds
    @Singleton
    abstract fun bindOrdersAdminRepository(impl: OrdersAdminRepositoryImpl): OrdersAdminRepository

    @Binds
    @Singleton
    abstract fun bindCategoriesAdminRepository(impl: CategoriesAdminRepositoryImpl): CategoriesAdminRepository

    @Binds
    @Singleton
    abstract fun bindBannersRepository(impl: BannersRepositoryImpl): BannersRepository

    @Binds
    @Singleton
    abstract fun bindOfferCardsRepository(impl: OfferCardsRepositoryImpl): OfferCardsRepository

    @Binds
    @Singleton
    abstract fun bindCareersAdminRepository(impl: CareersAdminRepositoryImpl): CareersAdminRepository

    @Binds
    @Singleton
    abstract fun bindPressAdminRepository(impl: PressAdminRepositoryImpl): PressAdminRepository

    @Binds
    @Singleton
    abstract fun bindSettingsAdminRepository(impl: SettingsAdminRepositoryImpl): SettingsAdminRepository

    @Binds
    @Singleton
    abstract fun bindBackupRepository(impl: BackupRepositoryImpl): BackupRepository

    companion object {
        @Provides
        @Singleton
        fun provideAdminApi(retrofit: Retrofit): AdminApi = retrofit.create(AdminApi::class.java)

        @Provides
        @Singleton
        fun provideProductsApi(retrofit: Retrofit): ProductsApi = retrofit.create(ProductsApi::class.java)

        @Provides
        @Singleton
        fun provideOrdersAdminApi(retrofit: Retrofit): OrdersAdminApi = retrofit.create(OrdersAdminApi::class.java)

        @Provides
        @Singleton
        fun provideCategoriesAdminApi(retrofit: Retrofit): CategoriesAdminApi = retrofit.create(CategoriesAdminApi::class.java)

        @Provides
        @Singleton
        fun provideBannersApi(retrofit: Retrofit): BannersApi = retrofit.create(BannersApi::class.java)

        @Provides
        @Singleton
        fun provideOfferCardsApi(retrofit: Retrofit): OfferCardsApi = retrofit.create(OfferCardsApi::class.java)

        @Provides
        @Singleton
        fun provideCareersAdminApi(retrofit: Retrofit): CareersAdminApi = retrofit.create(CareersAdminApi::class.java)

        @Provides
        @Singleton
        fun providePressAdminApi(retrofit: Retrofit): PressAdminApi = retrofit.create(PressAdminApi::class.java)

        @Provides
        @Singleton
        fun provideSettingsAdminApi(retrofit: Retrofit): SettingsAdminApi = retrofit.create(SettingsAdminApi::class.java)

        @Provides
        @Singleton
        fun provideBackupApi(retrofit: Retrofit): BackupApi = retrofit.create(BackupApi::class.java)
    }
}
