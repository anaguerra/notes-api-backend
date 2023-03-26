import express from 'express'
import User from '../models/User.js'
import Note from '../models/Note.js'

const testingRouter = express.Router()

testingRouter.post('/reset', async (request, response) => {
  await Note.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

export default testingRouter
