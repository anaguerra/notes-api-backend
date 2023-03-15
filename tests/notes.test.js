import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { server } from '../index.js'
import Note from '../models/Note.js'
import User from '../models/User.js'
import { initialNotes, api, getAllContentFromNotes } from './helpers.js'

beforeEach(async () => {
  await Note.deleteMany({})
  await User.deleteMany({})

  // save test user
  const passwordHash = await bcrypt.hash('pwsd', 10)
  const testUser = new User({ username: 'anaroot', passwordHash })
  const savedUser = await testUser.save()

  // const testUserAfterSave = await User.find({ username: 'testUser' })

  // save en paralelo, no sabemos cual se guarda primero
  // const notesObject = initialNotes.map(note => new Note(note))
  // const promises = notesObject.map(note => note.save())
  // await Promise.all(promises)

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

/**
 * GET
 */
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

/**
 * POST
 */
describe('POST note', () => {
  test('a valid note can be added', async () => {
    const savedUser = await User.findOne({ username: 'agueve' })
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

  test('note wihtout content can not be added', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

/**
 * DELETE
 */
describe('DELETE note', () => {
  test('a note can be deleted', async () => {
    const { response: firstResponse } = await getAllContentFromNotes()
    const { body: notes } = firstResponse
    const noteToDelete = notes[0]

    await api.delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const { contents, response: secondResponse } = await getAllContentFromNotes()

    expect(secondResponse.body).toHaveLength(initialNotes.length - 1)
    expect(contents).not.toContain(noteToDelete.content)
  })

  test('a note that do not exist can not be deleted', async () => {
    await api.delete('/api/notes/12345')
      .expect(400)

    const { response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
