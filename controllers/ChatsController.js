const ChatModel = require('../models/Chat')
const MessageModel = require('../models/Messages')
const EmployeesModel = require('../models/Employees')

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
            if(check){
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

const accessChats = async(req,res) => {
    try{
        const {sender_id,reciever_id} = req.body
        if(sender_id && reciever_id){
            let chatExist = await ChatModel.find({
                isGroupChat:false,
                $and:[
                    { "employees._id":sender_id},
                    { "employees._id":reciever_id},
                ]
            }).populate("employees","-password").populate("latestMessage")
            
            chatExist = await EmployeesModel.populate(chatExist,{
                path:"latestMessage.sender_id",
                select:"name email avtar"
            })
            if(chatExist.length>0){
                res.send(chatExist)
            }else{
                const newChat = {
                    emp_name:"sender",
                    isGroupChat:false,
                    employees:[sender_id,reciever_id]
                }
                console.log(newChat)
                
                try{
                    const chatCreated = await ChatModel.create(newChat)
                    const fullChat = await ChatModel.findOne({_id:chatCreated}).populate("employees","-password")
                    res.send({status:1,fullChat:fullChat,message:"Chat messages"})
                }catch(error){
                    res.send({ message: error.toString()})
                }
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
        const {sender_id,reciever_id,chat_id,message} = req.body
        if(sender_id && reciever_id && chat_id){
            const check = await ChatModel.findOne({
                $or:[{
                    $and:[
                        {sender_id:sender_id,reciever_id:reciever_id},
                        {sender_id:reciever_id,reciever_id:sender_id}
                    ],
                }],$and:[{is_invite:true}]})
            if(!check){
                let newMsg = {
                    sender_id:sender_id,
                    reciever_id:reciever_id,
                    message:message ,
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
                    latestMessage:message,
                })
                res.send(newMsg)
            }else{
                res.send({status:0,message:"First need to invite an user"})
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
    accessChats
}

// > db.employees.find( {"$or":[ {"$and": [{"name": "neha"}, {"status": true}] }, {"name" : "diksha" } ] } );
