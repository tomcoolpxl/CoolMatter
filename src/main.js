import { createApp } from './app/createApp.js'

const app = document.querySelector('#app')

if (!app) {
  throw new Error('Expected #app root element')
}

createApp(app)
