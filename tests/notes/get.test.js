import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import Note from '../../models/Note'
import User from '../../models/User'
import { server } from '../../index'
import { initialNotes, api, getAllContentFromNotes } from '../helpers'

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

  // save en paralelo, no sabemos cual se guarda primero
  // const notesObject = initialNotes.map(note => new Note(note))
  // const promises = notesObject.map(note => note.save())
  // await Promise.all(promises)
})

describe('GET all notes', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are 2 notes', async () => {
    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('the first note is about midudev', async () => {
    const { contents } = await getAllContentFromNotes()
    expect(contents).toContain('Aprendiendo fullstack con midudev')
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
