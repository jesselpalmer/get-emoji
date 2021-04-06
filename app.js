const express = require('express')
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

app.use(express.json())

app.get('/', async (req, res) => {
  const requestedEmoji = req.body.emojiName
  const emojis = await getEmojis()
  res.json(emojis.data[requestedEmoji])
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))