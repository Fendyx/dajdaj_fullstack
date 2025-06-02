const express = require('express');
const Stripe = require("stripe");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    const line_items = req.body.cartItems.map(item => {
      const productData = {
        name: item.name,
        images: [item.image],
        metadata: {
          id: item.id,
          ...(item.customText && { custom_text: item.customText })
        }
      };

      // Формируем описание продукта
      const descriptionParts = [];
      if (item.desc) descriptionParts.push(item.desc);
      if (item.customText) descriptionParts.push(`Custom Text: ${item.customText}`);
      
      if (descriptionParts.length > 0) {
        productData.description = descriptionParts.join('\n\n');
      }

      return {
        price_data: {
          currency: 'pln',
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Округляем для избежания ошибок
        },
        quantity: item.cartQuantity,
      };
    });

    // Собираем все кастомные тексты для метаданных сессии
    const customTexts = req.body.cartItems
      .filter(item => item.customText)
      .reduce((acc, item) => {
        acc[`custom_text_${item.id}`] = item.customText;
        return acc;
      }, {});

    const session = await stripe.checkout.sessions.create({
      shipping_address_collection: { allowed_countries: ['PL'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'pln' },
            display_name: 'Inpost',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        },
        // ... другие shipping options
      ],
      phone_number_collection: { enabled: true },
      line_items,
      mode: 'payment',
      locale: 'pl',
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        ...customTexts,
        cart_items_count: req.body.cartItems.length.toString()
      }
    });

    res.send({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

