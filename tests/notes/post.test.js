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
  const passwordHash = await bcrypt.hash('pwsd', 10)
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
    const newNote = {
      content: 'Proximamente async/await',
      important: true,
      userId: savedUser._id
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentFromNotes()
    expect(contents).toContain(newNote.content)
    expect(response.body).toHaveLength(initialNotes.length + 1)
  })

  test('note without content can not be added', async () => {
    const savedUser = await User.findOne({ username: 'anaroot' })
    const newNote = {
      important: true,
      userId: savedUser._id
    }

    const apiResponse = await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    expect(apiResponse.error.text).toBe('note content missing')

    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('note with unexisting userId can not be added', async () => {
    const newNote = {
      content: 'my content',
      important: true,
      userId: '11119625c89e2bbf8608e911'
    }

    const apiResponse = await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    expect(apiResponse.error.text).toBe('userId does not exist')

    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
