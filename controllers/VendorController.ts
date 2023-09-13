import { Request,Response,NextFunction } from "express";
import { CreateVendorInput, EditVendor,CustomerOfferInput } from "../dto";
import { FindVendor } from "./AdminController";
import { GenrateSignature, ValidatePassword } from "../utility";
import { CreateFoodInputs} from "../dto/Food.dto";
import { Food, Vendor } from "../models";
import multer from "multer";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";

export const VendorLogin=async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password}=<CreateVendorInput>req.body;
    const existingVendor=await FindVendor("",email);
    if(existingVendor!==null){

        //validation and give access
        const validation=await ValidatePassword(password,existingVendor.password,existingVendor.salt);
        if(validation){
            const signature=await GenrateSignature({
                _id:existingVendor.id,
                email:existingVendor.email,
                foodTypes:existingVendor.foodType,
                name:existingVendor.name,
            });
            return res.json({signature:signature});
        }else{
            return res.json({"message":"Password is not valid"});
        }

    }
    return res.json({"message":"Login credential not valid"});
}

export const GetVendorProfile =async (req:Request,res:Response,next:NextFunction) => {
    const user =req.user;
    if(user){
        const existingVendor=await FindVendor(user._id);
        return res.json(existingVendor)
    }    
    return res.json({'message':"vendor information not found"});
}

export const UpdateVendorProfile=async (req:Request,res:Response,next:NextFunction) => {
    const{name,address,phone,foodTypes}=<EditVendor>req.body;
    const user=req.user;
    if(user){
        const existingVendor=await FindVendor(user._id)
       
        if(existingVendor!== null){
            existingVendor.name=name;
            existingVendor.address=address;
            existingVendor.phone=phone;
            existingVendor.foodType=foodTypes;
            const savedVendor=await existingVendor.save()
            return res.json(savedVendor);
        }
    }
    return res.json({"message":"Vendor inforamtion not found"});
}

export const UpdateVendorService=async (req:Request,res:Response,next:NextFunction) => {
     
    const user=req.user;
    // const {lat,lng}=req.body;

    if(user){
        const existingVendor=await FindVendor(user._id)
       
        if(existingVendor!== null){
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            // if(lat && lng){
            //     existingVendor.lat=lat;
            //     existingVendor.lng=lng;
            // }
            const savedResult=await existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({"message":"Vendor inforamtion not found"});

}

export const AddFood= async (req:Request,res:Response,next:NextFunction) => {
    const user=req.user;
    if(user){
        const {name,description,category,foodType,readyTime,price}=<CreateFoodInputs>req.body;
        const vendor=await FindVendor(user._id)
        if(vendor !== null){

            const files= req.files as [Express.Multer.File]
            const images=files.map((file:Express.Multer.File)=>file.filename);

            const createdFood=await Food.create({
                vendorId:vendor._id,
                name:name,
                description:description,
                category:category,
                foodType:foodType,
                readyTime:readyTime,
                price:price,
                rating:0,
                images:images
            })
            vendor.foods.push(createdFood);
            const result=await vendor.save();
            return res.json(result);
        }



    }    
    return res.json({"message":"Somethis went wrong"});
}

export const GetFoods=async(req:Request,res:Response,next:NextFunction)=>{
    const user=req.user;
    if(user){
        const foods=await Food.find({vendorId:user._id});

        if(foods!==null){
            return res.json(foods)
        }
    }
    return res.json({"message":"Food information not found"});

}

export const UpdateVendorCoverImage =async (req:Request,res:Response,next:NextFunction) => {
    const user=req.user;
    if(user){
        const vendor=await FindVendor(user._id)

        if(vendor!==null){
            const files=req.files as [Express.Multer.File]
            console.log(files,"llll")
            const images=files.map((file:Express.Multer.File)=>file.filename);
            vendor.coverImages.push(...images);
            const result = await vendor.save();
            return res.json(result);
        }
    }
    return res.json({"message":"Something went wrong with add food"});    
}

export const GetCurrentOrders=async(req:Request,res:Response,next:NextFunction)=>{
    const user = req.user;
    
    if(user){

        const orders = await Order.find({ vendorId:user._id}).populate('items.food');

        if(orders != null){
            return res.status(200).json(orders);
        }
    }

    return res.json({ message: 'Orders Not found'});

}
export const GetOrderDetails=async(req:Request,res:Response,next:NextFunction)=>{
        
        const orderId=req.params.id;
        console.log(orderId)
        const order= await Order.findById(orderId).populate('items.food');
        if(order != null){
            return res.status(200).json(order);
        }
        return res.status(400).json({"message":"Order Details not found"});
    

}
export const ProcessOrder=async(req:Request,res:Response,next:NextFunction)=>{
    const orderId=req.params.id;
    const{status,remark,time}=req.body;
    if(orderId){
        const order=await Order.findById(orderId).populate('items.food');
        if(order){
            order.orderStatus=status;
            order.remarks = remark;
            if(time){
                order.readyTime=time;
            }
            const orderResult=await order.save()
            if(orderResult!==null){
                return res.status(200).json(orderResult);
            }
        }


    }
    return res.status(400).json({"message":"Unable to process order"});

    
}

export const GetOffers= async (req:Request,res:Response,next:NextFunction) => {
    const user=req.user;
    if(user){
        const offers=await Offer.find().populate('vendors');
        console.log(offers)
        if(offers){
            let currentOffers=Array();
            offers.map(item=>{
                if(item.vendors){
                    item.vendors.map(item=>{
                        if(item._id==user._id){
                            currentOffers.push(item);
                        }
                    })
                }
                if(item.offerType==="GENRIC"){
                    currentOffers.push(item);
                }
            })
            return res.json({offers:currentOffers})
        }

    }
    return res.json({"message":"Offers not available"});
}

export const AddOffer= async (req:Request,res:Response,next:NextFunction) => {
    const user=req.user;
    if(user){
        const {title,description,offerType,minValue,offerAmount,startValidity,promocode,promoType,bank,bins,pincode,isActive}=<CustomerOfferInput>req.body
        const vendor=await FindVendor(user._id);
        if(vendor){
            const offer=Offer.create({
                title,
                description,
                offerType,
                minValue,
                offerAmount,
                pincode,
                promocode,
                promoType,
                startValidity,
                bank,
                bins,
                isActive,
                vendors:[vendor],
            })
            return res.status(200).json({"message":"Offer added succesfully"});
        }
    }
}

export const EditOffer= async (req:Request,res:Response,next:NextFunction) => {
    const user=req.user;
    const offerId=req.params.id;

    if(user){
        const {title,description,minValue,offerType,offerAmount,startValidity,endValidity,promocode,promoType,bank,bins,pincode,isActive}=<CustomerOfferInput>req.body  
        const currentOffer=await Offer.findById(offerId)
        if(currentOffer){

            const vendor=await FindVendor(user._id)
            if(vendor){
                currentOffer.title=title,
                currentOffer.description=description,
                currentOffer.title=title,
                currentOffer.minValue=minValue,
                currentOffer.offerAmount=offerAmount,
                currentOffer.startValidity=startValidity,
                currentOffer.endValidity=endValidity,
                currentOffer.promocode=promocode,
                currentOffer.promoType=promoType,
                currentOffer.bank=bank,
                currentOffer.bins=bins,
                currentOffer.pincode=pincode,
                currentOffer.isActive=isActive
                

                const result=await currentOffer.save()
                return res.json(result);

            }
        }
    }


}


