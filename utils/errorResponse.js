class errorResponse extends Error {
  constructor (message, statusCode) {
    super(message)
    this.statusCode = statusCode

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

export default errorResponse
