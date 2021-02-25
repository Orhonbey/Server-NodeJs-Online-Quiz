/// Question controller 
/// Server açıldığında Veritabanından soruları Rame çeker ve daha sonradan random bir şekilde 
/// soruların dağıtılması işlemini yapar.
const model = require('./ModelManager');
const random = require('js-random-urn-draw');

var questionList = [];

var SetQuestionList = (setData) => {

    questionList = setData;
}

var GetRandomQuestionList = (resultCount,Callback) => {
    if (questionList.length >= resultCount) {

        const randomSelection = new random(questionList);
        var resultData = randomSelection.draw(7);
        console.log('Data  question List:' + resultData);
        Callback(resultData);
    }
}

module.exports = { SetQuestionList,GetRandomQuestionList }
