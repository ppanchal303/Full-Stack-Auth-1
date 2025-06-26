import jwt from 'jsonwebtoken'
import errorResponse from '../utils/ErrorResponse.js'

export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies)
    let token = req.cookies?.token // this syntax is if cookies contain token then provide token, you can also have req.cookies.token || ""

    console.log('Token Found:', token ? 'Yes' : 'No')

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Authentication failed'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Decoded data:', decoded)

    req.user = decoded

    next()
  } catch (error) {
    console.log('Authentication middleware failure')
    throw new errorResponse('Internal server error', 500)
  }
}
