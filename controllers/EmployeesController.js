const EmployeesModel = require("../models/Employees")
const TempEmployeesModel = require("../models/TempEmployees")
const bcrypt = require("bcrypt")
const { sendMail, verifyEmailTemplate } = require('./common');
const { use } = require("../routes/employeeRoute");
var nodemailer = require('nodemailer');
const { response } = require("express");
const jwt = require("jsonwebtoken")
const { isJwtExpired } = require('jwt-check-expiration');

const passwordRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g
let signedIn = {};

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

const getRecord = async (req, res) => {
    let user_details = [];
    try {
        const userData = await EmployeesModel.find({'email': {$ne: req.body.email }, status: true});        
        if (userData) {
            userData.map((users, key) => {
                if (users.status === true) {
                    user_details.push(users);
                }
            })
            res.send(userData);
        }
    } catch (error) {
        res.json({ messege: error.toString() })
    }
}

const forgotPassword = async (req, res) => {
    try {
        if ('email' in req.body === false || req.body.email === '') {
            res.send({ message: "Please enter valid email", status: 0 });
        } else {
            const checkExist = await EmployeesModel.findOne({ email: req.body.email });
            const emailExistInTemp = await TempEmployeesModel.findOne({ email: req.body.email });
            if (!emailExistInTemp && !checkExist) {
                res.send({ message: "Email does not exist in our database", status: 0 });
            }else if(emailExistInTemp && !checkExist) {
                res.send({ message: "This email is registered but verification is pending", status: 0 });
            }else {
                const hashPassword = await bcrypt.hash(req.body.email.toString(), 10);
                let userDetails = {
                    status: 1,
                    message: "Reset password link has been sent to your registered email",
                }
                try {
                    const token = jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + (10 * 60),
                        data: req.body.email
                    }, 'secretKey');

                    userDetails.resetPassLink= process.env.WEBSITE_LINK + 'resetPassword?token='+token+'&check=' + checkExist.id + '&hash=' + hashPassword

                    var transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        auth: {
                            user: "prattyancha26@gmail.com",
                            pass: "kywxwinhygabkajr"
                        }
                    });

                    const mailOptions = {
                        from: 'prattyancha.patharkar@konverge.ai',
                        to: `${checkExist.email}`,
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
                        <p class="main-content"><b></b>Hello ${checkExist.name},<br/>
                         we have received a request to set a new password for this account.
                         <br/>${checkExist.email}</p>

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
                    res.json({ messege: error.toString() })
                }
                res.send(userDetails)
            }
        }
    } catch (error) {
        res.json({ messege: error.toString() })
    }
}

const verifyToken = (req,res) => {
    try{
        if(isJwtExpired(req.query.token) === true){
            res.send({ message: "This link has been expired, please try again", status: 0 });
        }else{
            res.send({ message: "Verifed successfully", status: 1 });
        }
    } catch (error) {
        res.json({ messege: error.toString() })
    }
}

const resetPassword = async (req, res) => {
    try {
        const user = await EmployeesModel.findOne({ _id: req.body.check });
        const emailExistInTemp = await TempEmployeesModel.findOne({ _id: req.body.check });

        if (!emailExistInTemp && !user) {
            res.send({ status: 0, message: 'Email does not exist in our database'})
        }else if (emailExistInTemp && !user) {
            res.send({ status: 0, message: 'This email is already registered but verification is pending' })
        }else if (!user || bcrypt.compare(user.email, req.body.hash) === false) {
            res.send({ status: 0, message: 'Invalid user is trying to reset password' })
        } else if ('password' in req.body === false 
        //|| passwordRegex.test(req.body.password) === false 
        || req.body.password.length <= 0 || req.body.password.length > 8) {
            res.send({ status: 0, message: 'Please enter valid password' })
        } else if ('confirm_password' in req.body === false || req.body.password != req.body.confirm_password) {
            res.send({ status: 0, message: 'Password and confirm password should be same' })
        } else {
            const update = await EmployeesModel.updateOne({ _id: req.body.check }, { $set: { password: await bcrypt.hash(req.body.password, 10) } })
            res.send({ status: 1, message: 'Password has been reset successfully, please login with new password' })
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
        const userTemp = await TempEmployeesModel.findOne({ email: req.body.email });
        const user = await EmployeesModel.findOne({ email: req.body.email });
        // const userActive = await EmployeesModel.findOne({ email: req.body.email, status: true });
        const validPassword = await bcrypt.compare(
            req.body.password,
            user ? user.password : ''
        );
        if ('email' in req.body === false || req.body.email.length < 13 || req.body.email.includes('konverge.ai') === false) {
            return { status: 0, message: 'Please enter valid email', activated: 0 }
        } else if ('password' in req.body === false) {
            return { status: 0, message: 'Please enter password', activated: 0 }
        } else if (!userTemp && !user) {
            res.json({ message: "Email id does not exist in our database", status: 0, activated: 0 });
        } else if (userTemp && !user) {
            res.json({ message: "Your account is not activated, please verify your email id to activate", activated: 0, status: 1 });
        } else if (!user || validPassword === false) {
            res.json({ message: "Invalid Email or Password", status: 0, activated: 0 });
        } else {
            res.status(200).json({ data: user, message: "logged in successfully", status: 1, activated: 1 });
        }
    } catch (error) {
        res.status(500).json({ message: error.toString(), status: 0 });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const emailExistInTemp = await TempEmployeesModel.findOne({ email: req.body.email });
        const emailExist = await EmployeesModel.findOne({ email: req.body.email });
        // if(isJwtExpired(req.body.token) === true){
        //     const token = jwt.sign({
        //         exp: Math.floor(Date.now() / 1000) + (1 * 60),
        //         data: req.body.email
        //     }, 'secretKey');
        //     process.env.WEBSITE_LINK + 'accountActivation?token='+token+'&check=' + req.body.email
        //     res.json({ message: "This link has been expired. To verify your email<a href>click here</a>", status: 0 });
        // }else 
        if (!emailExistInTemp && emailExist && emailExist.status === true) {
            res.json({ message: "This email verification is already done", status: 0 });
        } else if (!emailExistInTemp) {
            res.json({ message: "Invalid user is trying to verify email", status: 0 });
        } else {
            const employee = new EmployeesModel({
                name: emailExistInTemp.name,
                email: emailExistInTemp.email,
                password: emailExistInTemp.password,
                status: true
            });
            const saveEmployee = await employee.save();

            await TempEmployeesModel.deleteOne({ _id: emailExistInTemp._id })
            res.json({ message: "Email verified successfully", status: 1 });
        }
    } catch (error) {
        res.send({ message: error.toString() })
    }
}

const sendVerificationEmail = async (req, res) => {
    try {
        const emailExistTemp = await TempEmployeesModel.findOne({ email: req.body.email });
        const emailExist = await EmployeesModel.findOne({ email: req.body.email });
        if (!emailExistTemp && emailExist && emailExist.status === true) {
            res.json({ message: "This email verification is already done", status: 0 });
        }else if (!emailExistTemp) {
            res.json({ message: "Invalid user is trying to verify email", status: 0 });
        } else {
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (10 * 60),
                data: req.body.email
            }, 'secretKey');
            const verify_email = process.env.WEBSITE_LINK + 'accountActivation?token='+token+'&check=' + req.body.email

            let emailTemplate = verifyEmailTemplate({ verify_email: verify_email, name: emailExistTemp.name })

            let mail_sent = await sendMail({
                to_email: req.body.email,
                subject: 'Email verification for konchat account',
                html: emailTemplate
            }).then((a) => {
                return a.messageId
            })
            if (mail_sent) {

                const response = {
                    message: 'Email activation mail has been sent to your registered email',
                    status: 1,
                }
                res.json(response)
            } else {
                const response = {
                    message: mail_sent,
                    status: 0,
                }
                res.json(response)
            }
        }
    } catch (error) {
        res.send({ message: error.toString() })
    }
}

const signUp = async (req, res) => {
    try {
        const validateEmpty = checkEmpty(req.body)
        if (validateEmpty.status === 0) {
            const response = {
                message: validateEmpty.message,
                status: validateEmpty.status
            }
            res.json(response)
        } else {
            const emailExistTemp = await TempEmployeesModel.findOne({ email: req.body.email });
            const emailExist = await EmployeesModel.findOne({ email: req.body.email });
            if (emailExistTemp) {
                const response = {
                    message: "This email is already registered but verification is pending",
                    status: 0,
                }
                res.json(response)
            }else if (emailExist) {
                const response = {
                    message: "Email already exist",
                    status: 0,
                }
                res.json(response)
            } else {
                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                const hashPassword = await bcrypt.hash(req.body.password, salt);

                const employee = new TempEmployeesModel({
                    name: req.body.name,
                    email: req.body.email,
                    password: hashPassword,
                    status: false
                });
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (10 * 60),
                    data: req.body.email
                }, 'secretKey');
                const verify_email = process.env.WEBSITE_LINK + 'accountActivation?token='+token+'&check=' + req.body.email

                let emailTemplate = verifyEmailTemplate({ verify_email: verify_email, name: req.body.name })

                let mail_sent = await sendMail({
                    to_email: req.body.email,
                    subject: 'Email verification for konchat account',
                    html: emailTemplate
                }).then((a) => {
                    return a.messageId
                })
                if (mail_sent) {
                    const saveEmployee = await employee.save();
                    const response = {
                        message: 'Registration successfull! Email verification link has been sent to your registered email id',
                        status: 1,
                    }
                    res.json(response)
                } else {
                    const response = {
                        message: mail_sent,
                        status: 0,
                    }
                    res.json(response)
                }
            }
        }
    } catch (error) {
        res.json({ message: error.toString() })
    }
}

const checkEmpty = (data) => {
    if ('name' in data === false || data.name.length < 2) {
        return { status: 0, message: 'Please enter valid name' }
    } else if ('email' in data === false || data.email.length < 13 || data.email.includes('\t') || data.email.includes(' ') || data.email.includes('konverge.ai') === false) {
        return { status: 0, message: 'Please enter valid email' }
    } else if ('password' in data === false 
    //|| passwordRegex.test(data.password) === false 
    || data.password.length <= 0 || data.password.length > 8) {
        return { status: 0, message: 'Please enter valid password' }
    } else if ('confirm_password' in data === false || data.password != data.confirm_password) {
        return { status: 0, message: 'Password and confirm password should be same' }
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
    verifyEmail,
    sendVerificationEmail,
    getRecord,
    verifyToken
}