const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const ngrok = require("ngrok");
const nodemon = require("nodemon");
const app = express();
const db = process.env.DB_CONNECT;
const dbUrl = 3000;
//  'mongodb://localhost:27017/chatApiDb' process.env.PORT || 
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
    addr: "3000",
})
    .then(url => {
        console.log(`ngrok tunnel opened at: ${url}`);
        console.log("Open the ngrok dashboard at: https://localhost:3000\n");

        nodemon({
            script: "./bin/www",
            exec: `NGROK_URL=${url} node`,
        });
    })

//import routes
const exployeeRoutes = require("./routes/employeeRoute")
app.use("/api/logged", exployeeRoutes)
app.use("/api/user", exployeeRoutes)
app.use("/api/user-reset", exployeeRoutes)


app.listen(dbUrl, () => {
    console.log("server up and running on port ", dbUrl);
})