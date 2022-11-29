const EmployeesModel = require("../models/Employees")

const employeeExist = async(req,res) => {
    try{
        const employee = await EmployeesModel.find()
        res.json(employee)
        // EmployeesModel.find({}).then((result) => {
        //     console.log(result)
        //     res.json({data:result,name:"neha"})
        // }).catch((error) => console.log(error))
    }catch(error){
        res.json({messege:error})
    }
}

const signIn = async(req,res) => {
    try{
        const employee = await EmployeesModel.findOne({email:req.body.email,password:req.body.password});
        
        if(employee){
            const response = {
                data : employee,
                status:200,
            }
            res.json(response)
        }else{
            const response = {
                message:'Invalid credentials',
                status:200,
            }
            res.json(response)
        }
    }catch(error){
        res.json({message:error})
    }
}

const signUp = async(req,res) => {
    try{
        const validateEmpty = checkEmpty(req.body)
        if(validateEmpty.status === 0){
            const response = {
                    message:validateEmpty.msg,
                    status:validateEmpty.status
                }
                res.json(response)
        }else{
            const emailExist = await EmployeesModel.findOne({email:req.body.email});
            if(emailExist){
                const response = {
                    message : "Email already exist",
                    status:0,
                }
                res.json(response)
            }else{
                const employee = new EmployeesModel({
                    name:req.body.name,
                    email:req.body.email,
                    password:req.body.password
                })
                try{
                    const saveEmployee = await employee.save()
                }catch(error){
                    res.json({message:error})
                }
                const response = {
                    message:'Employee has been registered successfully',
                    status:1,
                }
                res.json(response)
            }
            
        }
    }catch(error){
        res.json({message:error})
    }
}

const checkEmpty = (data) => {
    if('name' in data === false || data.name.length<2){
        return {status:0,msg:'Please enter valid name'}
    }else if('email' in data === false || data.email.length<13 || data.email.includes('konverge.ai') === false){
        return {status:0,msg:'Please enter valid email'}
    }else if('password' in data === false || 'confirm_password' in data === false || data.password != data.confirm_password){
        return {status:0,msg:'Please enter valid password in both password and confirm password field'}
    }else{
        return {status:1}
    }
}
module.exports = {
    employeeExist,
    signIn,
    signUp
}