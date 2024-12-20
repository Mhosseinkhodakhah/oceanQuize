"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const responseService_1 = require("./service/responseService");
const lesson_1 = __importDefault(require("./DB/models/lesson"));
const content_1 = __importDefault(require("./DB/models/content"));
const level_1 = __importDefault(require("./DB/models/level"));
const questions_1 = __importDefault(require("./DB/models/questions"));
const connection_1 = __importDefault(require("./interservice/connection"));
const cach_1 = __importDefault(require("./service/cach"));
const services = new services_1.default();
const connection = new connection_1.default();
class contentController {
    getLessons(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const language = req.params.lang;
            let lessons;
            let allLessons = yield cach_1.default.getter('getLessons');
            if (!allLessons) { // when cache was not exist . . .
                console.log('cache was empty . . .');
                const data = yield services.makeReadyData();
                yield cach_1.default.setter('getLessons', data);
                switch (language) {
                    case 'english':
                        lessons = data.english;
                        break;
                    case 'arabic':
                        lessons = data.arabic;
                        break;
                    case 'persian':
                        lessons = data.persian;
                        break;
                    default:
                        return next(new responseService_1.response(req, res, 'get lessons', 400, 'please select a language on params', null));
                        break;
                }
            }
            else {
                console.log('read throw cache . . .'); // when cache exist 
                switch (language) {
                    case 'english':
                        lessons = allLessons.english;
                        break;
                    case 'arabic':
                        lessons = allLessons.arabic;
                        break;
                    case 'persian':
                        lessons = allLessons.persian;
                        break;
                    default:
                        return next(new responseService_1.response(req, res, 'get lessons', 400, 'please select a language on params', null));
                        break;
                }
            }
            return next(new responseService_1.response(req, res, 'get lessons', 200, null, lessons));
        });
    }
    getSubLesson(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const language = req.params.lang;
            let sublessonContent;
            sublessonContent = yield content_1.default.findById(req.params.contentId);
            if (!sublessonContent) {
                return next(new responseService_1.response(req, res, 'get specific subLesson', 400, 'this content is not exist', null));
            }
            return next(new responseService_1.response(req, res, 'get specific subLesson', 200, null, sublessonContent));
        });
    }
    getContent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield content_1.default.findById(req.params.contentId).populate('subLesson');
            return next(new responseService_1.response(req, res, 'get specific content', 200, null, content));
        });
    }
    seenContent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield content_1.default.findByIdAndUpdate(req.params.contentId, { $addToSet: { seen: req.user.id } });
            yield services.checkSeen(content === null || content === void 0 ? void 0 : content.subLesson, req.user.id);
            return next(new responseService_1.response(req, res, 'seen content', 200, null, 'content seen by user!'));
        });
    }
    getLevels(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('its hereee');
            let userId = req.user.id;
            let levels;
            let userLevels = yield cach_1.default.getter('getLevels'); // get all levels data from cache
            if (userLevels) { // cache is exist
                if (!userLevels[userId]) { // but this userslevel is not exist
                    console.log('cache is not exist . . .');
                    const data = yield services.readyLevelsData(userId); // make the levels ready for this user
                    userLevels[userId] = data; // add new userLevels to cache data
                    yield cach_1.default.setter('getLevels', userLevels); // cache heat the new data
                    levels = data;
                }
                else { // this userLevels are exist on cache
                    console.log('cache is ready . . .');
                    levels = userLevels[userId];
                }
            }
            else { // if cache was totaly empty
                console.log('cache is empty . .. .');
                const data = yield services.readyLevelsData(userId); // make this userlevels dat a for cache
                userLevels = {}; // make structure of cache data
                userLevels[userId] = data; // add this userLevels to cachData
                yield cach_1.default.setter('getLevels', userLevels);
                levels = data;
            }
            return next(new responseService_1.response(req, res, 'get levels', 200, null, levels));
        });
    }
    openLevel(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = req.user.id;
            const level = yield level_1.default.findOne({ number: req.params.number });
            if (level === null || level === void 0 ? void 0 : level.passedUsers.includes(userId)) {
                const questiotns = yield questions_1.default.find({ level: level === null || level === void 0 ? void 0 : level._id }).limit(10);
                return next(new responseService_1.response(req, res, 'open level', 200, null, { questions: questiotns }));
            }
            const questiotns = yield questions_1.default.find({ $and: [{ level: level === null || level === void 0 ? void 0 : level._id }, { passedUser: { $ne: userId } }] }).limit(10);
            return next(new responseService_1.response(req, res, 'open level', 200, null, { questions: questiotns }));
        });
    }
    //! needs to review
    answer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const answers = req.body.answer; // get the body
            console.log('body . . .', answers);
            let trueAnswers = 0; // define the true answer variable;
            const firstlyQuestion = yield questions_1.default.findById(answers[0].questionId); // find the first question by question form
            for (let i = 0; i < answers.length; i++) { // loop on the all answers
                console.log(`${i} answer . . .`);
                let qId = answers[i].questionId; // get title from the answer
                const question = yield questions_1.default.findById(qId); // find the first question by question form
                if ((question === null || question === void 0 ? void 0 : question.trueOption) == answers[i].answerIndex) { //  it means the user select the true answer  
                    console.log(`${i} answer true . . .`);
                    trueAnswers++; // increase the trueAnswer ++
                    yield (question === null || question === void 0 ? void 0 : question.updateOne({ $addToSet: { passedUser: req.user.id } })); // update the specific question 
                    yield (question === null || question === void 0 ? void 0 : question.save());
                }
            }
            if (trueAnswers == answers.length) { // if the user answer all questions truely
                console.log(`all answers was true . . .`);
                const level = yield level_1.default.findById(firstlyQuestion === null || firstlyQuestion === void 0 ? void 0 : firstlyQuestion.level); // update the level and put user to that level
                yield (level === null || level === void 0 ? void 0 : level.updateOne({ $addToSet: { passedUsers: req.user.id } }));
                console.log('put user to levels passed users');
                const rewarded = yield connection.putReward(req.user.id, level === null || level === void 0 ? void 0 : level.reward, `passed ${level === null || level === void 0 ? void 0 : level.number} level`); // put reward for user
                if (rewarded.success) {
                    console.log('rewarding user successfully done . . .');
                    yield (level === null || level === void 0 ? void 0 : level.updateOne({ $addToSet: { rewarded: req.user.id } })); // then update level for rewarded
                    console.log('update level ');
                }
                yield (level === null || level === void 0 ? void 0 : level.save());
                const lessonLevels = yield lesson_1.default.findById(level === null || level === void 0 ? void 0 : level.lesson).populate('levels').select('levels'); // get all levels on lesson for checking the user finishing all levells
                if (lessonLevels) {
                    let isAllLevels = 0;
                    for (let j = 0; j < (lessonLevels === null || lessonLevels === void 0 ? void 0 : lessonLevels.levels.length); j++) { // loop on the all lesson levels
                        if ((_b = (_a = lessonLevels === null || lessonLevels === void 0 ? void 0 : lessonLevels.levels[j]) === null || _a === void 0 ? void 0 : _a.passedUsers) === null || _b === void 0 ? void 0 : _b.includes(req.user.id)) { // if user passed all levels of that lesson
                            console.log('user is in the levele passed user');
                            isAllLevels++;
                        }
                    }
                    console.log('user is in the levele passed user');
                    if (isAllLevels == lessonLevels.levels.length) {
                        yield lesson_1.default.findByIdAndUpdate(level === null || level === void 0 ? void 0 : level.lesson, { $push: { paasedQuize: req.user.id } }); // update that lesson and put user to passed quize
                        yield connection.resetCache(); // reset the fucking cache
                        return next(new responseService_1.response(req, res, 'answer questions', 200, null, { showLicense: true, message: `congratulation! you passed this level and now you can start the ${lessonLevels.number + 1}` }));
                    }
                    else {
                        yield connection.resetCache();
                        return next(new responseService_1.response(req, res, 'answer questions', 200, null, { showLicense: true, message: `congratulation! you passed this level and you can start the next level` }));
                    }
                }
            }
            else { // if the user didnt pass all 10 question
                yield connection.resetCache();
                return next(new responseService_1.response(req, res, 'answer questions', 200, null, { showLicense: true, message: `sorry! you cant pass this level! ${answers.length - trueAnswers} question with wrong answers please review the lesson and try again` }));
            }
        });
    }
    getAllContent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const contents = yield content_1.default.find();
            return next(new responseService_1.response(req, res, 'get contents', 200, null, contents));
        });
    }
}
exports.default = contentController;
