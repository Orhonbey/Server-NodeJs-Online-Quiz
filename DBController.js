/// Veri tabanın  kontrol edildiği yer Oluyor .
const MongoClient = require('mongodb').MongoClient;

let db;
/// Bağlantı sağlanıyorum
var DbConnect = (Callback) => {
    MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true }, function (onError, client) {

        if (!onError) {
            console.log('Db is Connected');
        }
        db = client.db('Multiplayer-Quiz').collection('Question');

        Callback();
    })
}
///Veritabanından soru listesi çekiliyor .
var GetQuestionListFromDb = (CallbackResultData) => {

    db.find({}).toArray(function (onError, result) {
        if (onError) 
        {
            console.log(onError);
            return;
        }
        console.log('Test Gelen Data ' + result.length);
        CallbackResultData(result);
    });
}
/// verilen Soru listesi Db kayıt ediliyor .
var InserQuestionList = (questionList) => {

    var collection = db;
    collection.insertMany(questionList);
    console.log('Question is Load');
}

module.exports = { DbConnect, InserQuestionList, GetQuestionListFromDb };