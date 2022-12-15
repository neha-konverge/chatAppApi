const EmployeesModel = require("../models/Employees")
const bcrypt = require("bcrypt")
const { sendMail, verifyEmailTemplate } = require('./common');
const { use } = require("../routes/employeeRoute");
var nodemailer = require('nodemailer');
const { response } = require("express");
// var emailStyle = require('./emailTemplate.css');
// const { v4: uuidv4 } = require("uuid")

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
        const userData = await EmployeesModel.find({'email': {$ne: req.body.email }});
        console.log('req=>', userData)
        if (userData) {
            userData.map((users, key) => {
                    if (users.status === true) {
                        user_details.push(users);
                    }
            })
            console.log("res ====:",user_details)
            res.send(userData);
        }

    } catch (error) {
        console.log('error:', error);
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
                    status: 1,
                    message: "Reset password link has been sent to you email",
                    resetPassLink: process.env.WEBSITE_LINK + 'resetPassword?check=' + checkExist.id + '&hash=' + hashPassword
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
        console.log('user:', req.body.password);
        console.log('confirmuser:', req.body.confirm_password);

        if (!user || bcrypt.compare(user.email, req.body.hash) === false) {
            res.send({ status: 0, message: 'Invalid user is trying to reset password' })
        } else if ('password' in req.body === false || passwordRegex.test(req.body.password) === false || req.body.password.length <= 0 || req.body.password.length > 8) {
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
        const user = await EmployeesModel.findOne({ email: req.body.email });
        const userActive = await EmployeesModel.findOne({ email: req.body.email, status: true });
        const validPassword = await bcrypt.compare(
            req.body.password,
            user ? user.password : ''
        );
        if ('email' in req.body === false || req.body.email.length < 13 || req.body.email.includes('konverge.ai') === false) {
            return { status: 0, message: 'Please enter valid email', activated: 0 }
        } else if ('password' in req.body === false) {
            return { status: 0, message: 'Please enter password', activated: 0 }
        } else if (!user) {
            res.json({ message: "Email id does not exist in our database", status: 0, activated: 0 });
        } else if (!userActive) {
            res.json({ message: "Your account is not activated, please verify your email id to activate", activated: 0, status: 1 });
        } else if (!userActive || validPassword === false) {
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
        const emailExist = await EmployeesModel.findOne({ email: req.body.email });
        if (!emailExist) {
            res.json({ message: "Invalid user is trying to verify email", status: 0 });
        } else if (emailExist && emailExist.status === true) {
            res.json({ message: "This email verification is already done", status: 0 });
        } else {
            await EmployeesModel.updateOne({ _id: emailExist._id }, { $set: { status: true } })
            res.json({ message: "Email verified successfully", status: 1 });
        }
    } catch (error) {
        res.send({ message: error.toString() })
    }
}

const sendVerificationEmail = async (req, res) => {
    try {
        const emailExist = await EmployeesModel.findOne({ email: req.body.email });
        if (!emailExist) {
            res.json({ message: "Invalid user is trying to verify email", status: 0 });
        } else if (emailExist && emailExist.status === true) {
            res.json({ message: "This email verification is already done", status: 0 });
        } else {
            const verify_email = process.env.WEBSITE_LINK + 'accountActivation?check=' + req.body.email

            let emailTemplate = verifyEmailTemplate({ verify_email: verify_email, name: emailExist.name })

            let mail_sent = await sendMail({
                to_email: req.body.email,
                subject: 'Email verification for konchat account',
                html: emailTemplate
            }).then((a) => {
                return a.messageId
            })
            if (mail_sent) {

                const response = {
                    message: 'Email verification mail has been sent to your email',
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
                    password: hashPassword,
                    status: false
                });

                const verify_email = process.env.WEBSITE_LINK + 'accountActivation?check=' + req.body.email

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
                        message: 'Email verification mail has been sent to your email',
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
    } else if ('password' in data === false || passwordRegex.test(data.password) === false || data.password.length <= 0 || data.password.length > 8) {
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
    getRecord
}