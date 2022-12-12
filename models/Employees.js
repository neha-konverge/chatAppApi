const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const employeesSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    designation: String,
    status: Boolean,
    created: String,
    code:String,
    expireIn:Date,
    createdAt:Date
});

employeesSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

module.exports = mongoose.model("employees",employeesSchema)