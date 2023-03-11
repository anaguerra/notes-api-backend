
import express from 'express'
import logger from './middleware/loggerMiddleware.js'
import notFound from './middleware/notFoundMiddleware.js'
import errorResponse from './middleware/handleErrorsMiddleware.js'
import cors from 'cors'
import Note from './models/Note.js'
import './mongo.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)
// servir estáticos
// app.use('/images', express.static('images'))

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

  Note.findById(id)
    .then(foundedNote => {
      return foundedNote
        ? response.json(foundedNote)
        : response.status(404).end()
    })
    .catch(error => next(error))
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
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
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
  }).catch(error => next(error))
})

/** Middlewares */
app.use(notFound)
app.use(errorResponse)

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})

export { app, server }
