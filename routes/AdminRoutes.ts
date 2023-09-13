import express,{Request,Response,NextFunction, Router} from "express";
import { CreateVendor,GetVendors,GetVendorByID,verifyDeliveryUser, getDeliveryUsers} from "../controllers";

const router=express.Router();

router.post("/createVendor",CreateVendor);
router.get("/vendor",GetVendors)
router.get("/vendor/:id",GetVendorByID);

//Delivery Routes
router.get("/deliveryusers",getDeliveryUsers)
router.patch("/verify",verifyDeliveryUser)

export {router as AdminRoutes};