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

process.on('uncaughtException', () => {
  mongoose.connection.destroy()
})
