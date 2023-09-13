import { Request,Response,NextFunction } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { ValidateSignature } from "../utility";

declare global{
    namespace Express{
        interface Request{
            user?:AuthPayload
        }
    }
}

export const authenticate=async (req:Request,res:Response,next:NextFunction) => {
    const validate=await ValidateSignature(req);
    if(validate){
        return next()
    }else{
        return res.json({message:"user not authorized"});
    }
}