/**
 * Service for handling offline data storage and retrieval
 */
export const offlineService = {
  /**
   * Store data in local storage
   * @param type Data type identifier
   * @param id Item ID
   * @param data Data to store
   */
  async storeData<T>(type: string, id: string, data: T): Promise<void> {
    try {
      const key = `offline_${type}_${id}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Error storing offline data:", error);
    }
  },

  /**
   * Get data from local storage
   * @param type Data type identifier
   * @param id Item ID
   * @returns Stored data or null if not found
   */
  async getData<T>(type: string, id: string): Promise<T | null> {
    try {
      const key = `offline_${type}_${id}`;
      const storedItem = localStorage.getItem(key);

      if (!storedItem) return null;

      const { data } = JSON.parse(storedItem);
      return data as T;
    } catch (error) {
      console.error("Error retrieving offline data:", error);
      return null;
    }
  },

  /**
   * Check if device is online
   * @returns Boolean indicating online status
   */
  isOnline(): boolean {
    return navigator.onLine;
  },
};
