import { Router } from 'express'
import contentController from './controler'
import middleWare from './middleware/middleware'
import { lessonRole, subLessonRole } from './validators'

const controller = new contentController()
const auth = new middleWare().auth

const router = Router()

router.put('/answer-question' , auth , controller.answer)

export default router;