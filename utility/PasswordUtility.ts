import bcrypt from "bcrypt";
import  Jwt  from "jsonwebtoken";
import { VendorPayLoad } from "../dto";
import { APP_SECRET } from "../config";
import { AuthPayload } from "../dto/Auth.dto";
import { Request } from "express";

export const GenrateSalt=async()=>{
    return await bcrypt.genSalt();
}
export const GenratePassword=async(password:string,salt:string)=>{
    return await bcrypt.hash(password,salt);
}
export const ValidatePassword = async(enteredPassword:string,savedPassword:string,salt:string)=>{
    return await GenratePassword(enteredPassword,salt)===savedPassword;    
}

export const GenrateSignature=async (payload:AuthPayload) => {
    const signature=Jwt.sign(payload,APP_SECRET,{expiresIn:"1d"})        
    return signature;
}

export const ValidateSignature =async(req:Request)=>{
    const signature = req.get('Authorization');
    if (signature) {
        const token = signature.split(' ')[1]; // Split using space to separate "Bearer" from the token
        try {
            const payload = await Jwt.verify(token, APP_SECRET) as AuthPayload;
            req.user = payload;
            return true;
        } catch (error) {
        // Handle token verification error
            console.error('Token verification error:', error);
        }
    }
    return false;
}