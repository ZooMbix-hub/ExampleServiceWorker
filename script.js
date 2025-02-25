/* 
* Service worker  —  посредник между клиентом и сервером, пропускающий через себя все запросы к серверу. 
* С его помощью можно перехватывать все запросы “на лету”.
*
* Когда уже ни одна страница не использует предыдущую версию, 
* новый воркер активируется и становится ответственным за обработку запросов.
*
* По умолчанию SW делают перерегистрацию через 24 часа после установки.
*
* https://web.dev/articles/service-worker-lifecycle?hl=ru
*/

// Проверка на то что браузер поддерживает SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('worker.js')
    .then((registration) => {
      console.log('MAIN: SW зарегистрирован:', registration)
      
      // Ручное обновление воркера
      registration.update()
    })
    .catch(error => console.error('MAIN: Ошибка регистрации SW:', error));

  navigator.serviceWorker.ready.then((registration) => {
    console.log('MAIN: SW is ready')

    // Для передачи данных между основным потоком и воркером
    registration.active.postMessage(
      "Test message",
    );
  })
}