
var model = require('./ModelManager');
var questionController = require('./QuestionController');

/// içerisinde socket Id
var waitingLobby = [];

var roomCount = 0;
var activeRoomList = new Map();


var CheckWaitingLobby = (client, Callback) => {

    if (waitingLobby.length > 0) {
        var selectWaitLobby = waitingLobby[0];
        // clearTimeout(selectWaitLobby.CreateBotRoomTimer);
        waitingLobby.shift();
        CreateRoom(selectWaitLobby.client, client, Callback);
    } else {
        CreateLobby(client);
    }
}

/// lobby Oluşturuyoruz 
var CreateLobby = (client) => {
    console.log(client.id);

    // var CreateBotRoomTimer = setTimeout(() => {
    //     CreateBotRoom(client);

    // }, 5000);
    // var lobby = { client, CreateBotRoomTimer }
    var lobby = { client }
    waitingLobby.push(lobby);
}

var CreateBotRoom = (client) => {
    console.log('botlu oda kuruldu !');
}

var CreateRoom = (clientFirst, clientSecond, Callback) => {
    /// Odaya RAndom Soru Alınması gerek
    var randomQestionList;
    questionController.GetRandomQuestionList(7, (questionList) => {

        randomQestionList = questionList;

        var newRoom = new model.Room(clientFirst, clientSecond, true);

        newRoom.id = roomCount
        clientFirst.roomId = newRoom.id;
        clientSecond.roomId = newRoom.id;
        newRoom.questionList = randomQestionList;
        newRoom.questionCount = 0;
        activeRoomList.set(roomCount, newRoom);
        roomCount++;

        var roomIsCreate = {};
        roomIsCreate.key = 'OnRoomJoin';
        var sendRoomData = {};
        var question = newRoom.questionList[0];
        sendRoomData = GetNewSendRoomData(newRoom.id, question.id, question.questionText, question.options, clientFirst.name, clientSecond.name, 0, 0);
        roomIsCreate.value = JSON.stringify(sendRoomData);
        var jsonData = JSON.stringify(roomIsCreate);
        clientFirst.send(jsonData);
        clientSecond.send(jsonData);
        Callback();
        newRoom.time = Date.now();
        newRoom.FinisTimer = setTimeout(() => {
            QuestionFinish(newRoom.id);
        }, (30000))
    });
}
//hata var bakılacak .
var RoomNextQuestion = (roomId) => {
    var currenctRoom = activeRoomList.get(roomId);
    currenctRoom.questionCount++;
    var nextQuestion = currenctRoom.NextQuestion(currenctRoom.questionList, currenctRoom.questionCount);
    var clientFirst = currenctRoom.clients.get(currenctRoom.clientFirstId);
    var clientSecond = currenctRoom.clients.get(currenctRoom.clientSecondId);
    if (nextQuestion != undefined) {
        var sendRoomData = {};
        sendRoomData = GetNewSendRoomData(currenctRoom.id, nextQuestion.id, nextQuestion.questionText, nextQuestion.options
            , clientFirst.name, clientSecond.name, clientFirst.score, clientSecond.score);
        var sendData = {};
        sendData.key = "OnNextQuestion";
        sendData.value = JSON.stringify(sendRoomData);
        var send = JSON.stringify(sendData);
        currenctRoom.clients.forEach(client => {
            client.send(send);
        });
        currenctRoom.time = Date.now();
        currenctRoom.FinisTimer = setTimeout(() => {
            QuestionFinish(currenctRoom.id)
        }, (30000))
    }
    else/// 7 soru bitmiş oluyor ve finisş ekranına gidilir .
    {
        /// burda 
        var finishData = {};
        finishData.clientFirstName = clientFirst.name;
        finishData.clientFirstScore = clientFirst.score;
        finishData.clientSecoundName = clientSecond.name;
        finishData.clientSecoundScore = clientSecond.score;

        var data = {};
        data.key = 'OnFinish';
        data.value = JSON.stringify(finishData);
        var sendData = JSON.stringify(data);
        currenctRoom.clients.forEach(client => {
            client.send(sendData);
        });

    }
}
//Burada oyuncuların Puanları ve doğru şık yollanıyor.
var QuestionFinish = (roomId) => {
    ///ilk olarak odayı buluyoruz 
    var currenctRoom = activeRoomList.get(roomId);
    var clientFirst = currenctRoom.clients.get(currenctRoom.clientFirstId);
    var clientSecond = currenctRoom.clients.get(currenctRoom.clientSecondId);

    var sendData = {};
    sendData.key = "OnQuestionFinish";
    questionFinishData = {};
    questionFinishData.reply = currenctRoom.CurrentQuestionReply(currenctRoom.questionList, currenctRoom.questionCount);
    questionFinishData.clientFirstName = clientFirst.name;
    questionFinishData.clientFirstScore = clientFirst.score;
    questionFinishData.clientSecondScore = clientSecond.score;

    sendData.value = JSON.stringify(questionFinishData);
    var data = JSON.stringify(sendData);
    currenctRoom.clients.forEach(client => {
        client.send(data);
    });

    currenctRoom.roomNextQuestion = setTimeout(() => {
        RoomNextQuestion(roomId);
    }, 5000);
}
/// Clientlara Gönderilecek Olan Oda Datası Oluşturuyoruz .
var GetNewSendRoomData = (roomId, questionId, QuestionText, questionOptions, clientFirstName, clientSecondName, clientFirstScore, clientSecondScore) => {
    var sendRoomData = {};
    sendRoomData.id = roomId;
    sendRoomData.questionClient = new model.QuestionClient(questionId, QuestionText, questionOptions);
    sendRoomData.clientFirstName = clientFirstName;
    sendRoomData.clientSecondName = clientSecondName;
    sendRoomData.isFirstReply = false;
    sendRoomData.clientFirstScore = clientFirstScore;
    sendRoomData.clientSecondScore = clientSecondScore;
    return sendRoomData;
}
var GetRoom = (roomId) => {
    return activeRoomList.get(roomId);
}

var ClearLobby = (client) => {
    if (waitingLobby.length > 0) {
        var index = waitingLobby.indexOf(client);
        waitingLobby.splice(index, 1);
    }
    console.log(waitingLobby.length);
}
var ClearRoom = (roomId) => {
    activeRoomList.delete(roomId);
}

module.exports = {
    CheckWaitingLobby, GetRoom, QuestionFinish, ClearLobby, ClearRoom
}


