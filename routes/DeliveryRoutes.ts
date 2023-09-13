import express,{ Request,Response,NextFunction } from "express";

import { DeliveryLogin, DeliverySignup, EditDeliveryProfile, GetDeliveryProfile, UpdateDeliveryUserStatus } from "../controllers/DeliveryController";

import { authenticate } from "../middlewares";

const router=express.Router();

/** SignUp/Create Customer */
router.post("/signup",DeliverySignup);

/**Login */
router.post("/login",DeliveryLogin);

/**Authenctication */
router.use(authenticate)

router.get("/profile",GetDeliveryProfile)
router.patch("/profile",EditDeliveryProfile)

router.patch("/change-status",UpdateDeliveryUserStatus)




export {router as DeliveryRoutes};