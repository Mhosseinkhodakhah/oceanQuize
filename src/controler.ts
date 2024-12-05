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


const services = new contentService()

const connection = new interConnection()



export default class contentController {


    async getLessons(req: any, res: any, next: any) {
        const language = req.params.lang;
        let lessons;
        let allLessons = await cacher.getter('getLessons')
        if (!allLessons) {                                       // when cache was not exist . . .
            console.log('cache was empty . . .')
            const data = await services.makeReadyData()
            await cacher.setter('getLessons', data)
            switch (language) {
                case 'english':
                    lessons = data.english
                    break;
                case 'arabic':
                    lessons = data.arabic
                    break;
                case 'persian':
                    lessons = data.persian
                    break;

                default:
                    return next(new response(req, res, 'get lessons', 400, 'please select a language on params', null))
                    break;
            }
        } else {
            console.log('read throw cache . . .')                                      // when cache exist 
            switch (language) {
                case 'english':
                    lessons = allLessons.english
                    break;
                case 'arabic':
                    lessons = allLessons.arabic
                    break;
                case 'persian':
                    lessons = allLessons.persian
                    break;

                default:
                    return next(new response(req, res, 'get lessons', 400, 'please select a language on params', null))
                    break;
            }
        }
        return next(new response(req, res, 'get lessons', 200, null, lessons))
    }



    async getSubLesson(req: any, res: any, next: any) {
        const language = req.params.lang;
        let sublessonContent;
        sublessonContent = await contentModel.findById( req.params.contentId)
        if (!sublessonContent){
            return next(new response(req, res, 'get specific subLesson', 400, 'this content is not exist', null))
        }

        return next(new response(req, res, 'get specific subLesson', 200, null, sublessonContent))
    }




    async getContent(req: any, res: any, next: any) {
        const content = await contentModel.findById(req.params.contentId).populate('subLesson')
        return next(new response(req, res, 'get specific content', 200, null, content))
    }



    async seenContent(req: any, res: any, next: any) {
        const content = await contentModel.findByIdAndUpdate(req.params.contentId, { $addToSet: { seen: req.user.id } })
        await services.checkSeen(content?.subLesson, req.user.id)
        return next(new response(req, res, 'seen content', 200, null, 'content seen by user!'))
    }




    async getLevels(req: any, res: any, next: any) {
        console.log('its hereee')
        let userId = req.user.id;
        let levels;
        let userLevels = await cacher.getter('getLevels')                 // get all levels data from cache
        if (userLevels) {                       // cache is exist
            if (!userLevels[userId]) {           // but this userslevel is not exist
                console.log('cache is not exist . . .')
                const data = await services.readyLevelsData(userId)     // make the levels ready for this user
                userLevels[userId] = data                                      // add new userLevels to cache data
                await cacher.setter('getLevels' , userLevels)                    // cache heat the new data
                levels = data                                                   
            } else {                                // this userLevels are exist on cache
                console.log('cache is ready . . .')
                levels = userLevels[userId]                 
            }
        } else {                                    // if cache was totaly empty
            console.log('cache is empty . .. .')
            const data = await services.readyLevelsData(userId)         // make this userlevels dat a for cache
            userLevels = {}                                         // make structure of cache data
            userLevels[userId] = data                           // add this userLevels to cachData
            await cacher.setter('getLevels' , userLevels)
            levels = data
        }

        return next(new response(req, res, 'get levels', 200, null, levels))
    }




    async openLevel(req: any, res: any, next: any) {
        let userId = req.user.id;
        const level = await levelModel.findOne({ number: req.params.number })
        if (level?.passedUsers.includes(userId)) {
            const questiotns = await questionModel.find({ level: level?._id }).limit(10)
            return next(new response(req, res, 'open level', 200, null, { questions: questiotns }))
        }
        const questiotns = await questionModel.find({ $and: [{ level: level?._id }, { passedUser: { $ne: userId } }] }).limit(10)
        return next(new response(req, res, 'open level', 200, null, { questions: questiotns }))
    }




    //! needs to review
    async answer(req: any, res: any, next: any) {
        const answers = req.body                              // get the body
        console.log('body . . .' , answers)
        let trueAnswers: number = 0;                            // define the true answer variable;
        const firstlyQuestion = await questionModel.findOne({ questionForm:answers[0].questionForm  })   // find the first question by question form
        for (let i = 0; i < answers.length; i++) {                                              // loop on the all answers
            console.log(`${i} answer . . .`)
            let title = answers[i].questionForm;                                            // get title from the answer
            const question = await questionModel.findOne({ questionForm: title })   // find the first question by question form
            if (question?.options[question?.trueOption] == answers[i].answer) {                //  it means the user select the true answer  
                console.log(`${i} answer true . . .`)
                trueAnswers++;                                                      // increase the trueAnswer ++
                await question?.updateOne({ questionForm: title }, { $addToSet : { passedUser: req.user.id } })    // update the specific question 
                await question?.save()
            }
        }
        if (trueAnswers == 10) {            // if the user answer all questions truely
            console.log(`all answers was true . . .`)
            const level = await levelModel.findById(firstlyQuestion?.level)     // update the level and put user to that level
            level?.updateOne({ $addToSet: { passedUsers: req.user.id } })
            console.log('put user to levels passed users')
            const rewarded = await connection.putReward(req.user.id, level?.reward, `passed ${level?.number} level`)           // put reward for user
            if (rewarded.success) {
                console.log('rewarding user successfully done . . .')  
                await level?.updateOne({$addToSet : { rewarded: req.user.id }})              // then update level for rewarded
                console.log('update level ')
            }
            await level?.save()
            const lessonLevels = await lessonModel.findById(level?.lesson).populate('levels').select('levels')           // get all levels on lesson for checking the user finishing all levells
            if (lessonLevels){
                for (let j = 0; j < lessonLevels?.levels.length; j++) {                     // loop on the all lesson levels
                    if (lessonLevels?.levels[j].passedUser.includes(req.user.id)) {                  // if user passed all levels of that lesson
                        await lessonModel.findByIdAndUpdate(level?.lesson, { $push: { paasedQuize: req.user.id } })    // update that lesson and put user to passed quize
                        await connection.resetCache()          // reset the fucking cache
                        return next(new response(req, res, 'answer questions', 200, null, { message: 'congratulation! you passed this level' }))
                    }
                }
            }
        } else {                                                                // if the user didnt pass all 10 question
            await connection.resetCache()              
            return next(new response(req, res, 'answer questions', 200, null, { message: `sorry! you cant pass this level! ${10-trueAnswers} question with wrong answers please review the lesson and try again` }))
        }
    }


    async getAllContent(req: any, res: any, next: any){
        const contents = await contentModel.find()
        return next (new response(req , res , 'get contents' , 200 , null , contents))
    }


}