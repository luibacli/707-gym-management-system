/**
 * Serves the production build against the demo database (docs/demo/demo-script.md).
 *
 *   pnpm demo:start     (builds first, then serves on http://localhost:3000)
 *
 * A production build has no dev tools overlay and no first-load compile delays.
 */
import { connect } from 'node:net'

const demoUri = process.env.DEMO_MONGODB_URI
if (!demoUri) {
  console.error('DEMO_MONGODB_URI is not set. See docs/development.md (Demo).')
  process.exit(1)
}

const port = Number(process.env.PORT ?? 3000)

/** True when something already answers on localhost:port (e.g. a running `pnpm dev`). */
function portInUse(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host: 'localhost', port })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
  })
}

// Otherwise the browser could silently reach the other server instead of the demo.
if (await portInUse()) {
  console.error(`Port ${port} is already in use (is \`pnpm dev\` running?). Stop it, or set PORT to another port.`)
  process.exit(1)
}

process.env.NUXT_MONGODB_URI = demoUri
process.env.PORT = String(port)

console.info(`Demo running at http://localhost:${port}`)
await import(new URL('../.output/server/index.mjs', import.meta.url).href)
