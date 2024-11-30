import { Router } from "express";
import middleWare from "../middleware/middleware";
import { lessonRole, subLessonRole } from "../validators";
import adminController from "./controller";


const adminRouter = Router()
const adminAuth = new middleWare().adminAuth
const controller = new adminController()

adminRouter.post('/create-level/:lessonId' , adminAuth , controller.creteNewLevel )

adminRouter.delete('/delete-level/:levelId' , adminAuth , controller.deleteLevel)

adminRouter.post('/create-questions/:levelId' , adminAuth ,controller.createQuestion)


export default adminRouter;