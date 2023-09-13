import {validate} from "class-validator";
import express,{Request,Response,NextFunction} from "express";

import { plainToClass } from "class-transformer";
import { CartItem, CreateCustomerInputs, DeliveryUserInput, EditCustomerProfileInputs, OrderInputs, UserLoginInput } from "../dto/Customer.dto";
import { GenratePassword, GenrateSalt, GenrateSignature, ValidatePassword } from "../utility";

import { GenrateOtp, onRequestOTP } from "../utility/NotificationUtility";

import { DeliveryUser } from "../models/DeliverUser";
import { Customer } from "../models/Customer";

export const DeliverySignup=async(req:Request,res:Response,next:NextFunction)=>{

    const deliveryUserInputs=plainToClass(DeliveryUserInput,req.body);
    const inputErrors=await validate(deliveryUserInputs,{validationError:{target:true}});
    
    if(inputErrors.length>0){
        return res.status(400).json(inputErrors);
    }
    
    const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;
    
    const salt=await GenrateSalt()
    const userPassword=await GenratePassword(password,salt);

    const {otp,expiry}=GenrateOtp();
    
    const existingCustomer=await DeliveryUser.findOne({email:email});
    if(existingCustomer !== null){
        return res.status(409).json({message:"An Delivery User exists with the email"})
    }

    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        address: address,
        pincode: pincode,
        verified: false,
        lat: 0,
        lng: 0,
        
    })

    if(result){
         // send otp to customer
        //    await onRequestOTP(otp,phone)
        //genrate the signature
        const signature= await GenrateSignature({
            _id:result._id,
            email:result.email,
            verified:result.verified

        });

        //send the result to client
        return res.status(201).json({signature:signature,verified:result.verified,email:result.email});
    }
    return res.status(400).json({message:"Error with signup!"})

}

export const DeliveryLogin=async(req:Request,res:Response,next:NextFunction)=>{
    
    const loginInputs=plainToClass(UserLoginInput,req.body);
    const loginErrors=await validate(loginInputs,{validationError:{target:false}})
    if(loginErrors.length>0){
        return res.status(400).json(loginErrors);
    }
    const {email,password}=loginInputs;
    const deliveryUser=await DeliveryUser.findOne({email:email});
    if(deliveryUser){
        const validation= await ValidatePassword(password,deliveryUser.password,deliveryUser.salt);
        if(validation){
            //genrate the signature
            const signature=await GenrateSignature({
                _id:deliveryUser._id,
                email:deliveryUser.email,
                verified:deliveryUser.verified,
            })
            //send the result to the client
            return res.status(201).json({
                signature:signature,
                verified:deliveryUser.verified,
                email:deliveryUser.email})
            }
    
    }
    return res.status(404).json({message:"Login Error"});


}


export const GetDeliveryProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const deliveryUser=req.user;
    if(deliveryUser){
        const profile=await DeliveryUser.findById(deliveryUser._id);
        if(profile){
            res.status(200).json(profile)
        }
    }
    return res.status(400).json({message:"Error with request "});
}

export const EditDeliveryProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const deliveryUser=req.user;
    const profileInputs=plainToClass(EditCustomerProfileInputs,req.body)
    const profileErrors=await validate(profileInputs,{validationError:{target:false}})
    
    if(profileErrors.length>0){
        return res.status(400).json(profileErrors);
    }
    const {firstname,lastname,address}=profileInputs;

    if(deliveryUser){
        const profile=await DeliveryUser.findById(deliveryUser._id);
        if(profile){
            profile.firstName = firstname
            profile.lastName = lastname
            profile.address = address

            const result = await profile.save()

            res.status(200).json(profile)
        }
    }
    return res.status(400).json({message:"Error"});
}

export const UpdateDeliveryUserStatus =async (req:Request,res:Response,next:NextFunction) => {
    const deliveryUser= req.user;
    if(deliveryUser){
        const {lat,lng}=req.body;
        const profile=await DeliveryUser.findById(deliveryUser._id);
        if(profile){
            if(lat && lng){
                profile.lat=lat;
                profile.lng=lng;
            }
            profile.isAvailable =!profile.isAvailable;
            const result=await profile.save();
            return res.status(201).json(result);
        }
           
    }    
    return res.status(400).json({msg:"Error while updating Profile"});
}






