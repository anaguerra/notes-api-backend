import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import express from 'express'
import User from '../models/User.js'

const loginRouter = express.Router()

loginRouter.post('/', async (request, response) => {
  const { body } = request
  const { username, password } = body

  const user = await User.findOne({ username })

  const passwordOk = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordOk)) {
    return response.status(401).json({
      error: 'invalid user or password'
    })
  }

  const userPayload = {
    id: user._id,
    name: user.name,
    username: user.username
  }
  const token = jsonwebtoken.sign(userPayload, process.env.API_SECRET)

  response.send({
    name: user.name,
    username: user.username,
    token
  })
})

export default loginRouter
