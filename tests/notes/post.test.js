import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import Note from '../../models/Note.js'
import User from '../../models/User.js'
import { server } from '../../index.js'
import { initialNotes, api, getAllContentFromNotes } from '../helpers.js'

beforeEach(async () => {
  await Note.deleteMany({})
  await User.deleteMany({})

  // save test user
  const passwordHash = await bcrypt.hash('password', 10)
  const rootUser = new User({ username: 'anaroot', passwordHash })
  const savedUser = await rootUser.save()

  // save en secuencial
  for (const note of initialNotes) {
    const noteObject = new Note({
      content: note.content,
      date: new Date().toISOString(),
      important: true,
      user: savedUser._id
    })
    await noteObject.save()
  }
})

describe('POST note', () => {
  test('a valid note can be added', async () => {
    const savedUser = await User.findOne({ username: 'anaroot' })
    const loginResponse = await api.post('/api/login').send({ username: 'anaroot', password: 'password' })
    const token = loginResponse.body.token

    const newNote = {
      content: 'Proximamente async/await',
      important: true,
      userId: savedUser._id
    }

    await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentFromNotes()
    expect(contents).toContain(newNote.content)
    expect(response.body).toHaveLength(initialNotes.length + 1)
  })

  test('note without content can not be added', async () => {
    const savedUser = await User.findOne({ username: 'anaroot' })
    const loginResponse = await api.post('/api/login').send({ username: 'anaroot', password: 'password' })
    const token = loginResponse.body.token

    const newNote = {
      important: true,
      userId: savedUser._id
    }

    const apiResponse = await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(400)

    expect(apiResponse.error.text).toBe('note content missing')

    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
