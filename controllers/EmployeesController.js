const EmployeesModel = require("../models/Employees")
const bcrypt = require("bcrypt")
const { sendMail } = require('./common');
const { use } = require("../routes/employeeRoute");
var nodemailer = require('nodemailer');
// var emailStyle = require('./emailTemplate.css');
// const { v4: uuidv4 } = require("uuid")


let restpass_link = "";

const employeeExist = (email) => {
    try {
        const employee = EmployeesModel.findOne({ email: email });
        if (employee) {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        return 0
    }
}


const forgotPassword = async (req, res) => {
    try {
        if ('email' in req.body === false || req.body.email === '') {
            res.send({ message: "Please enter valid email", status: 0 });
        } else {
            const checkExist = await EmployeesModel.findOne({ email: req.body.email });
            if (checkExist) {
                const hashPassword = await bcrypt.hash(req.body.email.toString(), 10);
                let userDetails = {
                    status: 1, message: "rest password link has been sent to you email",
                    resetPassLink: 'https://personal-h1klr039.outsystemscloud.com/KonChat/resetPassword?check=' + checkExist.id + '&hash=' + hashPassword,
                    reemail: req.body.email, checkExist: checkExist.email
                }

                try {
                    var transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        auth: {
                            user: "prattyancha26@gmail.com",
                            pass: "kywxwinhygabkajr"
                        }
                    });

                    const mailOptions = {
                        from: 'prattyancha26@gmail.com',
                        to:  `${checkExist.email}`,
                        subject: 'Reset Your KonChat password',
                        html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                        <style>
                        body {background-color: powderblue;}
                        .main-content{color: black;}
                        .link    {
                            text-decoration-line: none;
                            font-size : 20px;
                            color : white !important;
                        }
                        .btn {
                            height: 40px;
                            background-color: orange;
                            border-radius: 58px;
                            border: 1px solid orange;
                            width: 200px;
                        }
                        </style>
                        </head>

                        <body>
                        <p class="main-content">Hello ${checkExist.name} we have received a request to set a new password for this account</p>
                        <button class="btn"> 
                        <a class="link" href=${userDetails.resetPassLink}>Reset Password</a>
                        </button>


                        <p>If you didn’t make this request, ignore this email.</p>
                        </body>

                        </html>
                        `
                    };
                    let info = await transporter.sendMail(mailOptions);
                    // res.json(info)
                } catch (error) {
                    console.log({ messege: error })
                }
                res.send(userDetails)
            } else {
                res.send({ message: "Email does not exist in our database", status: 0 });
            }
        }
    } catch (error) {
        res.json({ messege: error.toString() })
    }
}

const resetPassword = async (req, res) => {
    try {
        const user = await EmployeesModel.findOne({ _id: req.body.check });

        if (!user || await bcrypt.compare(user.email, req.body.hash) === false) {

            res.send({ status: 0, message: 'Invalid user is trying to reset password' })

        } else if ('password' in req.body === false || 'confirm_password' in req.body === false|| (req.body.password.length >= 8 && req.body.password.length <= 16 )  || req.body.password != req.body.confirm_password) {

            res.send({ status: 0, message: 'Please enter valid password in both password and confirm password field' })

        } else {

            const update = await EmployeesModel.updateOne({ _id: req.body.check }, { $set: { password: await bcrypt.hash(req.body.password, 10) } })
            res.send({ status: await bcrypt.hash(req.body.password, 10), message: 'Password has been reset successfully, please login with new password' })

        }
    } catch (error) {
        res.send({ message: error.toString() })
    }
}

const checkResetPasswordRequest = async (req, res) => {
    try {
        const user = await EmployeesModel.findOne({ _id: req.query.check });

        if (!user || await bcrypt.compare(user.email, req.query.hash) === false) {
            res.send({ status: 0, message: 'Invalid user is trying to reset password' })
        } else {
            res.send({ status: 1, message: 'User verified successfully' })
        }

    } catch (error) {
        res.send({ message: error })
    }
}


const signIn = async (req, res) => {
    try {
        const user = await EmployeesModel.findOne({ email: req.body.email });
        const validPassword = await bcrypt.compare(
            req.body.password,
            user ? user.password : ''
        );
        if ('email' in req.body === false || req.body.email.length < 13 || req.body.email.includes('konverge.ai') === false) {
            return { status: 0, message: 'Please enter valid email' }
        } else if ('password' in req.body === false) {
            return { status: 0, message: 'Please enter password' }
        } else if (!user || validPassword === false) {
            res.json({ message: "Invalid Email or Password", status: 0 });
        } else {
            const token = user.generateAuthToken();
            res.status(200).json({ data: user, message: "logged in successfully", status: 1 });
        }

    } catch (error) {
        res.status(500).json({ message: error.toString(), status: 0 });
    }
}



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
    } else if ('email' in data === false || data.email.length < 13 || data.email.includes('\t') || data.email.includes(' ')  || data.email.includes('konverge.ai') === false) {
        return { status: 0, msg: 'Please enter valid email' }
    } else if ('password' in data === false || 'confirm_password' in data === false || data.password.length <= 8 || data.password.length >= 16  || data.password != data.confirm_password) {
        return { status: 0, msg: 'Please enter valid password in both password and confirm password field' }
    } else {
        return { status: 1 }
    }
}

const checkEmailPattern = (email) => { }

module.exports = {
    employeeExist,
    signIn,
    signUp,
    forgotPassword,
    resetPassword,
    checkResetPasswordRequest,
}