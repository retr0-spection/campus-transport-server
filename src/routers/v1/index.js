import express from 'express'
import AuthRouter from './auth/auth.js'

const router = express.Router()


router.use('/auth', AuthRouter)


export default router