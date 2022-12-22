const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const employeesSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    designation: String,
    avtar:{type:String, default:'https://png.pngtree.com/png-clipart/20210915/ourmid/pngtree-user-avatar-login-interface-abstract-blue-icon-png-image_3917504.jpg'},
    status: Boolean,
    created: String,
    createdAt:Date
},{
    timestamps:true
});

employeesSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

module.exports = mongoose.model("employees",employeesSchema)