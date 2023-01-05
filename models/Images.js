const mongoose = require("mongoose");
const messagesImageSchema = new mongoose.Schema({
    attachment:{type : String, default : 'text'},
},{
    timestamps:true
})
module.exports = mongoose.model("images",messagesImageSchema)