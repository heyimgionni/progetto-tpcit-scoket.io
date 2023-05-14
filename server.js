const http = require("http");
const fs = require("fs");
const socketIO = require("socket.io");

const server = http.createServer(function (req, res) {
  fs.readFile("index.html", function (err, data) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
});

const io = socketIO(server);

let clients = [];

io.on("connection", function (socket) {
  console.log("Un client si è connesso");

  clients.push(socket.id);
  io.emit("clients", clients);

  socket.on("chat message", function (message) {
    io.emit("chat message", message); // Invia il messaggio a tutti i client connessi
  });

  socket.on("private chat message", function (data) {
    const { clientId, message } = data;
    socket.to(clientId).emit("private chat message", {
      from: socket.id,
      message: message,
    });
  });

  socket.on("disconnect", function () {
    console.log("Un client si è disconnesso");
    clients = clients.filter((client) => client !== socket.id);
    io.emit("clients", clients);
  });
});

const port = 3000; // Puoi scegliere qualsiasi porta disponibile sul tuo computer

server.listen(port, function () {
  console.log("Il server è in ascolto sulla porta " + port);
});
