const ws = require('ws');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
var events = require('events');
var event = new events.EventEmitter();

const port = 5710;
// const event = require('./EventController');
const csv = require('./CsvController');
const db = require('./DBController');
const question = require('./QuestionController');
const roomController = require('./RoomController');

var connectionCounter = 0;

var socketList = new Map();

console.log('Veri tabanına Soruları kayıt etmek için "QuestionSaveDB" yazınız  ');

/// Belli başlı dinlemeleri yaptığımız yer.
readline.on('line', (inputValue) => {
    if (inputValue == 'QuestionSaveDB') {
        console.log('Datalar E-Tablodan çekiliyor.');
        csv.GetQuestionFromWeb((QuestionList) => {
            db.InserQuestionList(QuestionList);
        })
    }
})
/// Web Socekt Ser ver Başlatılıyor 
const webSocket = new ws.Server({ port }, () => {
    console.log('server is Ready')
    /// Veritabanı bağlantısı sağlanıyor .
    db.DbConnect(() => {
        db.GetQuestionListFromDb((CallbackData) => {
            question.SetQuestionList(CallbackData);
        });
    });
});
/// Gelen Bağlantı !
webSocket.on('connection', function connection(socket, request) {
    socket.id = connectionCounter;
    connectionCounter++;
    socketList.set(socket.id, socket);
    console.log('Yeni Kullanıcı Geldi ! Toplam Kullanıcı :' + socketList.size);

    socket.on('message', function (data) {

        var comingData = JSON.parse(data);
        Emit(comingData.key, comingData.value, socket.id);
    });
    ///Oyuncu Çıkış yapıyor 
    socket.onclose = function () {
        if (socketList.has(socket.id)) {

            roomController.ClearLobby(socket);
            event.emit('ClientExit',socket.roomId);
            socketList.delete(socket.id);
        }

        console.log(socket.id + 'idli oyuncu Çıkış Yaptı ');
    }
})
///
webSocket.on('listening', () => {
    console.log('Listening on ' + port);
});

/// Server İşlemleri
var Emit = (key, data, socketId, Callback) => {
    event.emit(key, data, socketId, Callback);
}

/// Oyuncu burada Maç Arama Oda kurma işlemini yapıyoruz .
var OnFindMatch = (data, socketId, Callback) => {
    var client = socketList.get(socketId);
    ///Oyuncunun adını atıyoruz .
    client.name = data;
    roomController.CheckWaitingLobby(client, () => {
        //
        console.log('Oda Kuruldu !');
    })
}
event.on('OnFindMatch', OnFindMatch);

/// oyuncudan gelen Soruya Cevap
var OnQuestionReply = (data, socketId, Callback) => {
    // Cevap Geldi burada hangi odada olduğumuzu  bulup o oda üzerinde  işlem yapıcağız
    ///Burada data yolluyor bu da içerisinde cevap var ve oda Id si mevcut 
    var clientReply = JSON.parse(data);
    var room = roomController.GetRoom(clientReply.roomId);
    /// 30 saniye Dolmuş oluyor 
    if (!TimeControl(room.time)) {
        return;
    }
    var currenctClient = room.clients.get(socketId);

    var correctReply = room.CurrentQuestionReply(room.questionList, room.questionCount);
    ///Cevap veren client Puan almayı hak etmişmi bakıyoruz 
    if (correctReply == clientReply.optionId) {
        if (currenctClient.score == undefined) {
            currenctClient.score = 0;
        }
        currenctClient.score += PointCalculater(room.time);
    }

    room.clients.forEach(element => {
        if (element.id != socketId) {
            var sendData = {};
            sendData.key = 'OnRoomEnemyReply';
            sendData.value = data;
            console.log(data);
            var send = JSON.stringify(sendData);
            element.send(send);
        }
    });
    /// iki oyuncuda cevap vermiş demek oluyor ve 
    if (!clientReply.firstReply) {
        /// Bizden Önce 
        /// Finish Yapılacak ve doğru şık yollanacak .
        clearInterval(room.FinisTimer);
        roomController.QuestionFinish(room.id);
    }
}

var PointCalculater = (startTime) => {
    var mil = Date.now() - startTime;
    var secound = Math.floor(mil / 1000);
    var point = 30 - secound;
    return point;
}

var TimeControl = (startTime) => {
    var mil = Date.now() - startTime;
    var secound = Math.floor(mil / 1000);
    var result = (secound <= 30);
    return result;
}
event.on('OnQuestionReply', OnQuestionReply);

var ClientExit = (data, socketId) => {

    var roomId = parseInt(data);
    var currenctRoom = roomController.GetRoom(roomId);
    if (currenctRoom != undefined) {
        clearTimeout(currenctRoom.roomNextQuestion);
        clearTimeout(currenctRoom.FinisTimer);

        var clientFirst = currenctRoom.clients.get(currenctRoom.clientFirstId);
        var clientSecond = currenctRoom.clients.get(currenctRoom.clientSecondId);

        var finishData = {};
        finishData.clientFirstName = clientFirst.name;
        finishData.clientFirstScore = clientFirst.score;
        finishData.clientSecoundName = clientSecond.name;
        finishData.clientSecoundScore = clientSecond.score;

        var data = {};
        data.key = 'OnFinish';
        data.value = JSON.stringify(finishData);
        var sendData = JSON.stringify(data);
        var sendNotification = {};
        sendNotification.key = 'OnEnemyExit';
        var sData = JSON.stringify(sendNotification);
        currenctRoom.clients.forEach(client => {
            if (client.id != socketId) {
                client.send(sendData);
                client.send(sData);
            }
        });


        roomController.ClearRoom(roomId);

    }
}


event.on('ClientExit', ClientExit);



