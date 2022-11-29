const mongoose = require("mongoose")
const employeesSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    designation: String,
    status: String,
    created: String
})
module.exports = mongoose.model("employees",employeesSchema)