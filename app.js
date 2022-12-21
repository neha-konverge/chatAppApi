const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const ngrok = require("ngrok");
const nodemon = require("nodemon");
const app = express();
const db = process.env.DB_CONNECT;
const port = 8000;
//  'mongodb://localhost:27017/chatApiDb' process.env.PORT || 

const { Server } = require("socket.io");
const io = new Server(db);


app.get('/getchat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
  });
  
  io.on('connection', (socket) => {
    socket.on('chat message', msg => {
      io.emit('chat message', msg);
    });
  });

dotenv.config();
app.use(express.json())
mongoose.connect(
    process.env.DB_CONNECT,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    (res) => console.log(res)
)

ngrok.connect({
    proto: "http",
    addr: port,
})
    .then(url => {
        console.log(`ngrok tunnel opened at: ${url}`);
        console.log("Open the ngrok dashboard at: https://localhost:"+port+"\n");

        nodemon({
            script: "./bin/www",
            exec: `NGROK_URL=${url} node`,
        });
    })

//import routes
const employeeRoutes = require("./routes/employeeRoute")
const chatRoutes = require("./routes/chatRoute")

app.use("/api/user", employeeRoutes)
app.use("/api/chat", chatRoutes)

app.listen(8000, () => {
    console.log("server up and running on port ", 8000);
})