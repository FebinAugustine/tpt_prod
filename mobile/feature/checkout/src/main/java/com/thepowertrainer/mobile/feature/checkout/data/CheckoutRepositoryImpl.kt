package com.thepowertrainer.mobile.feature.checkout.data

import com.thepowertrainer.mobile.core.common.cart.CartLine
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.network.backendMessage
import com.thepowertrainer.mobile.feature.checkout.domain.CheckoutRepository
import com.thepowertrainer.mobile.feature.checkout.domain.NewAddressInput
import com.thepowertrainer.mobile.feature.checkout.domain.ShippingAddress
import com.thepowertrainer.mobile.feature.checkout.domain.UpiSettings
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class CheckoutRepositoryImpl @Inject constructor(
    private val api: CheckoutApi,
    private val json: Json,
) : CheckoutRepository {

    override suspend fun getUpiSettings(): AppResult<UpiSettings?> = try {
        val dto = api.getUpiSettings()
        if (dto.upiId.isNullOrBlank() || dto.merchantName.isNullOrBlank()) {
            AppResult.Success(null)
        } else {
            AppResult.Success(UpiSettings(dto.upiId, dto.qrCodeUrl, dto.merchantName))
        }
    } catch (e: SerializationException) {
        // Backend returns a literal JSON `null` body when no admin has
        // configured UPI settings yet — not a real error, just "not set up".
        AppResult.Success(null)
    } catch (e: HttpException) {
        AppResult.Error(e.backendMessage(json), e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    }

    override suspend fun getAddresses(): AppResult<List<ShippingAddress>> = safeCall {
        AppResult.Success(api.getAddresses().map { it.toDomain() })
    }

    override suspend fun addAddress(input: NewAddressInput): AppResult<ShippingAddress> = safeCall {
        val request = CreateAddressRequest(
            label = input.label,
            fullName = input.fullName,
            phone = input.phone,
            address = input.address,
            city = input.city,
            state = input.state,
            pincode = input.pincode,
        )
        AppResult.Success(api.addAddress(request).toDomain())
    }

    override suspend fun placeOrder(
        items: List<CartLine>,
        address: ShippingAddress,
        transactionId: String,
        referenceNo: String,
    ): AppResult<String> = safeCall {
        val total = items.sumOf { (it.item.offerPrice ?: it.item.price) * it.quantity }
        val request = CreateOrderRequest(
            items = items.map { line ->
                OrderItemPayload(
                    product = line.item.productId,
                    name = line.item.name,
                    quantity = line.quantity,
                    price = line.item.price,
                    offerPrice = line.item.offerPrice,
                    images = listOfNotNull(line.item.imageUrl),
                )
            },
            shippingAddress = ShippingAddressPayload(
                fullName = address.fullName,
                phone = address.phone,
                address = address.address,
                city = address.city,
                state = address.state,
                pincode = address.pincode,
            ),
            subtotal = total,
            total = total,
            upiPaymentDetails = UpiPaymentDetailsPayload(transactionId, referenceNo),
        )
        AppResult.Success(api.createOrder(request).id)
    }

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        // Surfaces the backend's real class-validator message (e.g. "referenceNo
        // should not be empty") instead of Retrofit's generic "HTTP 400 Bad
        // Request" — this is what made the checkout Bad Request undiagnosable
        // from the app UI alone until this fix (2026-07-23).
        AppResult.Error(e.backendMessage(json), e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun AddressDto.toDomain() = ShippingAddress(
        id = id,
        label = label,
        fullName = fullName,
        phone = phone,
        address = address,
        city = city,
        state = state,
        pincode = pincode,
        isDefault = isDefault,
    )
}
