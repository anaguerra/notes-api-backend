import mongoose from 'mongoose'
import request from 'supertest'
import { app, server } from '../index.js'
import Note from '../models/Note.js'

const api = request(app)

const initialNotes = [
  {
    content: 'Aprendiendo fullstack con midudev',
    date: new Date(),
    important: true
  },
  {
    content: 'Nueva',
    date: new Date(),
    important: false
  }
]

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
  const response = await api.get('/api/notes')
  expect(response.body).toHaveLength(initialNotes.length)
})

test('the first note is about midudev', async () => {
  const response = await api.get('/api/notes')
  expect(response.body[0].content).toBe('Aprendiendo fullstack con midudev')
})

test('the first note is about midudev new', async () => {
  const response = await api.get('/api/notes')
  const contents = response.body.map(note => note.content)
  expect(contents).toContain('Aprendiendo fullstack con midudev')
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
