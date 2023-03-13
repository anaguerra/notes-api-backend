
import express from 'express'
import Note from '../models/Note.js'

const notesRouter = express.Router()

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

notesRouter.get('/:id', (request, response, next) => {
  const { id } = request.params

  Note.findById(id)
    .then(foundedNote => {
      return foundedNote
        ? response.json(foundedNote)
        : response.status(404).end()
    })
    .catch(error => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
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

notesRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

notesRouter.post('/', async (request, response, next) => {
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
  try {
    const savedNote = await newNote.save()
    response.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
})

export default notesRouter
