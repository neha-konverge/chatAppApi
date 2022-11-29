const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const app = express()
const dbUrl = 'mongodb://127.0.0.1:27017/chatApiDb'
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
app.use("/api/sign-up",exployeeRoutes)


app.listen(3000,() => {
    console.log("server up and running on port 3000")
})