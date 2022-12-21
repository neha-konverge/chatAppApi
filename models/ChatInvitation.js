const mongoose = require("mongoose");

const chatInvitation = new mongoose.Schema({
    sender_id: String,
    reciever_id: String,
    status: {type:String, default:'pending'},
    status: Boolean,
    createdAt:Date
});

module.exports = mongoose.model("chat_invitation",chatInvitation) 