package com.thepowertrainer.mobile.feature.content.presentation

import androidx.compose.runtime.Composable

@Composable
fun AboutRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "About The Power Trainer",
        subtitle = "Empowering Your Fitness Journey Since 2024",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "Our Story",
                "The Power Trainer was founded with a clear mission: to make premium fitness supplements " +
                    "accessible to every Indian who aspires to achieve their health and fitness goals. What " +
                    "started as a small initiative has grown into a trusted destination for fitness " +
                    "enthusiasts across the nation. We believe everyone deserves access to quality " +
                    "supplements that support their fitness journey, whether you're a beginner or an elite athlete.",
            ),
            ContentSection(
                "Our Mission",
                "To empower individuals to achieve their fitness potential by providing authentic, " +
                    "high-quality supplements at affordable prices, backed by exceptional customer service " +
                    "and expert guidance.",
            ),
            ContentSection(
                "Why Choose Us",
                "100% Authentic — genuine products sourced directly from manufacturers.\n" +
                    "Quality Assured — GMP certified manufacturing standards.\n" +
                    "Affordable Pricing — best prices guaranteed on all products.\n" +
                    "Expert Support — dedicated customer service team.",
            ),
            ContentSection(
                "Our Product Range",
                "Whey Protein, Creatine, Pre-Workout formulas, Mass Gainers, BCAAs & EAAs, Vitamins & " +
                    "Minerals, and Protein Bars — a comprehensive selection to support every fitness goal.",
            ),
            ContentSection(
                "Our Values",
                "Integrity, Quality, Customer Focus, Continual Improvement, and Community — the principles " +
                    "behind everything we do.",
            ),
        ),
    )
}

@Composable
fun PrivacyRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "Privacy Policy",
        subtitle = "Last updated: April 2026",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "1. Introduction",
                "At The Power Trainer, we value your privacy and are committed to protecting your personal " +
                    "information. This Privacy Policy explains how we collect, use, disclose, and safeguard " +
                    "your data when you use our fitness supplement store and services.",
            ),
            ContentSection(
                "2. Information We Collect",
                "Personal Information (name, email, phone, shipping/billing address), Account Information, " +
                    "Payment Information (processed securely), Usage Data, and optional Health Information " +
                    "(fitness goals, dietary preferences).",
            ),
            ContentSection(
                "3. How We Use Your Information",
                "To process and fulfill orders, provide customer support, send order/shipping updates, " +
                    "improve our services, comply with legal obligations, and personalize recommendations.",
            ),
            ContentSection(
                "4. Information Sharing & Disclosure",
                "We do not sell your personal information. We may share data with service providers " +
                    "(payment processors, shipping partners, cloud hosting), when required by law, or in " +
                    "business transfers such as a merger or acquisition.",
            ),
            ContentSection(
                "5. Data Security",
                "We implement industry-standard security measures including SSL encryption, secure payment " +
                    "gateways, and regular security audits.",
            ),
            ContentSection(
                "6. Your Rights",
                "You may access and review your data, request correction or deletion, opt out of marketing " +
                    "communications, and request data portability.",
            ),
            ContentSection(
                "7. Cookies & Tracking",
                "We use cookies to enhance your browsing experience, analyze traffic, and personalize " +
                    "content. Manage preferences through your browser settings.",
            ),
            ContentSection(
                "8. Children's Privacy",
                "Our services are not intended for individuals under 18. We do not knowingly collect " +
                    "personal information from children.",
            ),
            ContentSection(
                "9. Changes to This Policy",
                "We may update this Privacy Policy periodically and will notify you of material changes on " +
                    "this page.",
            ),
        ),
    )
}

@Composable
fun TermsRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "Terms of Use",
        subtitle = "Last updated: April 2026",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "1. Acceptance of Terms",
                "By accessing and using The Power Trainer website and services, you accept and agree to be " +
                    "bound by the terms of this agreement.",
            ),
            ContentSection(
                "2. User Accounts & Eligibility",
                "You must be 18 or older to create an account, are responsible for your account " +
                    "credentials and activity, and must provide accurate registration information.",
            ),
            ContentSection(
                "3. Product Information",
                "Descriptions, images, and pricing are subject to change. Products are intended for " +
                    "healthy adults as dietary supplements — consult a healthcare professional before use.",
            ),
            ContentSection(
                "4. Orders & Payments",
                "Orders are subject to availability and price confirmation. We accept UPI and card payments " +
                    "via Razorpay. We reserve the right to refuse or cancel any order.",
            ),
            ContentSection(
                "5. Shipping & Delivery",
                "Delivery times are estimates. Shipping costs are calculated at checkout. Risk of loss " +
                    "passes to you upon delivery to the carrier.",
            ),
            ContentSection(
                "6. Returns & Refunds",
                "Unopened products can be returned within 15 days; defective items within 7 days. Refunds " +
                    "are processed within 5-7 business days after approval.",
            ),
            ContentSection(
                "7. Intellectual Property",
                "All content on this app/website, including logos, product images, and descriptions, is the " +
                    "intellectual property of The Power Trainer.",
            ),
            ContentSection(
                "8. Limitation of Liability",
                "The Power Trainer shall not be liable for indirect, incidental, or consequential damages " +
                    "resulting from use of our services.",
            ),
            ContentSection(
                "9. Governing Law",
                "These terms are governed by the laws of India, with disputes subject to the exclusive " +
                    "jurisdiction of the courts in Kerala, India.",
            ),
        ),
    )
}

@Composable
fun ShippingRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "Shipping Information",
        subtitle = "Last updated: April 2026",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "Delivery Timelines",
                "Standard Delivery: 5-7 business days — ₹49\n" +
                    "Express Delivery: 2-3 business days — ₹99\n" +
                    "Same Day Delivery: orders before 12 PM — ₹149\n" +
                    "Free Shipping: 5-7 business days — FREE on orders above ₹999",
            ),
            ContentSection(
                "Delivery Areas",
                "Metro Cities: 3-5 business days\nTier 1 Cities: 4-6 business days\n" +
                    "Tier 2 & 3 Cities: 5-8 business days\nRemote Areas: 7-12 business days",
            ),
            ContentSection(
                "Shipping Process",
                "Order confirmation → payment verification → packing → shipment with tracking number → " +
                    "in transit → delivery to your address.",
            ),
            ContentSection(
                "Packaging Quality",
                "Tamper-proof, temperature-controlled where needed, cushioned for shock protection, and " +
                    "discreetly packaged for privacy.",
            ),
            ContentSection(
                "Failed Delivery",
                "If delivery fails, our partner attempts 2 more deliveries and contacts you to reschedule. " +
                    "Unclaimed packages are returned to us — contact support to reschedule or cancel.",
            ),
        ),
    )
}

@Composable
fun ReturnsRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "Returns & Refunds",
        subtitle = "Last updated: April 2026",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "Return Eligibility",
                "Accepted: unopened products in original packaging, defective/damaged items, wrong item " +
                    "received, expired products.\n" +
                    "Not accepted: opened/used products, broken seals, personal care items, sale items.",
            ),
            ContentSection(
                "Return Window",
                "Unopened products: 15 days from delivery.\nDefective products: 7 days, with photo/video " +
                    "proof.\nWrong item: 7 days, unopened.\nExpired products: immediate, with proof of expiry.",
            ),
            ContentSection(
                "How to Initiate a Return",
                "Go to My Orders → select the order → tap Return Item → choose reason and (if applicable) " +
                    "upload photos → submit. Our team reviews within 24-48 hours.",
            ),
            ContentSection(
                "Refund Timeline by Payment Method",
                "UPI: 3-5 business days\nDebit/Credit Cards: 5-7 business days\nNet Banking: 5-7 business " +
                    "days\nWallet: 3-5 business days",
            ),
            ContentSection(
                "Damage During Transit",
                "Refuse delivery if visibly damaged. If noticed after opening, contact us within 24 hours " +
                    "with photos — we'll arrange a replacement or full refund.",
            ),
        ),
    )
}

@Composable
fun CancellationRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "Cancellation Policy",
        subtitle = "Last updated: April 2026",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "Cancellation Timeframe",
                "Orders can be cancelled within 1 hour of placing the order, before it enters processing. " +
                    "Once shipped, cancellation is not possible — you may return the item after delivery instead.",
            ),
            ContentSection(
                "How to Cancel",
                "Go to My Orders → find the order → tap Cancel Order → select a reason → confirm. You'll " +
                    "receive a confirmation email/SMS.",
            ),
            ContentSection(
                "Refund Timeline",
                "UPI payments: 3-5 business days.\nCard/Razorpay payments: 5-7 business days, credited to " +
                    "the original payment method.",
            ),
            ContentSection(
                "Cancellation by The Power Trainer",
                "We reserve the right to cancel orders due to stock issues, failed payment verification, " +
                    "suspicious activity, or pricing errors — you'll be notified and fully refunded.",
            ),
        ),
    )
}

@Composable
fun PaymentsRoute(onBack: () -> Unit) {
    StaticContentScreen(
        title = "Payment Methods",
        subtitle = "Last updated: April 2026",
        onBack = onBack,
        sections = listOf(
            ContentSection(
                "Accepted Payment Methods",
                "UPI QR Code — pay instantly using any UPI app (Google Pay, PhonePe, Paytm, BHIM) by " +
                    "scanning our QR code. This is the primary and currently active checkout method in the app.\n\n" +
                    "Razorpay (cards, net banking, wallets) is supported on the website but not yet enabled " +
                    "in this app.",
            ),
            ContentSection(
                "How to Pay with UPI",
                "Add items to cart → proceed to checkout → a QR code is displayed → scan it with your UPI " +
                    "app and complete the payment → enter the transaction ID / UPI reference number → place your order.",
            ),
            ContentSection(
                "Payment Security",
                "All payment data is encrypted using industry-standard SSL/TLS. We do not store your payment " +
                    "credentials on our servers.",
            ),
            ContentSection(
                "Payment Verification",
                "UPI payments are manually verified by our team, typically within 1-2 business hours. " +
                    "You'll receive email/SMS notifications at each step.",
            ),
        ),
    )
}
