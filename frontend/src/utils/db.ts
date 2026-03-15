import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'DajDajStoreDB';
const STORE_NAME = 'pending_orders';

interface PendingOrder {
  id: string;
  inscription: string;
  images: string[];  // теперь URLs от Cloudinary, не base64
  timestamp: number;
}

const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveOrderToDB = async (orderData: PendingOrder): Promise<void> => {
  const db = await initDB();
  await db.put(STORE_NAME, orderData);
};

export const getOrderFromDB = async (id: string): Promise<PendingOrder | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const deleteOrderFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};