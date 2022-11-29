const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const app = express()
// const dbUrl = 'mongodb://127.0.0.1:27017/chatApiDb'
const dbUrl = 'mongodb://chatApiDb:chatApiDb@ac-dq8turv-shard-00-00.uqzisjl.mongodb.net:27017,ac-dq8turv-shard-00-01.uqzisjl.mongodb.net:27017,ac-dq8turv-shard-00-02.uqzisjl.mongodb.net:27017/konchat?ssl=true&replicaSet=atlas-tp7t9j-shard-0&authSource=admin&retryWrites=true&w=majority'
dotenv.config();
app.use(express.json())
mongoose.connect(
    dbUrl,
    // process.env.DB_CONNECT,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    (res) => console.log(res)
)

//import routes
const exployeeRoutes = require("./routes/employeeRoute")
app.use("/api/sign-in",exployeeRoutes)
app.use("/",exployeeRoutes)


app.listen(3000,() => {
    console.log("server up and running on port 3000")
})