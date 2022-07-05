const userModel = require("./user.service");
const { genSaltSync, hashSync, compareSync} = require('bcrypt');
const { sign } = require("jsonwebtoken");
var nodemailer = require('nodemailer');
const Email = require("../../config/email.json");


const createUser = async (req, res) => {
    const body = req.body;      
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    body.otp =  Math.random().toString().substr(2, 6);   

    to = body.email
    subject = "Email Verification"
    emailbody = "Your email verification code is "+body.otp
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: Email.emailId,
          pass: Email.password
        }
      });
      
      var mailOptions = {
        from: 'SocialMedia<'+Email.emailId+'>',
        to: body.email,
        subject:subject,
        text:emailbody
      };  



      if(await userModel.find({email:body.email}).count() > 0){
        return res.status(200).json({
            success: 0,
            msg: "Email id already taken"
        }) 
      }


    try{
    
        var userDetails = new userModel({
            firstName: body.firstName,
            lastName: body.lastName,
            userCode: body.otp,
            email: body.email,            
            image: body.image,
            password: body.password,
            verified: body.verified,
            otp: body.otp
          });
        const user = await userDetails .save();

          transporter.sendMail(mailOptions, function(error, info){
            return res.status(200).json({
                success: 1,
                data: user
            }) 
         });  
 

        
    }
    catch (error) {
        console.log(error);
        return false;
        let errors = {};

        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
          });
    
          return res.status(400).send(errors);
    }
}


const getUser = async (req, res) => {    
    try{
        const data = await userModel.find({});        
        return res.status(200).json({
            success: 1,
            data: data
        })
    }
    catch(error){
        return res.status(400).send(error);
    }  
}

const updateUser = async(req, res) => {
    const body = req.body;
   if(body.password){
    	const salt = genSaltSync(10);
    	body.password = hashSync(body.password, salt);
    }

     
    try{
        const user = await userModel.updateOne({_id: req.params.id}, {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,            
            image: body.image,
            password: body.password,
            verified: body.verified,
            otp: body.otp
         })
        if(user.modifiedCount == 1){
            return res.status(200).json({
                success: 1,
                msg: "Updated successfull"
            })
        }else{
            return res.status(200).json({
                success: 0,
                msg: "Updated error"
            })
        }
    }
    catch(errors){
        return res.status(400).send(errors)
    }
}

const getUserById = async (req, res) => {
    try{
        const user = await userModel.findOne({_id:req.params.id})
        return res.status(200).json({
            success: 1,
            data: user
        })
    }
    catch(errors){
        return res.status(400).send(errors);
    }
}

const forgotPassword =  async (req, res) => {

    const body = req.body;

    const checkuser = await userModel.find({email: body.email}).count();
    if(checkuser){

        body.otp =  Math.random().toString().substr(2, 6); 
        to = body.email
        subject = "Reset password"
        emailbody = "Your reset password otp is "+body.otp
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: Email.emailId,
              pass: Email.password
            }
          });
          
        var mailOptions = {
            from: 'SocialMedia<'+Email.emailId+'>',
            to: body.email,
            subject:subject,
            text:emailbody
        };  

        const userupdate = await userModel.updateOne({email: body.email}, {
            otp: body.otp
        });

        transporter.sendMail(mailOptions, function(error, info){
            return res.status(200).json({
                success: 1,
                message: "OTP sent to registered email id!"
            }) 
        }); 

    }else{
        return res.status(200).json({
            success: 0,
            message: "Email id does not match"
        }) 
    }
}

const resetPassword = async (req, res) => {
    const body = req.body;

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    const otpver = await userModel.find({email: body.email, otp: body.otp}).count();
    if(otpver){

        const p = await userModel.updateOne({email: body.email, otp: body.otp}, {password: body.password});

        if(p.modifiedCount == 1){
            return res.status(200).json({
                success: 1,
                message: "Password changed successfully"
            }) 
        }else{
            return res.status(200).json({
                success: 0,
                message: "Error!! Please try again"
            }) 
        }

    }else{
        return res.status(200).json({
            success: 0,
            message: "Invaid otp. Please resend."
        }) 
    }
}



const sendOtp =  async (req, res) => {

    const body = req.body;
    const user = await userModel.findOne({email: body.email});
    if(user){
        body.otp =  Math.random().toString().substr(2, 6); 
        to = body.email
        subject = "Email Verification"
        emailbody = "Your email verification code is "+body.otp
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: Email.emailId,
              pass: Email.password
            }
          });
          
        var mailOptions = {
            from: 'SocialMedia<'+Email.emailId+'>',
            to: body.email,
            subject:subject,
            text:emailbody
        };  

        const userupdate = await userModel.updateOne({email: body.email}, {
            otp: body.otp
        });

        transporter.sendMail(mailOptions, function(error, info){
            return res.status(200).json({
                success: 1,
                message: "OTP sent to registered email id"
            }) 
        });  


    }else{
        return res.status(200).json({
            success: 0,
            message: "Email id doest not match!"
        }) 
    }

}

const otpVerification = async (req, res) => {
    const body = req.body;
    const user = await userModel.findOne({email: body.email, otp: body.otp})
    if(user){

    const updateuser = await userModel.updateOne({email: body.email}, {
	    verified: "1"
    });
        return res.status(200).json({
            success: 1,
            message: "OTP verified!"
        })
    
    }else{
        return res.status(200).json({
            success: 0,
            message: "OTP doest not match!"
        })
    }
}

const userLogin = async (req, res) => {
    const body = req.body;  
    const user = await userModel.findOne({email: body.email});
    if(user){
        const encryresult = compareSync(body.password, user.password);
        if(encryresult === true){
            const jsontoken = sign({result: user}, 'SocialMedia', {
                expiresIn: "1h"
            });
            return res.status(200).json({
                success: 1,
                data: { email: user.email, _id: user._id },
                token_code: jsontoken 
            })
        }else{
            return res.status(200).json({
                success: 0,
                message: "Password doest not match!"
            })
        }       
    }else{
        return res.status(200).json({
            success: 0,
            message: "Email id doest not match!"
        })
    }
}

module.exports = {
    createUser: createUser,
    getUser: getUser,
    updateUser: updateUser,
    getUserById: getUserById,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    otpVerification: otpVerification,
    sendOtp: sendOtp,
    userLogin: userLogin
}
