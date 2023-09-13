import express,{Request,Response,NextFunction, Router} from "express";
import { GetVendorProfile, VendorLogin, UpdateVendorProfile,UpdateVendorService, AddFood, GetFoods,UpdateVendorCoverImage,GetCurrentOrders,GetOrderDetails,ProcessOrder,GetOffers,AddOffer,EditOffer} from "../controllers/VendorController";
import { authenticate } from "../middlewares";
import multer from "multer";


const router=express.Router();

const imageStorage=multer.diskStorage({
    destination(req, file, callback) {
        callback(null,"images");
    },   
    filename(req, file, callback) {
        callback(null, new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname);
    },
})

const images = multer({storage:imageStorage}).array("images",10);

router.post("/login",VendorLogin);

router.use(authenticate);
router.get("/profile",GetVendorProfile);
router.patch("/profile",UpdateVendorProfile);
router.patch("/coverimage",images,UpdateVendorCoverImage);
router.patch("/service",UpdateVendorService);


//food routes
router.post("/food",images,AddFood);
router.get("/food",GetFoods);


//Orders
router.get("/orders",GetCurrentOrders);
router.post("/order/process/:id",ProcessOrder);
router.get("/order/:id",GetOrderDetails);




//offers
router.get("/offers",GetOffers);
router.post("/offer",AddOffer);
router.put("/offer/:id",EditOffer);

export {router as VendorRoutes};