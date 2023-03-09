import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.MONGO_DB_URI

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
