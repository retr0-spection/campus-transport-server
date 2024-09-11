import { register, login, logout, me, refresh } from '../../../controllers/auth/authController.js';
import express from 'express'

const router = express.Router()


router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', me)
router.post('/refresh', refresh)


export default router