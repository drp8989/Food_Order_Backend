export interface CreateVendorInput{
    name:string;
    ownerName:string;
    foodType:[string];
    pincode:string;
    address:string;
    phone:string;
    email:string;
    password:string;
    lat:number;
    lng:number   
}

export interface EditVendor{
    name:string;
    address:string;
    phone:string;
    foodTypes:[string];
}

export interface VendorLogin{
    email:string;
    password:string;
}
export interface VendorPayLoad{
    _id:string,
    email:string,
    name:string,
    foodTypes:[string],
}
export interface CustomerOfferInput{
    offerType: string;
    vendors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date;
    endValidity: Date;
    promocode: string;
    promoType: string;
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
}