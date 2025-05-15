/// <reference lib="webworker" />

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules

declare const self: ServiceWorkerGlobalScope;

// Cache names
const CACHE_NAMES = {
  static: "static-cache-v1",
  dynamic: "dynamic-cache-v1",
  offline: "offline-cache-v1",
};

// Resources to precache
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
];

// Offline fallback page
const OFFLINE_PAGE = "/offline.html";

// Install event - precache static assets and offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.static).then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(CACHE_NAMES.offline).then((cache) => {
        console.log("Caching offline page");
        return cache.add(OFFLINE_PAGE);
      }),
    ]).then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches that don't match our current cache names
              return (
                cacheName !== CACHE_NAMES.static &&
                cacheName !== CACHE_NAMES.dynamic &&
                cacheName !== CACHE_NAMES.offline
              );
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - network first with cache fallback strategy
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // For HTML pages - network first, then cache, then offline page
  if (event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAMES.dynamic).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request).then((cacheResponse) => {
            return cacheResponse || caches.match(OFFLINE_PAGE);
          });
        }),
    );
    return;
  }

  // For API requests - network first with cache fallback
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAMES.dynamic).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        }),
    );
    return;
  }

  // For other assets - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      // Return cached response if available
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update cache with fresh response
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAMES.dynamic).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // If fetch fails and no cache, return nothing (or could return a default asset)
          console.log("Fetch failed and no cache for:", event.request.url);
        });

      return cacheResponse || fetchPromise;
    }),
  );
});

// Background sync registration
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-assessments") {
    event.waitUntil(syncAssessments());
  } else if (event.tag === "sync-photos") {
    event.waitUntil(syncPhotos());
  }
});

// Push notification handling
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Barakatna Platform";
  const options = {
    body: data.body || "New notification",
    icon: "/pwa-192x192.png",
    badge: "/badge-72x72.png",
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Open the app and navigate to a specific URL when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    }),
  );
});

// Helper function to sync assessments
async function syncAssessments() {
  try {
    // Get all assessment data from IndexedDB
    const assessmentsToSync = await getDataFromIndexedDB("offline-assessments");

    // Send each assessment to the server
    for (const assessment of assessmentsToSync) {
      await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessment),
      });

      // Remove from IndexedDB after successful sync
      await removeFromIndexedDB("offline-assessments", assessment.id);
    }

    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: "SYNC_COMPLETE",
        syncType: "assessments",
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error("Assessment sync failed:", error);
    return false;
  }
}

// Helper function to sync photos
async function syncPhotos() {
  try {
    // Get all photo data from IndexedDB
    const photosToSync = await getDataFromIndexedDB("offline-photos");

    // Send each photo to the server
    for (const photo of photosToSync) {
      const formData = new FormData();
      formData.append("photo", photo.blob, photo.filename);
      formData.append("metadata", JSON.stringify(photo.metadata));

      await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      // Remove from IndexedDB after successful sync
      await removeFromIndexedDB("offline-photos", photo.id);
    }

    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: "SYNC_COMPLETE",
        syncType: "photos",
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error("Photo sync failed:", error);
    return false;
  }
}

// Helper function to get data from IndexedDB
async function getDataFromIndexedDB(storeName: string) {
  return new Promise<any[]>((resolve, reject) => {
    const request = indexedDB.open("barakatna-offline-db", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const items: any[] = [];

      store.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

// Helper function to remove data from IndexedDB
async function removeFromIndexedDB(storeName: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("barakatna-offline-db", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);

      transaction.oncomplete = () => db.close();
    };
  });
}
