const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    emp_name:{type:String, trim:true},
    isGroupChat:{type:Boolean, default:false},
    employees:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employees"
    },
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Messsages"
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employees"
    },
    is_invite:{type:Boolean,default:false}
},{
    timestamps:true
});

module.exports = mongoose.model("chat",chatSchema) 