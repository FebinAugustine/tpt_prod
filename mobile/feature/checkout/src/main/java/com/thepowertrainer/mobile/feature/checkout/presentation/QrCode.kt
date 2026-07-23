package com.thepowertrainer.mobile.feature.checkout.presentation

import android.graphics.Bitmap
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.ImageBitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

/**
 * Renders [content] (the "upi://pay?..." deep link) as a QR bitmap entirely
 * on-device — mirrors the frontend's qrcode.react usage. There is no backend
 * QR-generation endpoint; the QR is just a visual encoding of the same UPI
 * URI string built in CheckoutModels.kt's UpiSettings.buildPaymentUri().
 */
@Composable
fun rememberQrCodeBitmap(content: String, sizePx: Int = 512): ImageBitmap? {
    return remember(content, sizePx) {
        runCatching {
            val matrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, sizePx, sizePx)
            val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.RGB_565)
            for (x in 0 until sizePx) {
                for (y in 0 until sizePx) {
                    bitmap.setPixel(x, y, if (matrix[x, y]) 0xFF000000.toInt() else 0xFFFFFFFF.toInt())
                }
            }
            bitmap.asImageBitmap()
        }.getOrNull()
    }
}
