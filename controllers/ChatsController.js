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
                $or:[{
                    $and:[
                        {sender_id:req.body.sender_id,reciever_id:req.body.reciever_id},
                        {sender_id:req.body.reciever_id,reciever_id:req.body.sender_id}
                    ],
                }],$and:[{is_invite:true}]})
            if(check && check.inviteStatus === 'pending'){
                res.send({status:1,message:"Already invited"})
            }else{
                res.send({status:2,message:"Send an invite"})
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
        if(sender_id && reciever_id){
            let chatExist = await ChatModel.find({$query:{
                isGroupChat:false,sender_id:sender_id
            }}).populate("reciever_id",'-password,-__v').populate("latestMessage",'message updatedAt').sort({ updatedAt : -1 })
            if(chatExist.length>0){
                res.send({status:1,messages:chatExist,message:"Chat messages list returned"})
            }else{
                res.send({status:1,messages:[],message:"No chat messages found"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString()})
    }
}

const accessChats = async(req,res) => {
    try{
        const {sender_id,reciever_id} = req.body
        if(sender_id && reciever_id){
            let chatExist = await ChatModel.find({
                isGroupChat:false,sender_id:sender_id,reciever_id:reciever_id
                // $and:[
                //     { "employees._id":sender_id},
                //     { "employees._id":reciever_id},
                // ]
            })//.populate("employees","-password").populate("latestMessage")
            chatExist = await EmployeesModel.populate(chatExist,{
                path:"latestMessage.sender_id",
                select:"name email avtar"
            })
            if(chatExist.length>0){
                res.send({status:1,chatUsers:chatExist,message:"Chat messages list returned"})
            }else{
                res.send({status:1,chatUsers:[],message:"No chat messages found"})
                // const newChat = {
                //     emp_name:"sender",
                //     isGroupChat:false,
                //     employees:[sender_id],
                //     is_invite:true
                // }
                // try{
                //     const chatCreated = await ChatModel.create(newChat)
                //     const fullChat = await ChatModel.findOne({_id:chatCreated._id}).populate("employees","-password")
                //     res.send({status:1,fullChat:fullChat,message:"Chat messages"})
                // }catch(error){
                //     res.send({ message: error.toString()})
                // }
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
            const check = await ChatModel.findOne({$or:[{employees:reciever_id},{employees:sender_id}]})
            if(check === null || !check.length === 0){
                // if(true){
                console.log("check:success")
                const newChat = {
                    emp_name:"sender",
                    sender_id:sender_id,
                    reciever_id:reciever_id,
                    isGroupChat:false,
                    employees:[reciever_id],
                    // employees:[reciever_id],
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
                    // newMsg = await newMsg.populate("sender_id","-password")
                    // newMsg = await newMsg.populate("reciever_id","-password")
                    // newMsg = await newMsg.populate("chat_id")
                    // newMsg = await EmployeesModel.populate(newMsg,{
                    //     path:"chat.employees",
                    //     select:"name avtar" 
                    // })
                    // const fullChat = await ChatModel.findOne({_id:chatCreated._id}).populate("employees","-password").populate({
                    //     newMsg,
                    //     select:"message" 
                    // })
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
            console.log("chatStatus",chatStatus)
            if(chatExist){
                if(!chatStatus){
                    if(status==='accepted'){
                        let newMsg = {
                            sender_id:sender_id,
                            message:"Hi" ,
                            chat_id:chat_id
                        }
                        newMsg = await MessageModel.create(newMsg)
                        newMsg = await newMsg.populate("sender_id","name avtar")
                        newMsg = await newMsg.populate("chat_id")
                        newMsg = await EmployeesModel.populate(newMsg,{
                            path:"chat.employees",
                            select:"name avtar" 
                        })
                        await ChatModel.findByIdAndUpdate(chat_id,{
                            latestMessage:newMsg._id,inviteStatus:"accepted"
                        })
                        res.send({status:1,message:"Invitation accepted by user",data:newMsg})
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

module.exports = {
    allEmployees,
    checkAlreadyInvited,
    sendAnInvite,
    respondOnInvitation,
    accessChats,
    accessChatUsers
}

// > db.employees.find( {"$or":[ {"$and": [{"name": "neha"}, {"status": true}] }, {"name" : "diksha" } ] } );
