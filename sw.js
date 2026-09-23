const CACHE_NAME = "campus-shuttle-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./timetable.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_FILES);

            })

    );

    self.skipWaiting();
});


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            );

        })

    );

    self.clients.claim();
});


/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)

            .then(response => {

                const responseCopy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseCopy
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(event.request);

            })

    );

});