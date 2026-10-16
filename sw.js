// El Service Worker (SW) actúa como un intermediario entre la web y la red. Permite que la app funcione sin internet.
// CACHE_NAME es el nombre de nuestra "caja" donde guardaremos los archivos temporalmente.
const CACHE_NAME = 'gastos-pwa-cache-v3';

// Lista de archivos principales de nuestra app que queremos guardar en el dispositivo del usuario
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Evento 'install': Se ejecuta la primera vez que el navegador detecta y registra este Service Worker
self.addEventListener('install', event => {
    // event.waitUntil pausa la instalación hasta que termine lo que está adentro
    event.waitUntil(
        // Abrimos (o creamos) la memoria caché con nuestro CACHE_NAME
        caches.open(CACHE_NAME)
            .then(cache => {
                // Descargamos y guardamos todos los archivos de nuestra lista urlsToCache
                return cache.addAll(urlsToCache);
            })
    );
    // Forzar al Service Worker a activarse inmediatamente (no espera a que el usuario cierre todas las pestañas de la app)
    self.skipWaiting();
});

// Evento 'activate': Se ejecuta justo después de que el SW se instala exitosamente
self.addEventListener('activate', event => {
    // Creamos una lista blanca con las cachés que queremos mantener (solo la actual)
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        // Revisamos todas las cachés guardadas en el navegador para esta web
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre de la caché antigua no está en nuestra lista blanca, la eliminamos
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Toma el control de la página de inmediato
    return self.clients.claim();
});

// Evento 'fetch': Este evento "atrapa" todas las peticiones de red que hace la app (ej: pedir una imagen o recargar la página)
self.addEventListener('fetch', event => {
    // Usamos una estrategia "Network First" (Red primero, si no hay internet va a Caché)
    event.respondWith(
        // 1. Intentamos buscar el recurso en internet usando fetch normal
        fetch(event.request).then(response => {
            // Si tenemos internet y la petición fue un éxito, clonamos la respuesta
            // Guardamos el clon en caché (para mantenerla actualizada) y retornamos la respuesta original
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
                return response;
            });
        }).catch(() => {
            // 2. Si fetch falla (por ejemplo, porque estamos sin internet/offline), buscamos el archivo en la caché
            return caches.match(event.request);
        })
    );
});
