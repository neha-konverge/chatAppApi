const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const app = express();
const db = process.env.DB_CONNECT;
const dbUrl =8080;
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

//import routes
const exployeeRoutes = require("./routes/employeeRoute")
app.use("/api/logged",exployeeRoutes)
app.use("/api/user",exployeeRoutes)
app.use("/api/user-reset",exployeeRoutes)


app.listen(dbUrl,() => {
    console.log("server up and running on port ",dbUrl);
})