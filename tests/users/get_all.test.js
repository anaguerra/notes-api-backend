import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../../models/User'
import { server } from '../../index'
import { api, getUsers } from '../helpers'

beforeEach(async () => {
  await User.deleteMany({})

  // create always a root user
  const passwordHash = await bcrypt.hash('pwsd', 10)
  const user = new User({ username: 'anaroot', passwordHash })
  await user.save()
})

describe('GET all users', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are 1 user', async () => {
    const usersAtStart = await getUsers()
    const response = await api
      .get('/api/users')

    expect(response.body).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
