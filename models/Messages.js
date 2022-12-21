const mongoose = require("mongoose");
const messagesSchema = new mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employees"
    },message:{type:String, trim:true},
    chat_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chat"
    }
},{
    timestamps:true
})
module.exports = mongoose.model("messages",messagesSchema)