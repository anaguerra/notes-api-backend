import mongoose from 'mongoose'
import { server } from '../index.js'
import Note from '../models/Note.js'
import { initialNotes, api, getAllContentFromNotes } from './helpers.js'

beforeEach(async () => {
  await Note.deleteMany({})

  const note1 = new Note(initialNotes[0])
  await note1.save()

  const note2 = new Note(initialNotes[1])
  await note2.save()
})

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

test('a valid note can be added', async () => {
  const newNote = {
    content: 'Proximamente async/await',
    important: true
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

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
