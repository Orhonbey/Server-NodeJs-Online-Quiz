/// Soru Classı
module.exports.Question = class Question {
    constructor(id, questionText, options, reply) {
        this.id = id;
        this.questionText = questionText;
        this.options = options;
        this.reply = reply;
    }
}
/// Soru yapısının Clientlara gönderilen versionudur .
module.exports.QuestionClient = class QuestionClient {
    constructor(id, questionText, options) {
        this.id = id;
        this.questionText = questionText;
        this.options = options;
    }
}

/// Veritabanına kayıt için kullanılan Basic Bir yapıdır .
module.exports.Reply = class Reply {
    constructor(id, questionId, option, optionId) {
        this.id = id;
        this.questionId = questionId;
        this.option = option;
        this.optionId = optionId;
    }
}

/// Oyuncuların içersinde Bilgileri blunduğu yarışmanın yapıldığı yapı oluyor 
module.exports.Room = class Room {

    constructor(clientFirst, clientSecond, isActive) {
        /// Oda içerisinde bulunan oyuncular oluyor 
        this.clients = new Map([[clientFirst.id, clientFirst], [clientSecond.id, clientSecond]]);
        this.isActive = isActive;
        this.clientFirstId = clientFirst.id;
        this.clientSecondId = clientSecond.id;
    }

    NextQuestion(questionList, questionCount) {
        if (questionCount <= questionList.length) {
            return questionList[questionCount]
        }
        return undefined;
    }

    CurrentQuestionReply(questionList, questionCount) {
        return questionList[questionCount].reply;
    }

}