import {IsEmail,IsEmpty,Length, length} from "class-validator";

export class CreateCustomerInputs{
    
    @IsEmail()
    email:string;

    @Length(7,12)
    phone:string;

    @Length(6,12)
    password:string ;   

}
export class UserLoginInput{
    
    @IsEmail()
    email:string;

    @Length(6,12)
    password:string ;   

}
export class EditCustomerProfileInputs{
    @Length(3,16)
    firstname:string;

    @Length(3,16)
    lastname:string;

    @Length(6,16)
    address:string;

}
export class CartItem{
    _id:string
    units:number
}

export class OrderInputs{
    txnId:string
    amount:string
    items:[CartItem]
}
export class DeliveryUserInput {
    
    @IsEmail()
    email: string;

    @Length(7,12)
    phone: string;

    @Length(6,12)
    password: string;

    @Length(3,12)
    firstName: string;

    @Length(3,12)
    lastName: string;

    @Length(6,24)
    address: string;

    @Length(4,12)
    pincode: string;
}
export interface CustomerPayload{
    _id:string;
    email:string,
    verified:boolean, 
}
