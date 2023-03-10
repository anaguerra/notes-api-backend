const errorResponse = (error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    response.status(400).send({ error: 'invalid id type' })
  } else {
    response.status(500).end()
  }
}

export default errorResponse
