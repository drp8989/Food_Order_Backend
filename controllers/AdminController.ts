import { Request,Response,NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Vendor } from "../models";
import { GenratePassword,GenrateSalt } from "../utility";


export const FindVendor=async(id:string |undefined , email?:string)=>{
    if(email){
        return await Vendor.findOne({email:email})
    }else{
        return await Vendor.findById(id);
    }
}

export const CreateVendor = async (req:Request,res:Response,next:NextFunction)=>{
    const {name,address,pincode,foodType,email,password,ownerName,phone,lat,lng}=<CreateVendorInput>req.body;
    
    const existinVendor=await FindVendor("",email);
    if(existinVendor!== null){
        return res.json({message:"A vendor exists with email id"})
    }

    //genrate salt
    const salt=await GenrateSalt()
    //excrypt password using salt
    const userPassword=await GenratePassword(password,salt);

    const createVendor= await Vendor.create({
        name:name,
        address:address,
        pincode:pincode,
        foodType:foodType,
        email:email,
        password:userPassword,
        salt:salt,
        ownerName:ownerName,
        phone:phone,
        rating:0,
        serviceAvailable:false,
        coverImages:[],
        foods:[],
        lat:lat,
        lng:lng
    })
    //destructuring
    // const{password:pass,salt:sa,...otherDetails}=createVendor;
    return res.json(createVendor);
}

export const GetVendors = async (req:Request,res:Response,next:NextFunction)=>{

    const vendors=await Vendor.find();
    if(vendors!== null){
        return res.json(vendors);
    }
    return res.json({"message":"Vendor's data not available"});
}

export const GetVendorByID = async (req:Request,res:Response,next:NextFunction)=>{
    const vendorId=req.params.id;
    const vendor=await FindVendor(vendorId);
    if(vendor!== null){
        return res.json(vendor);
    }    
    return res.json({"message":"vendors data not available"});
}

export const verifyDeliveryUser=async (req:Request,res:Response,next:NextFunction) => {
    const {_id,status}=req.body;
    if(_id){
        const profile=await DeliveryUser.findById(_id);
        if(profile){
            profile.verified=status;
            const result=await profile.save();
            return res.status(200).json(result);
        }
    }
    return res.json({message:"Unable to verify Delivery User"});
}

export const getDeliveryUsers=async (req:Request,res:Response,next:NextFunction) => {
    const deliveryUsers = await DeliveryUser.find();

    if(deliveryUsers){
        return res.status(200).json(deliveryUsers);
    }
    
    return res.json({ message: 'Unable to get Delivery Users'});
}