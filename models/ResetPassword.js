const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const resetPasswordSchema = new mongoose.Schema({
    employee_id: String,
    createdAt:Date
});

module.exports = mongoose.model("resetPasswordLogs",resetPasswordSchema)