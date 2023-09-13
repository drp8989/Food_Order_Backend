import mongoose,{Schema,Document,Model} from "mongoose";

interface VendorDoc extends Document{
    name:string;
    ownerName:string;
    foodType:[string];
    pincode:string;
    address:string;
    phone:string;
    email:string;
    password:string;
    salt:string,
    serviceAvailable:boolean,
    coverImages:[string],
    rating:number,
    foods:any,  
    lat:number,
    lng:number
}

const VendorSchema =new Schema({
    name:{type:String,required:true},
    ownerName:{type:String,required:true},
    foodType:{type:[String],required:true},
    pincode:{type:String,required:true},
    address:{type:String,required:true},
    phone:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    salt:{type:String,required:true},
    serviceAvailable:{type:Boolean,required:true},
    coverImages:{type:[String],required:true},
    rating:{type:Number},
    foods:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"food"
    }],
    lat:{type:Number},
    lng:{type:Number}
},{
    //trasnforming data
    timestamps:true,
    toJSON:{
        transform(doc,ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }   
    }
});


const Vendor=mongoose.model<VendorDoc>("vendor",VendorSchema);

export {Vendor}