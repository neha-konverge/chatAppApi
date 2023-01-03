const mongoose = require('mongoose')
const groupsSchema = new mongoose.Schema({
    group_name : { type:String},
    status : { type:Boolean, default:true}
},{
    timestamps:true
})

module.exports = new mongoose.model('groups',groupsSchema)