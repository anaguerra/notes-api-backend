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
    const apiResponse = await api.delete('/api/notes/12345')
      .expect(400)

    expect(apiResponse.error.text).toBe('invalid userId')

    const { response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
