import supertest from 'supertest'
import { app } from '../index.js'
import User from '../models/User.js'

const api = supertest(app)

const initialNotes = [
  {
    content: 'Aprendiendo fullstack con midudev',
    date: new Date(),
    important: true
  },
  {
    content: 'Este curso mola',
    date: new Date(),
    important: false
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

const getUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

export {
  api,
  initialNotes,
  getAllContentFromNotes,
  getUsers
}
