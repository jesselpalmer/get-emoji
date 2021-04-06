const express = require('express')
const redis = require("redis")
const axios = require('axios')

const getEmojis = async () => {
  try {
    return await axios.get('https://us-central1-emojis-service.cloudfunctions.net/emojis')
  } catch (err) {
    console.error(err)
  }
}

const app = express()
const port = process.env.PORT || 3000
const client = redis.createClient(process.env.REDIS_URL)

client.on('error', error => {
  console.error(error)
})

app.use(express.json())

const processRequest = (emojiName, res) => {
  client.get(emojiName, async (err, emoji) => {
    if (err) throw err

    if (emoji) {
      console.log('cache hit')
      res.send(emoji)
    } else {
      console.log('cache miss')
      const emojis = await getEmojis()
      const emoji = emojis.data[emojiName]

      client.set(emojiName, emoji, err => {
        if (err) throw err
        res.send(emoji)       
      })
    }
  })
}

app.get('/', (req, res) => {
  const emojiName = req.body.emojiName
  if (!emojiName) res.send(null)

  processRequest(emojiName, res)
})

app.get('/:emojiName', (req, res) => {
  const emojiName = req.params.emojiName
  if (!emojiName) res.send(null)

  processRequest(emojiName, res)
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
