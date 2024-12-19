"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = __importDefault(require("../middleware/middleware"));
const controller_1 = __importDefault(require("./controller"));
const adminRouter = (0, express_1.Router)();
const adminAuth = new middleware_1.default().adminAuth;
const controller = new controller_1.default();
adminRouter.post('/create-level/:lessonId', adminAuth, controller.creteNewLevel);
adminRouter.delete('/delete-level/:levelId', adminAuth, controller.deleteLevel);
adminRouter.post('/create-questions/:levelId', adminAuth, controller.createQuestion);
adminRouter.patch('/question/update/:questionId', adminAuth, controller.updateQuestion);
adminRouter.delete('/question/delete/:questionId', adminAuth, controller.deleteQuestion);
adminRouter.get('/getAll', controller.getAll);
exports.default = adminRouter;
