const EmployeesModel = require("../models/Employees")
const bcrypt = require("bcrypt")
const {sendMail} = require('./common');
const { use } = require("../routes/employeeRoute");
// const { v4: uuidv4 } = require("uuid")

const employeeExist = (email) => {
    try {
        const employee = EmployeesModel.findOne({ email: email });
        if(employee){
            return 1;
        }else{
            return 0;
        }
    } catch (error) {
       return 0
    }
}

const forgotPassword = async (req, res) => {
    try{
        if('email' in req.body === false || req.body.email === ''){
            res.send({ message: "Please enter valid email",status:0 });
        }else{
            const checkExist = await EmployeesModel.findOne({ email: req.body.email });
            if(checkExist){
                const hashPassword =  await bcrypt.hash(req.body.email.toString(), 10);
                // bcrypt.compare(params.email,hashPassword).then((res)=>console.log(hashPassword,res))
                // console.log({status:1,resetPassLink:'https://personal-h1klr039.outsystemscloud.com/KonChat/resetPassword?check='+checkExist.id+'&hash='+hashPassword})
                // const mailSent = sendMail({id:checkExist.id,email:req.body.email})
                // res.send(mailSent)
                res.send({status:1,message:"",resetPassLink:'https://personal-h1klr039.outsystemscloud.com/KonChat/resetPassword?check='+checkExist.id+'&hash='+hashPassword,reemail:req.body.email,checkExist:checkExist.email})
            }else{
                res.send({ message: "Email does not exist in our database",status:0 });
            }
        }
    }catch(error){
        res.json({ messege: error })
    }
    



    // let date = new Date();
    // day = date.getDate();
    // month = date.getMonth();
    // year = date.getFullYear();
    // if (date.getHours() < 12) {
    //     time = (12 - date.getHours()) + '/' + date.getMinutes() + '//' + date.getMilliseconds();
    // }else{
    //     time = (date.getHours() - 12) + '/' + date.getMinutes() + '//' + date.getTimezoneOffset();
    // }


    // console.log("DaY =>", time,'--',time + 3600000)
    // try {
    //     const employee = await EmployeesModel.findOne({ email: req.body.email });
    //     // res.json(employee);
    //     if (employee) {
    //         try {
    //             const otp = `${Math.floor(1000 + Math.random() * 9000)}`

    //             const transporter = nodemailer.createTransport({
    //                 service: 'gmail',
    //                 host:'smtp.gmail.com',
    //                 port : 587,
    //                 auth: {
    //                     user: 'prattyancha.patharkar@konverge.ai',
    //                     pass: 'prattyancha2601',
    //                 }
    //             });

    //             console.log("env :",process.env.AUTH_EMAIL);

    //             const mailOptions = {
    //                 from: 'prattyancha.patharkar@konverge.ai',
    //                 to: 'neha.sawarkar@konverge.ai',
    //                 subject: 'reset password',
    //                 html: `<p>${otp}</p>`
    //             };

    //             const saveEmployee = new EmployeesModel({
    //                 name: employee.name,
    //                 email: employee.email,
    //                 password: employee.password,
    //                 mobile: employee.mobile,
    //                 designation: employee.designation,
    //                 status: employee.status,
    //                 created: true,
    //                 code: otp,
    //                 expireIn: Date.now() + 3600000,
    //                 createdAt: Date.now()
    //             });
    //             const data = await saveEmployee.save();
    //             let mail = await transporter.sendMail(mailOptions);
    //             console.log("DATA =>", mail);
    //             res.json(data)
    //         } catch (error) {
    //             res.json({ messege: error })
    //         }
    //     }


    // } catch (error) {
    //     res.json({ messege: error })
    // }
}

const resetPassword = async(req,res) => {
    try{
        const user = await EmployeesModel.findOne({ _id: req.body.check });

        if(!user || await bcrypt.compare(user.email,req.body.hash) === false){

            res.send({ status: 0, message: 'Invalid user is trying to reset password' })

        }else if ('password' in req.body === false || 'confirm_password' in req.body === false || req.body.password != req.body.confirm_password) {

            res.send({ status: 0, message: 'Please enter valid password in both password and confirm password field' })

        }else{

            const update = await EmployeesModel.updateOne({_id:req.body.check},{$set:{password:await bcrypt.hash(req.body.password, 10)}})
            res.send({status:await bcrypt.hash(req.body.password, 10),message:'Password has been reset successfully, please login with new password'})

        }
    }catch(error){
        res.send({message:error.toString()})
    }
}

const checkResetPasswordRequest = async(req,res) => {
    try{
        const user = await EmployeesModel.findOne({ _id: req.query.check });

        if(!user || await bcrypt.compare(user.email,req.query.hash) === false){
            res.send({ status: 0, message: 'Invalid user is trying to reset password' })
        }else{
            res.send({ status: 1, message: 'User verified successfully' })
        }

    }catch(error){
        res.send({message:error})
    }
}

{/*
 try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await EmployeesModel.findOne({ email: req.body.email });
        // console.log("object==>",req.body);
        if (user)
        return res
        .status(409)
        .send({ message: "EmployeesModel with given email already Exist!" });
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        
        await new EmployeesModel({ ...req.body, password: hashPassword }).save();
        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
*/}


const signIn = async (req, res) => {
    try {
        const user = await EmployeesModel.findOne({ email: req.body.email});
        const validPassword = await bcrypt.compare(
            req.body.password,
            user?user.password:''
        );
        if ('email' in req.body === false || req.body.email.length < 13 || req.body.email.includes('konverge.ai') === false) {
            return { status: 0, message: 'Please enter valid email' }
        } else if ('password' in req.body === false) {
            return { status: 0, message: 'Please enter password' }
        }else if (!user || validPassword === false){
            res.json({ message: "Invalid Email or Password",status:0 });
        }else{
            const token = user.generateAuthToken();
            res.status(200).json({ data:user, message: "logged in successfully",status:1 });
        }

    } catch (error) {
        res.status(500).json({ message: error.toString(),status:0 });
    }
}

// const signIn = async(req,res) => {
//     try{
//         const employee = await EmployeesModel.findOne({email:req.body.email,password:req.body.password});
//         if(employee){
//             const validPassword = await bcrypt.compare(
//                 req.body.password,
//                 employee.password
//             );
//             const response = {
//                 data : employee,
//                 status:200,
//             }
//             res.json(response)
//         }else{
//             const response = {
//                 message:'Invalid credentials',
//                 status:200,
//             }
//             res.json(response)
//         }
//     }catch(error){
//         res.json({message:error})
//     }
// }

const signUp = async (req, res) => {
    try {
        const validateEmpty = checkEmpty(req.body)
        if (validateEmpty.status === 0) {
            const response = {
                message: validateEmpty.msg,
                status: validateEmpty.status
            }
            res.json(response)
        } else {
            const emailExist = await EmployeesModel.findOne({ email: req.body.email });
            if (emailExist) {
                const response = {
                    message: "Email already exist",
                    status: 0,
                }
                res.json(response)
            } else {
                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                const hashPassword = await bcrypt.hash(req.body.password, salt);

                const employee = new EmployeesModel({
                    name: req.body.name,
                    email: req.body.email,
                    password: hashPassword
                });

                try {
                    const saveEmployee = await employee.save();
                } catch (error) {
                    res.json({ message: error })
                }
                const response = {
                    message: 'Employee has been registered successfully',
                    status: 1,
                }
                res.json(response)
            }

        }
    } catch (error) {
        res.json({ message: error })
    }
}

const checkEmpty = (data) => {
    if ('name' in data === false || data.name.length < 2) {
        return { status: 0, msg: 'Please enter valid name' }
    } else if ('email' in data === false || data.email.length < 13 || data.email.includes('konverge.ai') === false) {
        return { status: 0, msg: 'Please enter valid email' }
    } else if ('password' in data === false || 'confirm_password' in data === false || data.password != data.confirm_password) {
        return { status: 0, msg: 'Please enter valid password in both password and confirm password field' }
    } else {
        return { status: 1 }
    }
}

const checkEmailPattern = (email) => {}

module.exports = {
    employeeExist,
    signIn,
    signUp,
    forgotPassword,
    resetPassword,
    checkResetPasswordRequest
}