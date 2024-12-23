

interface messeageInterface {
    arabic: {}
    english: {}
    persian: {}
}


let messages: any = {
    arabic: {
        tokenError: "انتهت صلاحية الرمز",
        emailError: "البريد الإلكتروني غير موجود!",
        codeError: "رمز خاطئ!",
        unknownError: "حدث خطأ ما . . .",
        userNotFound : 'this user is not exist on database',
        passedLevelMessage : 'congratulation! you passed this level and now you can start the',
        passedAllLessonsOfThisLevel : 'congratulation! you passed this level and you can start the next level',
        levelNotPassed : 'sorry! you cant pass this level!  question with wrong answers please review the lesson and try again'
    },
    english: {
        tokenError: "Token expired",
        emailError: "Email not found!",
        codeError: "Wrong code!",
        unknownError: "Something went wrong . . .",
        userNotFound : 'this user is not exist on database',
        passedLevelMessage : 'congratulation! you passed this level and now you can start the',
        passedAllLessonsOfThisLevel : 'congratulation! you passed this level and you can start the next level',
        levelNotPassed : 'sorry! you cant pass this level!  question with wrong answers please review the lesson and try again'



    },
    persian: {
        tokenError: "توکن منقضی شده است",
        emailError: "ایمیل یافت نشد!",
        codeError: "کد نادرست است!",
        unknownError: "یک خطا رخ داده است . . .",
        userNotFound : 'this user is not exist on database',
        passedLevelMessage : 'congratulation! you passed this level and now you can start the',
        passedAllLessonsOfThisLevel : 'congratulation! you passed this level and you can start the next level',
        levelNotPassed : 'sorry! you cant pass this level!  question with wrong answers please review the lesson and try again'


    }
}


export default messages;