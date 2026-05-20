import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text("This is yusukebe's skills")
})

export default app
