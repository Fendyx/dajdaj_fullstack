// ─── useCheckoutTotal ─────────────────────────────────────────────────────────
// Единственное место, где считается итог заказа.
// Легко расширять: добавляй промокоды, налоги, скидки — только сюда.

import { useMemo } from "react";
import { getDeliveryMethod } from "@/features/checkout/config/deliveryMethods";

interface CartItem {
  price: number;
  cartQuantity?: number;
  qty?: number;
}

interface CheckoutTotals {
  /** Сумма товаров в грошах (для Stripe) */
  subtotalCents: number;
  /** Стоимость доставки в грошах (для Stripe) */
  deliveryCents: number;
  /** Итог в грошах (для Stripe) */
  totalCents: number;

  /** Сумма товаров в PLN (для отображения) */
  subtotalPLN: number;
  /** Стоимость доставки в PLN (для отображения) */
  deliveryPLN: number;
  /** Итог в PLN (для отображения) */
  totalPLN: number;

  /** true если доставка бесплатна */
  isFreeDelivery: boolean;
}

export function useCheckoutTotal(
  items: CartItem[],
  deliveryMethodId: string
): CheckoutTotals {
  return useMemo(() => {
    // 1. Считаем стоимость товаров
    const subtotalPLN = items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.cartQuantity ?? item.qty) || 1;
      return acc + price * qty;
    }, 0);

    // 2. Находим метод доставки и считаем её стоимость
    const method = getDeliveryMethod(deliveryMethodId);
    let deliveryPLN = method?.price ?? 0;

    // Логика "бесплатно от N злотых"
    if (method?.freeFrom && subtotalPLN >= method.freeFrom) {
      deliveryPLN = 0;
    }

    const isFreeDelivery = deliveryPLN === 0;

    // 3. Итог
    const totalPLN = subtotalPLN + deliveryPLN;

    return {
      subtotalCents: Math.round(subtotalPLN * 100),
      deliveryCents: Math.round(deliveryPLN * 100),
      totalCents: Math.round(totalPLN * 100),

      subtotalPLN: parseFloat(subtotalPLN.toFixed(2)),
      deliveryPLN: parseFloat(deliveryPLN.toFixed(2)),
      totalPLN: parseFloat(totalPLN.toFixed(2)),

      isFreeDelivery,
    };
  }, [items, deliveryMethodId]);
}