import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'test'
  ? MONGO_DB_URI_TEST
  : MONGO_DB_URI

mongoose.connect(connectionString)
  .then(() => {
    console.log('Db connected')
  }).catch(error => {
    console.error(error)
  })

process.on('uncaughtException', (error) => {
  console.error(error)
  mongoose.disconnect()
})
