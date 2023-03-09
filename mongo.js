import mongoose from 'mongoose'
// import Note from './models/Note.js'

const connectionString = 'mongodb+srv://root:root@cluster0.odhydrp.mongodb.net/testdb?retryWrites=true&w=majority'

mongoose.connect(connectionString)
  .then(() => {
    console.log('cnnnection')
    console.log('Db connected')
  }).catch(error => {
    console.error(error)
  })

// Note.find({}).then(result => {
//   console.log(result)
//   mongoose.connection.close()
// })

// const note = new Note({
//   content: 'MongoDB es increíble, midu',
//   date: new Date(),
//   important: true
// })

// note.save()
//   .then((result) => {
//     console.log(result)
//     mongoose.connection.close()
//   }).catch(error => {
//     console.error(error)
//   })
