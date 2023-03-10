
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

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findById(id).then(foundedNote => {
    if (foundedNote) {
      response.json(foundedNote)
    } else {
      response.status(404).end()
    }
  }).catch(error => {
    next(error)
  })
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body
  const updatedNote = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, updatedNote, { new: true })
    .then(result => {
      response.status(200).json(result)
    })
})

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findByIdAndRemove(id).then(result => {
    response.status(204).end()
  }).catch(error => {
    next(error)
  })
})

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

/** Middlewares */
app.use((request, response, next) => {
  response.status(404).end()
})

app.use((error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    response.status(400).send({ error: 'invalid id type' })
  } else {
    response.status(500).end()
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
