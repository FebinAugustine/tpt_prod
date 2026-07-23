package com.thepowertrainer.mobile.feature.content.presentation

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

private data class FaqQa(val question: String, val answer: String)
private data class FaqCategory(val name: String, val items: List<FaqQa>)

private val faqCategories = listOf(
    FaqCategory(
        "Orders & Tracking",
        listOf(
            FaqQa("How do I place an order?", "Browse products, add items to your cart, and proceed to checkout. Enter your shipping details and choose a payment method to complete your order."),
            FaqQa("How can I track my order?", "Once shipped, you'll receive an email/SMS with tracking details. You can also track from the My Orders section."),
            FaqQa("Can I modify my order after placing it?", "You can modify your order within 1 hour of placing it, before it enters processing. Contact support immediately."),
            FaqQa("How long does processing take?", "Orders are typically processed within 1-2 business days, then shipped within 3-7 business days depending on location."),
        ),
    ),
    FaqCategory(
        "Products & Supplements",
        listOf(
            FaqQa("Are your supplements safe to use?", "Yes, all products are manufactured in GMP-certified facilities. We recommend consulting a healthcare professional before starting any supplement."),
            FaqQa("What is the shelf life of your products?", "Most supplements have a 2-year shelf life from manufacture date, printed on the packaging."),
            FaqQa("Are your products vegetarian/vegan-friendly?", "Varies by product — check the product description, which clearly labels dietary suitability."),
        ),
    ),
    FaqCategory(
        "Payments",
        listOf(
            FaqQa("What payment methods do you accept?", "UPI (Google Pay, PhonePe, Paytm, etc.) via QR code. Razorpay card/net-banking support is on the website but not yet enabled in this app."),
            FaqQa("Is it safe to pay?", "Yes, we use SSL encryption and secure payment gateways. Your payment information is never stored on our servers."),
            FaqQa("Why is my payment pending verification?", "UPI transactions are manually verified by our team, typically within 1-2 business hours."),
            FaqQa("Do you offer Cash on Delivery?", "Currently we only accept prepaid orders via UPI, to keep pricing competitive and service quality high."),
        ),
    ),
    FaqCategory(
        "Shipping & Returns",
        listOf(
            FaqQa("Do you ship across India?", "Yes, we ship to all major cities and towns. Delivery times vary by location."),
            FaqQa("What is your return policy?", "15-day returns for unopened products, 7 days for defective items. See our Returns policy for full details."),
            FaqQa("When will I receive my refund?", "Refunds are processed within 5-7 business days after the return is approved, to your original payment method."),
        ),
    ),
    FaqCategory(
        "Account & Support",
        listOf(
            FaqQa("I forgot my password. What should I do?", "Tap Forgot Password on the login screen, enter your email, and follow the reset instructions sent to your inbox."),
            FaqQa("How can I contact customer support?", "Email supporttpt@gmail.com or call +91 9447540035, Mon-Sat 9AM-6PM."),
        ),
    ),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaqRoute(onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Frequently Asked Questions") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            faqCategories.forEach { category ->
                Column {
                    Text(category.name, style = MaterialTheme.typography.titleMedium)
                    Column(modifier = Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        category.items.forEach { qa -> FaqItem(qa) }
                    }
                }
            }
        }
    }
}

@Composable
private fun FaqItem(qa: FaqQa) {
    var expanded by remember { mutableStateOf(false) }
    Card(modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded }) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(qa.question, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
                Icon(if (expanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore, contentDescription = null)
            }
            if (expanded) {
                Text(
                    qa.answer,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
        }
    }
}
