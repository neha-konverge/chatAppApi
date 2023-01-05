const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")
const sendMail = (params) => {
    try{
        var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: "neha.sawarkar@konverge.ai",
                pass: "tqergahgislirriy"
            }
        });
        const mailOptions = {
            from: 'konchat@konverge.ai',
            to:  params.to_email,
            subject: params.subject,
            html: params.html
        }
        const mailStatus =  transporter.sendMail(mailOptions);
        return mailStatus
    }catch(error){
        return error.toString()
    }
}

const verifyEmailTemplate = (params) => {
    return `
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
        <p class="main-content"><b></b>Hello ${params.name},<br/>
            Your account is created.
            <br/>
            Please click on below button to verify your email and activate account
        </p>
        <button class="btn"> 
        <a class="link" href=${params.verify_email}>Verify Email</a>
        </button>
        <p>If you didn’t make this request, ignore this email.</p>
        </body>
        </html>
    `;
}

module.exports = {
    sendMail,
    verifyEmailTemplate
}