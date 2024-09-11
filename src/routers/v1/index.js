import express from 'express'
import AuthRouter from './auth/auth.js'

const router = express.Router()


router.use('/', AuthRouter)


export default router