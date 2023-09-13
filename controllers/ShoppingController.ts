import express,{ Request,Response,NextFunction } from "express";
import { FoodDoc, Vendor } from "../models";
import { Offer } from "../models/Offer";

export const GetFoodAvailability=async (req:Request,res:Response,next:NextFunction) => {
    const pincode=req.params.pincode;
    const result=await Vendor.find({pincode:pincode,serviceAvailable:true}).sort([["rating","descending"]]).populate("foods")
    if(result.length>0){
        return res.status(200).json(result);
    }
    return res.status(400).json({message:"Data not Found!"});

}
export const GetTopResturants=async (req:Request,res:Response,next:NextFunction) => {
    const pincode=req.params.pincode;
    const result=await Vendor.find({pincode:pincode,serviceAvailable:true}).sort([["rating","descending"]]).limit(1);

    if(result.length>0){
        return res.status(200).json(result);
    }
    return res.status(400).json({message:"Data not Found!"});
}
export const GetFoodsIn30Min=async (req:Request,res:Response,next:NextFunction) => {
    const pincode=req.params.pincode;
    const result=await Vendor.find({pincode:pincode,serviceAvailable:true}).sort([["rating","descending"]]).populate("foods")
    if(result.length>0){
        let foodResult:any=[];
        result.map(vendor=>{
            const foods=vendor.foods as [FoodDoc]
            foodResult.push(...foods.filter(food=>food.readyTime<=30));
        })
        return res.status(200).json(foodResult);
    }
    return res.status(400).json({message:"Data not Found!"});
}
export const SearchFoods=async (req:Request,res:Response,next:NextFunction) => {
    const pincode=req.params.pincode;
    const result=await Vendor.find({pincode:pincode,serviceAvailable:true}).sort([["rating","descending"]]).populate("foods")
    if(result.length>0){
        return res.status(200).json(result);
    }
    return res.status(400).json({message:"Data not Found!"});    
}
export const ResturantById=async (req:Request,res:Response,next:NextFunction) => {
    const id=req.params.id;
    console.log(id)
    const result=await Vendor.findById(id).populate("foods");

    if(result){
        return res.status(200).json(result);
    }
    return res.status(400).json({message:"Data not found"});

}


export const GetAvailableOffers=async (req:Request,res:Response,next:NextFunction) => {
    const pincode=req.params.pincode;

    const offers=await Offer.find({pincode:pincode,isActive:true});

    if(offers){
        return res.status(200).json(offers);
    }
    return res.status(400).json({"message":"Offers not found"});
    
}