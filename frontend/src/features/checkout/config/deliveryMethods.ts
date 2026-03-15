// ─── Delivery Methods Config ──────────────────────────────────────────────────
// Добавляй новые методы сюда — всё остальное подхватится автоматически.

export interface DeliveryMethod {
    id: string;
    label: string;
    description: string;
    price: number; // в злотых (PLN), 0 = бесплатно
    freeFrom?: number; // бесплатно если subtotal >= этого значения (опционально)
  }
  
  export const DELIVERY_METHODS: DeliveryMethod[] = [
    {
      id: "inpost",
      label: "InPost Paczkomaty 24/7",
      description: "1–2 business days",
      price: 0,
      freeFrom: 100,
    },
    {
      id: "courier",
      label: "Courier DPD / DHL",
      description: "Next day delivery",
      price: 15,
      freeFrom: 200, // ← раскомментируй, чтобы курьер стал бесплатным от 200 PLN
    },
  ];
  
  export const getDeliveryMethod = (id: string): DeliveryMethod | undefined =>
    DELIVERY_METHODS.find((m) => m.id === id);