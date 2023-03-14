import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const usersRouter = express.Router()

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

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

export default usersRouter
