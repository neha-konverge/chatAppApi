const ChatModel = require('../models/Chat')
const MessageModel = require('../models/Messages')
const EmployeesModel = require('../models/Employees');
const Chat = require('../models/Chat');

const allEmployees = async (req, res) => {
    let user_details = [];
    try {
        const userData = await EmployeesModel.find({'email': {$ne: req.body.email }, status: true});        
        res.send({status:1,users:userData,message:"Returned employees list"});
    } catch (error) {
        res.json({ messege: error.toString()})
    }
}

//required parameters : sender_id,receiver_id
const checkAlreadyInvited = async(req,res) => {
    try{
        if(req.body.sender_id && req.body.reciever_id){
            const check = await ChatModel.findOne({
                $or:[{sender_id:req.body.sender_id,reciever_id:req.body.reciever_id}
                    ,{sender_id:req.body.reciever_id,reciever_id:req.body.sender_id}
                ]
                ,$and:[{is_invite:true}]})
            if(check && check.inviteStatus === 'accepted'){
                res.json({status:1,invitedData:check,message:"Invitation accepted",chat_id:check._id})
            }else if(check && check.inviteStatus === 'pending'){
                res.json({status:3,invitedData:check,message:"Already invited",chat_id:check._id})
            }else{
                res.json({status:2,message:"Send an invite"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const sendAnInvite = async(req,res) => {
    try{
        const {sender_id,reciever_id,message} = req.body
        if(sender_id && reciever_id){
            const check = await ChatModel.findOne({
                $or:[{sender_id:req.body.sender_id,reciever_id:req.body.reciever_id}
                    ,{sender_id:req.body.reciever_id,reciever_id:req.body.sender_id}
                ]
                ,$and:[{is_invite:true}]})
            if(check === null || !check.length === 0){
                const newChat = {
                    emp_name:"sender",
                    sender_id:sender_id,
                    reciever_id:reciever_id,
                    isGroupChat:false,
                    employees:[reciever_id],
                    isInvite:true,
                }
                try{
                    const chatCreated = await ChatModel.create(newChat)
                    
                    let newMsg = {
                        reciever_id:reciever_id,
                        sender_id:sender_id,
                        message:message ,
                        chat_id:chatCreated._id
                    }
                    newMsg = await MessageModel.create(newMsg)
                    await ChatModel.findByIdAndUpdate(chatCreated._id,{
                        latestMessage:newMsg._id
                    })
                    res.send({status:1,response:newMsg,message:"Invitation sent"})
                }catch(error){
                    res.send({ message: error.toString()})
                }
            }else{
                res.send({status:0,message:"Cross invitation already done"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const respondOnInvitation = async(req,res) => {
    try{
        const {sender_id,chat_id,status} = req.body
        if(sender_id && chat_id && status){
            const chatExist = await ChatModel.findOne({_id:chat_id},{"_id":1})
            const chatStatus = await ChatModel.findOne({'_id':chat_id,'inviteStatus':{$ne:'pending'}},{"_id":1})
            if(chatExist){
                if(!chatStatus){
                    if(status==='accepted'){
                        let newMsg = {
                            sender_id:sender_id,
                            message:"Hi" ,
                            chat_id:chat_id
                        }
                        newMsg = await MessageModel.create(newMsg)
                        
                        await ChatModel.findByIdAndUpdate(chat_id,{
                            latestMessage:newMsg._id,inviteStatus:"accepted"
                        })

                        // const msgList = 
                        res.send({status:1,message:"Invitation accepted by user"})
                    }else{
                        await ChatModel.findOneAndDelete({_id:chat_id})
                        res.send({status:0,message:"Invitation declined by user"})
                    }
                }else{
                    res.send({status:0,message:"Already responded on invitation"})
                }
            }else{
                res.send({status:0,message:"Invitation does not exist"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const accessChatUsers = async(req,res) => {
    try{
        const {sender_id,reciever_id} = req.body
        if(sender_id){
            
            let chatExist = await ChatModel.find({
                isGroupChat:false,
                $or:[{sender_id:sender_id},{reciever_id:sender_id}]
            },{employees:0}).populate("sender_id",'-password,-__v').populate("reciever_id",'-password,-__v').populate("latestMessage",'message updatedAt').sort({ updatedAt : -1 })
            let chatUsers = []
            const userObj ={}
            chatExist.map((row,i) => {
                let userObj = {}
                if(sender_id === row.reciever_id._id.toString()){
                    userObj = {
                        sender_id:row.sender_id._id.toString(),
                        reciever_id:row.reciever_id._id.toString(),
                        user_id:row.sender_id._id,
                        name:row.sender_id.name,
                        email:row.sender_id.email,
                        avtar:row.sender_id.avtar,
                        isGroupChat:row.isGroupChat,
                        latestMessage:row.latestMessage,
                        isInvite:row.isInvite,
                        inviteStatus:row.inviteStatus,
                        updatedAt:row.updatedAt,
                    }
                }else{
                    userObj = {
                        sender_id:row.sender_id._id.toString(),
                        reciever_id:row.reciever_id._id.toString(),
                        user_id:row.reciever_id._id,
                        name:row.reciever_id.name,
                        email:row.reciever_id.email,
                        avtar:row.reciever_id.avtar,
                        isGroupChat:row.isGroupChat,
                        latestMessage:row.latestMessage,
                        isInvite:row.isInvite,
                        inviteStatus:row.inviteStatus,
                        updatedAt:row.updatedAt,
                    }
                }
                chatUsers.push(userObj)
            })

            if(chatExist.length>0){
                res.send({status:1,chatUsers:chatUsers,message:"Chat messages list returned"})
            }else{
                res.send({status:1,chatUsers:[],message:"No chat messages found"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const accessChatMessages = async(req,res) => {
    try{
        const {sender_id,reciever_id,chat_id} = req.body
        if(sender_id && reciever_id && chat_id){
            let chatMessages = await MessageModel.find({
                chat_id:chat_id,
            })
            
            if(chatMessages.length>0){
                res.send({status:1,chatMessages:chatMessages,message:"Chat messages list returned"})
            }else{
                res.send({status:1,chatMessages:[],message:"No chat messages found"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const createGroup = async(req,res) => {
    try{
        const {group_name,admin_id,members} = req.body
        if(group_name && admin_id && members){
            try{
                let newMsg = {
                    reciever_id:reciever_id,
                    sender_id:sender_id,
                    message:message ,
                    chat_id:chat_id
                }
                newMsg = await MessageModel.create(newMsg)
                await ChatModel.findByIdAndUpdate(chat_id,{
                    latestMessage:newMsg._id
                })
                res.send({status:1,messageSent:newMsg,message:"Message sent"})
            }catch(error){
                res.send({ message: error.toString()})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const sendMessage = async(req,res) => {
    try{
        const {reciever_id,sender_id,chat_id,message} = req.body
        if(sender_id && reciever_id && chat_id && message){
            try{
                let newMsg = {
                    reciever_id:reciever_id,
                    sender_id:sender_id,
                    message:message ,
                    chat_id:chat_id
                }
                newMsg = await MessageModel.create(newMsg)
                await ChatModel.findByIdAndUpdate(chat_id,{
                    latestMessage:newMsg._id
                })
                res.send({status:1,messageSent:newMsg,message:"Message sent"})
            }catch(error){
                res.send({ message: error.toString()})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}



module.exports = {
    allEmployees,
    checkAlreadyInvited,
    sendAnInvite,
    respondOnInvitation,
    accessChatMessages,
    accessChatUsers,
    sendMessage
}

// > db.employees.find( {"$or":[ {"$and": [{"name": "neha"}, {"status": true}] }, {"name" : "diksha" } ] } );
