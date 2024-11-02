// Add these type definitions at the top
type ValidStorageTypes = string | number | object | boolean | null;

// Add IndexedDB utility functions
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('quiz', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('gameData')) {
                db.createObjectStore('gameData');
            }
        };
        
        request.onsuccess = () => resolve(request.result);
    });
};

export const setData = async (key: string, value: ValidStorageTypes) => {
    const db = await initDB() as IDBDatabase;
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

export const getData = async (key: string) => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['gameData'], 'readonly');
      const store = transaction.objectStore('gameData');
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
};

export const getQuizData = async <T extends ValidStorageTypes>(key: string): Promise<T | undefined> => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        const request = store.get(key);
        
        request.onerror = () => {
            console.error(`Error getting data for key: ${key}`, request.error);
            reject(request.error);
        };
        request.onsuccess = () => {
            console.log(`Data retrieved for key ${key}:`, request.result);
            if (request.result === undefined) {
                console.warn(`No data found for key: ${key}`);
                resolve(undefined);
            } else {
                resolve(request.result as T);
            }
        };
    });
};

export const getAllStoredData = async (): Promise<Record<string, ValidStorageTypes>> => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const allKeys = store.getAllKeys();
            allKeys.onsuccess = () => {
                const result = allKeys.result.reduce((acc, key, index) => {
                    acc[key as string] = request.result[index];
                    return acc;
                }, {} as Record<string, ValidStorageTypes>);
                resolve(result);
            };
        };
    });
};