import { Twilio } from "twilio";
export const GenrateOtp=()=>{
    const otp=Math.floor(10000 + Math.random() * 90000)
    let expiry= new Date();
    expiry.setTime(new Date().getTime()+(30*60*1000))
    return {otp,expiry};
}

export const onRequestOTP = async(otp:number,to:string)=>{
    const accountSid = "AC97ffb869decf58c751f0ad86e3f0827f";
    const authToken = "b660bd10ce0943b3edc876235d1be260";
    const client = new Twilio(accountSid, authToken);
    const response=await client.messages.create({
        body:`Your otp is ${otp}`,
        from:'+18149925452',
        to:`+91${to}`,
    })
    return response;
}