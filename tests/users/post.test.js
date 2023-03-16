import mongoose from 'mongoose'
import { server } from '../../index.js'
import User from '../../models/User.js'
import { api, getUsers } from '../helpers.js'
import bcrypt from 'bcrypt'

beforeEach(async () => {
  await User.deleteMany({})

  // create always a root user
  const passwordHash = await bcrypt.hash('pwsd', 10)
  const user = new User({ username: 'anaroot', passwordHash })
  await user.save()
})

describe('POST new user', () => {
  test('create new user', async () => {
    const usersAtStart = await getUsers()
    const newUser = {
      username: 'agueve',
      name: 'Ana',
      password: '12345'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersDBAfter = await User.find({})
    const usersAtEnd = usersDBAfter.map(user => user.toJSON())

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('create new user fails if username is already taken', async () => {
    const usersAtStart = await getUsers()
    const newUser = {
      username: 'anaroot',
      name: 'Ana',
      password: '12345'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.text).toMatch(/E11000 duplicate key error collection/)
    expect(result.text).toMatch(/index: username/)

    const usersAtEnd = await getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
