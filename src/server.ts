import fastify from 'fastify'

const app = fastify()

app.get('/', async (request, reply) => {
  return { message: 'Hello, World!' }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Server is running at ${address}`)
})
