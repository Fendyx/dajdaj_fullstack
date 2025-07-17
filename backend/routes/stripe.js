const express = require('express');
const Stripe = require("stripe");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!req.body.cartItems || !Array.isArray(req.body.cartItems)) {
      return res.status(400).json({ error: 'cartItems is required and must be an array' });
    }

    console.log('cartItems:', req.body.cartItems);
    console.log('Using Stripe key:', process.env.STRIPE_KEY);

    const line_items = req.body.cartItems.map(item => {
      if (!item.name || !item.price || !item.cartQuantity) {
        throw new Error('Invalid item in cartItems: missing name, price or cartQuantity');
      }

      const productData = {
        name: item.name,
        metadata: {
          id: item.id,
          ...(item.customText && { custom_text: item.customText })
        }
      };

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
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.cartQuantity,
      };
    });

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
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'pln' },
            display_name: 'Poczta Polska',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'pln' },
            display_name: 'DPD',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'pln' },
            display_name: 'DHL',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'pln' },
            display_name: 'ORLEN Paczka',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
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
    console.error('Stripe error:', {
      message: error.message,
      stack: error.stack,
      raw: error.raw,
    });

    res.status(500).json({
      error: error.message,
      stack: error.stack,
      raw: error.raw
    });
  }
});

module.exports = router;




