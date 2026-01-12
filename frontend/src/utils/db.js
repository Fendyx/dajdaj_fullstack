import { openDB } from 'idb';

const DB_NAME = 'DajDajStoreDB';
const STORE_NAME = 'pending_orders';

// Инициализация БД
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

// Сохранение заказа (используется в PersonalFigurine)
export const saveOrderToDB = async (orderData) => {
  const db = await initDB();
  return db.put(STORE_NAME, orderData);
};

// Получение заказа (НУЖНО ДЛЯ ОПЛАТЫ)
export const getOrderFromDB = async (id) => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

// Удаление после успешной оплаты (опционально)
export const deleteOrderFromDB = async (id) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};