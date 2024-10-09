import './assets/main.css'
import './assets/tailwind.css'
import '@fontsource/montserrat'
import '@fontsource/archivo'
import '@fontsource/lexend-mega'
import App from './App.svelte'



const app = new App({
  target: document.body
})


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark')
}

export default app
