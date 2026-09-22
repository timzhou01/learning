import express from 'express'

const app = express()

app.use(express.json())

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.listen(3000, () => {
    console.log('Commerce API running at http://localhost:3000')
})