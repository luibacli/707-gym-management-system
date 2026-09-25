import mongoose from 'mongoose'

export default defineNitroPlugin(() => {
  const { mongodbUri } = useRuntimeConfig()

  if (!mongodbUri) {
    throw new Error('NUXT_MONGODB_URI is not set. See docs/development.md.')
  }

  mongoose
    .connect(mongodbUri)
    .then(() => console.info('[mongoose] connected'))
    .catch((error: unknown) => {
      console.error('[mongoose] connection failed', error)
    })
})
