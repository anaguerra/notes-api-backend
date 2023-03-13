import supertest from 'supertest'
import { app } from '../index.js'

const api = supertest(app)

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
  },
  {
    content: 'Gracias al chat',
    date: new Date(),
    important: false
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes')
  console.log({ response })
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

export { initialNotes, api, getAllContentFromNotes }
