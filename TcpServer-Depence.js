// server.js
const net = require("net"); // import net

// create the server
let server = net.createServer(connection => {
    // run all of this when a client connects
});

server.on('connection', (socket) => {

    socket.on('data', (data) => {

        console.log(data.length);
        var newData = data.slice(4);
      
        console.log(newData.toString());
    })
})

server.listen(5710,  () => {
    console.log("waiting for a connection"); // prints on start
});