import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const usersRouter = express.Router()

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes',
    {
      content: 1,
      date: 1,
      _id: 0 // not return _id
    })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { body } = request
  const { username, name, password } = body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({
    username,
    name,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    response.status(400).json(error.message)
  }
})

export default usersRouter
