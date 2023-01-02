const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const tempEmployeesSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    status: Boolean,
    createdAt:Date
},{
    timestamps:true
});

module.exports = mongoose.model("temp_employees",tempEmployeesSchema) 