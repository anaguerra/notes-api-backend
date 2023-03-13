
import express from 'express'
import User from '../models/User.js'

const usersRouter = express.Router()

usersRouter.post('/', async (request, response) => {
  const { body } = request
  const { username, name, password } = body

  const user = new User({
    username,
    name,
    passwordHash: password
  })

  console.log(user)
  const savedUser = await user.save()

  response.json(savedUser)
})

export default usersRouter
