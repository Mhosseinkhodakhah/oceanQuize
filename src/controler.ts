import { validationResult } from "express-validator";
import contentService from "./services";
import { lessonRole } from "./validators";
import { response } from "./service/responseService";
import lessonModel from "./DB/models/lesson";
import subLessonModel from "./DB/models/subLesson";
import { lessonDB } from "./interfaces";
import contentModel from "./DB/models/content";
import levelModel from "./DB/models/level";
import questionModel from "./DB/models/questions";
import { level } from "winston";
import interConnection from "./interservice/connection";
import internalCache from "./service/cach";
import cacher from "./service/cach";
import messages from "./service/responseMessages";


const services = new contentService()

const connection = new interConnection()



export default class contentController {


    //! needs to review
    async answer(req: any, res: any, next: any) {
        let showLicense = await services.showLicens(req.user.id)
        const answers = req.body.answer                              // get the body
        console.log('body . . .', answers)
        let lang : string = req.query.lang;
        let trueAnswers: number = 0;                            // define the true answer variable;
        const firstlyQuestion = await questionModel.findById(answers[0].questionId)   // find the first question by question form
        for (let i = 0; i < answers.length; i++) {                                              // loop on the all answers
            console.log(`${i} answer . . .`)
            let qId = answers[i].questionId;                                            // get title from the answer
            const question = await questionModel.findById(qId)   // find the first question by question form
            if (question?.trueOption == answers[i].answerIndex) {                //  it means the user select the true answer  
                console.log(`${i} answer true . . .`)
                trueAnswers++;                                                      // increase the trueAnswer ++
                await question?.updateOne({ $addToSet: { passedUser: req.user.id } })    // update the specific question 
                await question?.save()
            }
        }
        if (trueAnswers == answers.length) {            // if the user answer all questions truely
            console.log(`all answers was true . . .`)
            const level = await levelModel.findById(firstlyQuestion?.level)     // update the level and put user to that level
            await level?.updateOne({ $addToSet: { passedUsers: req.user.id } })
            console.log('put user to levels passed users')
            const rewarded = await connection.putReward(req.user.id, level?.reward, `passed ${level?.number} level`)           // put reward for user
            if (rewarded.success) {
                console.log('rewarding user successfully done . . .')
                await level?.updateOne({ $addToSet: { rewarded : req.user.id } })              // then update level for rewarded
                console.log('update level ')
            }
            await level?.save()
            const lessonLevels = await lessonModel.findById(level?.lesson).populate('levels').select('levels')           // get all levels on lesson for checking the user finishing all levells
            if (lessonLevels) {
                let isAllLevels: number = 0;
                for (let j = 0; j < lessonLevels?.levels.length; j++) {                     // loop on the all lesson levels
                    if (lessonLevels?.levels[j]?.passedUsers?.includes(req.user.id)) {                  // if user passed all levels of that lesson
                        console.log('user is in the levele passed user')
                        isAllLevels++;
                    }
                }
                console.log('user is in the levele passed user')
                if (isAllLevels == lessonLevels.levels.length) {
                    await lessonModel.findByIdAndUpdate(level?.lesson, { $push: { paasedQuize: req.user.id } })    // update that lesson and put user to passed quize
                    await connection.resetCache()          // reset the fucking cache
                    let message = (lang && lang!='') ? messages[lang].passedLevelMessage : messages['english'].passedLevelMessage
                    return next(new response(req, res, 'answer questions', 200, null, { showLicense : showLicense ,  message: `${message} ${lessonLevels.number + 1}` }))
                } else {
                    await connection.resetCache()
                    let message = (lang && lang!='') ? messages[lang].passedAllLessonsOfThisLevel : messages['english'].passedAllLessonsOfThisLevel
                    return next(new response(req, res, 'answer questions', 200, null, { showLicense : showLicense , message: message }))
                }
            }
        } else {                                                                // if the user didnt pass all 10 question
            await connection.resetCache()
            let message = (lang && lang!='') ? messages[lang].levelNotPassed : messages['english'].levelNotPassed
            return next(new response(req, res, 'answer questions', 200, null, {showLicense : showLicense ,  message: message }))
        }
    }


    async getAllContent(req: any, res: any, next: any) {
        const contents = await contentModel.find()
        return next(new response(req, res, 'get contents', 200, null, contents))
    }


}