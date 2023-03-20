import bcrypt from 'bcrypt'
import User from '../../models/User.js'
import { api } from '../helpers.js'
import mongoose from 'mongoose'
import { server } from '../../index.js'

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('root', 10)
  const rootUser = new User({ username: 'root', passwordHash })
  await rootUser.save()
})

describe('POST login', () => {
  test('login a valid user returns token information', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'root' })

    expect(loginResponse.body.token).toBeDefined()
    expect(loginResponse.body.username).toBeDefined()
  })

  test('login with a not existing user returns error', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'not_existing_user', password: 'root' })

    expect(loginResponse.body.error).toBe('invalid user or password')
  })

  test('login existing user with a wrong password returns error', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'bad_password' })

    expect(loginResponse.body.error).toBe('invalid user or password')
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
