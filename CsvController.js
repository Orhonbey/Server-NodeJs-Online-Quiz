///Csv Controller 
/// Veri tabanına raha bir şekilde soru eklemek için kullanılır.
/// yaptığı işlem google e tablo üzerinden datayı alıp veri tabanına eklemektir .

'use strict';
const request = require('request');
const csv = require("csvtojson");
const model = require('./ModelManager');


/// Google etablolar üzerinden veri tabanına kayıt etmek için 
/// soru metnini ve cevap şıkkını çekiyoruz .
var _GetQuestionFromWeb = function (Callback) {
    var resultData = [];
    csv().fromStream(request.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vRGPlYUv26mf8ya3ZdsZa5xhCMw6otWI1KXeSt0slfF9JWQPDK08hz02aYVrSiZgQLJhK5FRm4jrYHm/pub?gid=0&single=true&output=csv'))
        .subscribe((value) => {
            var question = new model.Question(value.id, value.questionText, null, value.reply);
            resultData.push(question);
        }, (onError) => {
            console.log(onError)
        }, () => {
            if (Callback != null) { Callback(resultData); }
        });
}
/// soru metnin cevapları çekiliyor .
var _GetQuestionReplyFromWeb = function (Callback) {
    var replyList = [];
    csv().fromStream(request.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vTrGUGeN264fByg4D9DlHW0nal3-1EpD6CxiU2H1hHGY-eDEx_BNDnjfVp3R4RhCVdloILtn9_ERNjR/pub?gid=1065826487&single=true&output=csv'))
        .subscribe((value) => {
            var reply = new model.Reply(value.id, value.questionId, value.option, value.optionId);
            replyList.push(reply);
        }, onError => { },
            () => {
                if (Callback != null) {
                    Callback(replyList);
                }
            });
}
/// çekilen Dataların birleştirildiği yer.
var GetQuestionFromWeb = function (Callback) {

    _GetQuestionFromWeb((questionList = []) => {

        _GetQuestionReplyFromWeb((replyList = []) => {

            for (let i = 0; i < questionList.length; i++) {
                var questionId = questionList[i].id;
                var questionReplyList = replyList.filter(x => x.questionId == questionId);
                questionList[i].options = questionReplyList;
            }
            if (Callback != null) {
                Callback(questionList);
            }
        })
    });
}

module.exports = { GetQuestionFromWeb };

// 'use strict';

// module.exports = function (adi, soyadi) {
//   this._adi = adi;
//   this._soyadi = soyadi;
//   this.adiSoyadi = function () {
//     return this._adi + ' ' + this._soyadi;
//   }
// }
