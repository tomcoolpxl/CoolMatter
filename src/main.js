import { config } from './app/config.js'

const app = document.querySelector('#app')

if (!app) {
  throw new Error('Expected #app root element')
}

app.innerHTML = `
  <main>
    <h1>CoolMatter</h1>
    <p>Phase 1 scientific foundation in progress.</p>
    <p>Initial state: ${config.initialStateId}</p>
  </main>
`
