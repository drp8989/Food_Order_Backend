import mongoose,{Schema,Document,Model} from "mongoose";

export interface OrderDoc extends Document{
    orderId:string,
    verndorId:string,
    items:[any],
    totalAmount:number,
    orderDate:Date,
    paidThrough:string,
    paymentResponse:string,
    orderStatus:String,
    remarks:String,
    deliveryId:string,
    appliedOffers:boolean,
    offerId:string,
    readyTime:number,
}

const OrderSchema =new Schema({
    orderId:{type:String,required:true},
    vendorId:{type:String,required:true},
    items:[
        {
            food:{type:Schema.Types.ObjectId,ref:"food",required:true},
            units:{type:Number,required:true}
        }
    ],
    totalAmount:{type:Number,required:true},
    orderDate:{type:Date},
    paidThrough:{type:String},
    paymentResponse:{type:String},
    orderStatus:{type:String},
    remarks:{type:String},
    deliveryId:{type:String},
    appliedOffers:{type:Boolean},
    offerId:{type:String},
    readyTime:{type:Number},
    
},{
    //trasnforming data
    timestamps:true,
    toJSON:{
        transform(doc,ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }   
    }
});


const Order=mongoose.model<OrderDoc>("order",OrderSchema);

export {Order}