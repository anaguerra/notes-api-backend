
import express from 'express'
import logger from './loggerMiddleware.js'
import cors from 'cors'
import { PORT } from './config.js'
import Note from './models/Note.js'
import './mongo.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

app.get('/', (req, res) => {
  res.send(process.env.MONGO_DB_U)
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const { id } = request.params

  Note.findById(id).then(foundedNote => {
    if (foundedNote) {
      response.json(foundedNote)
    } else {
      response.status(404).end()
    }
  })
})

// app.delete('/api/notes/:id', (request, response) => {
//   const id = Number(request.params.id)

//   notes = notes.filter(note => note.id !== id)
//   response.status(204).end()
// })

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date().toISOString(),
    important: note.important || false
  })

  newNote.save().then(savedNote => {
    response.status(201).json(savedNote)
  })
})

// app.use((request, response) => {
//   response.status(404).json({
//     error: 'Not found'
//   })
// })

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
