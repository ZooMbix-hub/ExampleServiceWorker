// Название кеша
const CACHE_NAME = "v1";

// Какие файлы хотим кешировать
const cacheAssets = ["index.html", "script.js"];

/* 
* После регистрации воркера браузер пытается загрузить и разобрать файл сервис-воркера. 
* Если парсинг прошел успешно, запускается событие install. 
* Событие install срабатывает только один раз.
*/
// Событие установки воркера
self.addEventListener('install', (e) => {
  console.log("SW: Устанавлен");

  /* 
  * Метод сообщает браузеру, что установка Service Worker не завершена до тех пор, 
  * пока промис не будет выполнен (resolved).
  *  
  * Такая конструкция гарантирует, что сервис-воркер не будет установлен, пока код, 
  * переданный внутри waitUntil(), не завершится с успехом.
  * 
  * Если промис завершится успешно, Service Worker перейдёт в следующую стадию активации.
  * Если промис завершится с ошибкой, установка Service Worker будет считаться неудачной.
  */
  e.waitUntil(
    // Открывает кеш с указанным именем. Если кеш с таким именем не существует, он создаётся.
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log("SW: Кэширование файлов");
        cache.addAll(cacheAssets);
      })
      .then(() => {
        /* 
        * Этот метод заставляет Service Worker немедленно активироваться, 
        * даже если есть другие активные Service Worker (например, предыдущая версия). 
        * 
        * Без этого метода новый Service Worker будет ждать, пока все вкладки, 
        * использующие старый Service Worker, не будут закрыты.
        */
        self.skipWaiting();
      })
  );
})

// Событие активации воркера
self.addEventListener('activate', (e) => {
  console.log("SW: Активирован")

  // Удаление старых версий кэша, которые больше не нужны (если происходит повторная активация)
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("SW: Очистка старого кэша");
            return caches.delete(cache);
          }
        })
      );
    })
  );
})

// Вызывается когда браузер пытается загрузить ресурс
self.addEventListener('fetch', (e) => {
  console.log("SW: Обработал запрос");

  /* 
  * Метод позволяет SW перехватить запрос и предоставить собственный ответ. 
  * В качестве аргумента он принимает промис, который должен вернуть Response.
  */
  e.respondWith(
    fetch(e.request)
      .then(res => {
        /* 
        * Ответ (res) из сети клонируется, потому что объект Response может быть использован только один раз. 
        * Клонирование позволяет использовать ответ как для возврата браузеру, так и для кеширования.
        */
        const copyCache = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Сохраняет клонированный ответ в кеше для будущих запросов.
          cache.put(e.request, copyCache);
        });
        return res;
      })
      .catch(error => caches.match(e.request).then(res => res)) // Ищет кешированный ответ для текущего запроса.
  );
})

addEventListener("message", (event) => {
  console.log(`SW: Переданные данные в воркер - ${event.data}`);
});
