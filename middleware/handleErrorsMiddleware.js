const errorResponse = (error, request, response, next) => {
  console.error(error)

  // se podría hacer con constantes
  // const ERROR_HANDLERS = {
  //   CastError: response => response.status(400).send({ error: 'invalid id type' })
  // }

  if (error.name === 'CastError') {
    response.status(400).send({ error: 'invalid id type' })
  } else {
    response.status(500).end()
  }
}

export default errorResponse
