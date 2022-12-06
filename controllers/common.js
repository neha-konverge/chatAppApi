const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")
const sendMail = (params) => {
    // const transporter = nodemailer.createTransport({
    //                     service: 'gmail',
    //                     host:'smtp.gmail.com',
    //                     port : 587,
    //                     auth: {
    //                         user: 'sawarkar.ns27@gmail.com',
    //                         pass: 'nehasawarkar@1996',
    //                     }
    //                 });
    
    // const mailOptions = {
    //     from: 'sawarkar.ns27@gmail.com',
    //     to: 'neha.sawarkar@konverge.ai',
    //     subject: 'reset password',
    //     html: `<p>dsjsdgdhjdsjdsjkksdjkdjs</p>`
    // };
    // let mail = await transporter.sendMail(mailOptions);
   
    // const salt =  bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword =  bcrypt.hash(params.email.toString(), 10);
    // bcrypt.compare(params.email,hashPassword).then((res)=>console.log(hashPassword,res))
    console.log({status:1,resetPassLink:'https://personal-h1klr039.outsystemscloud.com/KonChat/resetPassword?check='+params.id+'&hash='+hashPassword})
    return {status:1,message:"",resetPassLink:'https://personal-h1klr039.outsystemscloud.com/KonChat/resetPassword?check='+params.id+'&hash='+hashPassword}
    
}

module.exports = {
    sendMail
}