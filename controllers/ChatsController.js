const ChatModel = require('../models/Chat')
const MessageModel = require('../models/Messages')
const EmployeesModel = require('../models/Employees')

const allEmployees = async (req, res) => {
    let user_details = [];
    try {
        const userData = await EmployeesModel.find({'email': {$ne: req.body.email }, status: true});        
        res.send({status:1,users:userData,message:"Returned employees list"});
    } catch (error) {
        res.json({ messege: error.toString() })
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
        res.send({ message: error.toString() })
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
                const newMsg = {
                    sender_id:sender_id,
                    reciever_id:reciever_id,
                    message:message ,
                    chat_id:chat_id
                }
                const msgSave = await MessageModel.create(newMsg)
                const senderInfo = await msgSave.populate("sender_id","name email")
                const chatInfo = await msgSave.populate("chat_id")
                res.send(chatInfo)
            }else{
                // const employee = new EmployeesModel({
                //     name: emailExistInTemp.name,
                //     email: emailExistInTemp.email,
                //     password: emailExistInTemp.password,
                //     status: true
                // });
                // const saveEmployee = await employee.save();
                // res.send({status:2,message:"Send an invite"})
            }
        }else{
            res.send({status:0,message:"Post parameters missing"})
        }
    }catch(error){
        res.send({ message: error.toString() })
    }
}

module.exports = {
    allEmployees,
    checkAlreadyInvited,
    sendAnInvite
}

// > db.employees.find( {"$or":[ {"$and": [{"name": "neha"}, {"status": true}] }, {"name" : "diksha" } ] } );
