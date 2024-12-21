import { Router } from "express";
import middleWare from "../middleware/middleware";
import { lessonRole, subLessonRole } from "../validators";
import adminController from "./controller";


const adminRouter = Router()
const adminAuth = new middleWare().adminAuth
const controller = new adminController()

adminRouter.post('/create-level/:lessonId' , adminAuth , controller.creteNewLevel)

adminRouter.patch('/level/update/:levelId' , adminAuth , controller.updateLevel)

adminRouter.delete('/delete-level/:levelId' , adminAuth , controller.deleteLevel)

adminRouter.post('/create-questions/:levelId' , adminAuth ,controller.createQuestion)

adminRouter.patch('/question/update/:questionId' , adminAuth , controller.updateQuestion)

adminRouter.delete('/question/delete/:questionId' , adminAuth , controller.deleteQuestion)

adminRouter.get('/getAll' , controller.getAll)

export default adminRouter;