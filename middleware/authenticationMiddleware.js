import mongoose from 'mongoose'
import jsonwebtoken from 'jsonwebtoken'

const authentication = (request, response, next) => {
  const authorization = request.get('authorization')
  let token = null
  let decodedToken = null

  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.substring(7)
  }
  if (!token) {
    return response.status(401).json({ error: 'missing token' })
  }

  try {
    decodedToken = jsonwebtoken.verify(token, process.env.API_SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }
  } catch (error) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const { id: userId } = decodedToken
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send('invalid user id in token')
  }

  /*
    en express se puede guardar información
    en la request una vez que pasa por un middleware
  */
  request.userId = userId

  next()
}

export default authentication
