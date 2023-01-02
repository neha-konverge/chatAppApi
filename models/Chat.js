const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    empName:{type:String, trim:true},
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employees"
    },
    reciever_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employees"
    },
    isGroupChat:{type:Boolean, default:false},
    employees:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employees",
        // value:[],type:String
    }],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"messages"
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employees"
    },
    isInvite:{type:Boolean,default:false},
    inviteStatus:{type:String,default:"pending"}
},{
    timestamps:true
});

module.exports = mongoose.model("chat",chatSchema) 