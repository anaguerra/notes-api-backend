import mongoose from 'mongoose'
import express from 'express'
import Note from '../models/Note.js'
import User from '../models/User.js'
import jsonwebtoken from 'jsonwebtoken'

const notesRouter = express.Router()

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

notesRouter.get('/:id', (request, response, next) => {
  const { id } = request.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('invalid userId')
  }

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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('invalid userId')
  }

  Note.findByIdAndUpdate(id, updatedNote, { new: true })
    .then(result => {
      response.status(200).json(result)
    })
    .catch(error => next(error))
})

notesRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('invalid userId')
  }

  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

notesRouter.post('/', async (request, response, next) => {
  const authorization = request.get('authorization')
  let token = null
  let decodedToken = null

  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.substring(7)
  }
  if (!token) {
    return response.status(401).json({ error: 'missing token' })
  }

  try {
    decodedToken = jsonwebtoken.verify(token, process.env.API_SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }
  } catch (error) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const {
    content,
    important = false
  } = request.body

  const { id: userId } = decodedToken
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send('invalid userId')
  }
  const user = await User.findById(userId)

  if (!content) {
    return response.status(400).send('note content missing')
  }
  if (!user) {
    return response.status(400).send('userId does not exist')
  }

  const newNote = new Note({
    content,
    date: new Date().toISOString(),
    important,
    user: user._id
  })

  try {
    const savedNote = await newNote.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
})

export default notesRouter
