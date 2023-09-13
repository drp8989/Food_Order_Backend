import {validate} from "class-validator";
import express,{Request,Response,NextFunction} from "express";

import { plainToClass } from "class-transformer";
import { CartItem, CreateCustomerInputs, EditCustomerProfileInputs, OrderInputs, UserLoginInput } from "../dto/Customer.dto";
import { GenratePassword, GenrateSalt, GenrateSignature, ValidatePassword } from "../utility";
import { Customer } from "../models/Customer";
import { GenrateOtp, onRequestOTP } from "../utility/NotificationUtility";
import { Food } from "../models";
import { Order } from "../models/Order";
import { FindVendor } from "./AdminController";
import { Offer } from "../models/Offer";
import { Transaction } from "../models/Transaction";
import { DeliveryUser } from "../models/DeliverUser";

export const CustomerSignup=async(req:Request,res:Response,next:NextFunction)=>{

    const customerInputs=plainToClass(CreateCustomerInputs,req.body);
    const inputErrors=await validate(customerInputs,{validationError:{target:true}});
    if(inputErrors.length>0){
        return res.status(400).json(inputErrors);
    }
    const {email,phone,password}=customerInputs;
    const salt=await GenrateSalt()
    const userPassword=await GenratePassword(password,salt);

    const {otp,expiry}=GenrateOtp();
    
    const existingCustomer=await Customer.findOne({email:email});
    if(existingCustomer !== null){
        return res.status(409).json({message:"An user exists with the email"})
    }

    const result= await Customer.create({
        email:email,
        password:userPassword,
        salt:salt,
        phone:phone,
        otp:otp,
        otp_expiry:expiry,
        firstName:"",
        lastName:"",
        address:"",
        verified:false,
        lat:0,
        lng:0,
        orders:[]
    })
    if(result){
        // send otp to customer
       await onRequestOTP(otp,phone)
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

export const CustomerLogin=async(req:Request,res:Response,next:NextFunction)=>{
    const loginInputs=plainToClass(UserLoginInput,req.body);
    const loginErrors=await validate(loginInputs,{validationError:{target:false}})
    if(loginErrors.length>0){
        return res.status(400).json(loginErrors);
    }
    const {email,password}=loginInputs;
    const customer=await Customer.findOne({email:email});
    if(customer){
        const validation= await ValidatePassword(password,customer.password,customer.salt);
        if(validation){
            //genrate the signature
            const signature=await GenrateSignature({
                _id:customer._id,
                email:customer.email,
                verified:customer.verified,
            })
            //send the result to the client
            return res.status(201).json({
                signature:signature,
                verified:customer.verified,
                email:customer.email})
            }
    
    }
    return res.status(404).json({message:"Login Error"});


}

export const CustomerVerify=async(req:Request,res:Response,next:NextFunction)=>{

    const {otp} = req.body;
    const customer = req.user;

    if(customer){
        const profile=await Customer.findById(customer._id);
        if(profile){
            if(profile.otp===parseInt(otp)&&profile.otp_expiry>=new Date()){
                profile.verified=true;
                const updatedCustomerResponse = await profile.save();
                const signature= await GenrateSignature({
                    _id:updatedCustomerResponse._id,
                    email:updatedCustomerResponse.email,
                    verified:updatedCustomerResponse.verified
                });
                return res.status(201).json({
                    signature:signature,
                    verified:updatedCustomerResponse.verified,
                    email:updatedCustomerResponse.email,
                })


            }
        }
    }
    return res.status(400).json({message:"Error with OTP validation"});

}

export const RequestOTP=async(req:Request,res:Response,next:NextFunction)=>{
    
    const customer=req.user;
    if(customer){
        const profile=await Customer.findById(customer._id);
        if(profile){
            const {otp,expiry}=GenrateOtp();

            profile.otp=otp;
            profile.otp_expiry=expiry;

            await profile.save();
            await onRequestOTP(otp,profile.phone);
            res.status(200).json({message:"OTP SENT TO your registered number"});
        }
    }
    return res.status(400).json({message:"Error with request OTP"});
}

export const GetCustomerProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const customer=req.user;
    if(customer){
        const profile=await Customer.findById(customer._id);
        if(profile){
            res.status(200).json(profile)
        }
    }
    return res.status(400).json({message:"Error with request "});
}

export const EditCustomerProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const customer=req.user;
    const profileInputs=plainToClass(EditCustomerProfileInputs,req.body)
    const profileErrors=await validate(profileInputs,{validationError:{target:false}})
    if(profileErrors.length>0){
        return res.status(400).json(profileErrors);
    }
    const {firstname,lastname,address}=profileInputs;

    if(customer){
        const profile=await Customer.findById(customer._id);
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

export const verifyOffer=async (req: Request,res:Response,next:NextFunction) => {
    const offerId=req.params.id;
    const user=req.user
    if(user){
        const offer=await Offer.findById(offerId);
        if(offer){
            if(offer.promoType==="USER"){
                //Only can apply once
            }else{
                if(offer.isActive){
                    return res.status(200).json({message:"Offer is valid",offer:offer})
                }
            }
        }
    }
    return res.status(400).json({message:"Offer is not valid"});
}



export const CreatePayment=async (req:Request,res:Response,next:NextFunction) => {
    const customer=req.user;
    const {amount,paymentMode,offerId}=req.body;
    let payableAmount=Number(amount)
    if(offerId){
        const appliedOffer=await Offer.findById(offerId);
        if(appliedOffer){
            if(appliedOffer.isActive){
                payableAmount=(payableAmount-appliedOffer.offerAmount);
            }
        }
    }
    //Perform Payment gateway api call

    //right after payment success/failure response

    //create record on Transaction
    if(customer){
        const transaction = await Transaction.create({
            customer:customer._id,
            vendorId:'',
            orderId:'',
            orderValue:payableAmount,
            offerUsed:offerId || "NA",
            status:"OPEN",
            paymentMode:paymentMode,
            paymentResponse:"Payment is Cash on Delivery",
        })
        return res.status(200).json(transaction)
    }
        
}  
/** Delivery Notification*/

const assignOrderForDelivery=async (orderId:string,vendorId:string) => {
        //Find the vendor
        const vendor = await FindVendor(vendorId)
        // console.log(vendor)
        // console.log(orderId)
        let areaCode=String();
        if(vendor){
            areaCode=vendor.pincode;
            const vendorLat=vendor.lat;
            const vendorLng=vendor.lng;

        }
        //error here
        const deliveryperson=await DeliveryUser.find({pincode:areaCode})
        //Find the available delivery person
        // console.log(deliveryperson)
        if(deliveryperson){
            //check the nearest delivery person and assign the order
            // console.log(deliveryperson)
            const currentOrder = await Order.findById(orderId);
            if(currentOrder){
                //update delivery ID
                currentOrder.deliveryId=deliveryperson[0]._id;
                await currentOrder.save()
            }
        }
        
}

/**Validate Transaction */
const validateTransaction=async (txnId:string) => {
    const currentTransaction=await Transaction.findById(txnId);
    if(currentTransaction){
        if(currentTransaction.status.toLocaleLowerCase()!=="failed"){
            return{status:true,currentTransaction};
        }
    }
    return {status:false,currentTransaction};
}

export const CreateOrder =async (req:Request,res:Response,next:NextFunction) => {
    //grab current login customer
    const customer=req.user;

    const{txnId,amount,items}=<OrderInputs>req.body
    if(customer){

        //validate transaction 
        const {status,currentTransaction}=await validateTransaction(txnId);
        if(!status){
            return res.status(404).json({message:"Error with Create Order"});
        }

        //create an order ID
        const orderId=`${Math.floor(Math.random() * 89999)+ 1000}`;
        const profile= await Customer.findById(customer._id);
        
        //Grab order items from request 
        let cartItems=Array();
        let netAmount=0.0;
        let vendorid=String();
        const foods=await Food.find().where('_id').in(items.map(item=>item._id)).exec();

        //Calculate order amount
        foods.map(food=>{
            items.map(({_id,units})=>{
                if(food._id==_id){
                    vendorid = food.vendorId
                    netAmount+=(food.price*units);
                    cartItems.push({food,units})
                }
            })
        })
        
        if(cartItems){
            const currentOrder=await Order.create({
                orderId:orderId,
                vendorId:vendorid,
                items:cartItems,
                totalAmount:netAmount,
                orderDate:new Date(),
                paidThrough:"COD",
                paymentResponse:"",
                orderStatus:"waiting",
                remarks:"",
                deliveryId:"",
                appliedOffer:false,
                offerId:null,
                readyTime:45,
            })
            if(profile){
                profile.cart=[] as any
                await profile.orders.push(currentOrder);
                if(currentTransaction){
                    currentTransaction.vendorId=vendorid
                    currentTransaction.orderId=orderId
                    currentTransaction.status="CONFIRMED"
                    await currentTransaction.save()
                }

                await assignOrderForDelivery(currentOrder._id,vendorid)
                const profileResponse=await profile.save();
                return res.status(200).json(profileResponse);
            }
           


        }

    }else{
        return res.status(400).json({message:"Error with create order"})
    }
   

}

export const GetOrder= async (req:Request,res:Response,next:NextFunction) => {
    const customer=req.user;
    if(customer){
        const profile=await Customer.findById(customer._id).populate("orders");
        if(profile){
            return res.status(200).json(profile.orders);
        }
    }
    
}

export const GetOrderById=async (req:Request,res:Response,next:NextFunction) => {
    const orderId=req.params.id;
    if(orderId){
        const order=await Order.findById(orderId).populate("items.food");
        res.status(200).json(order);
    }
    
}

export const addToCart=async (req:Request,res:Response,next:NextFunction) => {
        const customer=req.user
        if(customer){
            const profile=await Customer.findById(customer._id).populate('cart.food')
            let cartItems=Array();
            const {_id,units}=<CartItem>req.body;
            const food=await Food.findById(_id);
            if(food){
                if(profile!==null){
                    cartItems=profile.cart;
                    if(cartItems.length>0){
                        let existFoodItem=cartItems.filter((item) => item.food._id.toString()===_id)
                        if(existFoodItem.length > 0 ){
                            const index=cartItems.indexOf(existFoodItem[0]);
                            if(units>0){
                                cartItems[index]={food,units};
                            }else{
                                cartItems.splice(index,1)
                            }
                        }else{
                            cartItems.push({food,units})
                        }                         
                    }else{
                        cartItems.push({food,units})
                    }
                    if(cartItems){
                        profile.cart=cartItems as any;
                        const cartResult=await profile.save();
                        return res.status(200).json(cartResult.cart);
                    }
                }
            }

        }
        return res.status(404).json({msg:'Unable to add to cart'});
}


export const GetCart =async (req:Request,res:Response,next:NextFunction) => {
    const user=req.user;
    if(user){
        const profile=await Customer.findById(user._id);
        if(profile!=null){
            return res.status(200).json(profile.cart)
        }
    }
    return res.status(400).json({message:'cart is empty'});
}

export const DeleteCart=async (req:Request,res:Response,next:NextFunction) => {
    const customer=req.user;
    if(customer){
        const profile=await Customer.findById(customer._id).populate("cart.food");
        if(profile!==null){
            profile.cart = [] as any;
            const cartResult=await profile.save();
            return res.status(200).json(profile.cart);

        }
    }
    return res.status(400).json({message:"Cart is already Empty"});    

}





