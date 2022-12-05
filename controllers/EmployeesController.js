const EmployeesModel = require("../models/Employees")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid")

const employeeExist = async (req, res) => {
    try {
        const employee = await EmployeesModel.find()
        res.json(employee)
        // EmployeesModel.find({}).then((result) => {
        //     console.log(result)
        //     res.json({data:result,name:"neha"})
        // }).catch((error) => console.log(error))
    } catch (error) {
        res.json({ messege: error })
    }
}




const sendEmail = async (req, res) => {
    try {
        const employee = await EmployeesModel.findOne({ email: req.body.email });
        console.log("emp:",employee)
        if (employee) {
            console.log('hello')
            try {
                var transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    auth: {
                      user: "prattyancha26@gmail.com",
                      pass: "pdzqfsanbiqwaogb"
                    }
                  });

                const mailOptions = {
                    from: 'prattyancha26@gmail.com',
                    to:`${employee.email}`,
                    subject: 'reset password',
                    text: `<p>scdc</p>`
                };
                console.log("DATA =>", mailOptions);
                let info  = await transporter.sendMail(mailOptions);
                res.json(info)
            } catch (error) {
                res.json({ messege: error })
            }
        }


    } catch (error) {
        res.json({ messege: error })
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
        // const { error } = validate(req.body);
        // if (error)
        //     return res.status(400).send({ message: error.details[0].message });

        const user = await EmployeesModel.findOne({ email: req.body.email });
        if (!user)
            return res.status(401).send({ message: "Invalid Email or Password" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(401).send({ message: "Invalid Email or Password" });

        const token = user.generateAuthToken();
        res.status(200).send({ data: token, message: "logged in successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
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

module.exports = {
    employeeExist,
    signIn,
    signUp,
    sendEmail
}