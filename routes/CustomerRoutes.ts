import express,{ Request,Response,NextFunction } from "express";
import { CustomerSignup,CustomerLogin,RequestOTP,GetCustomerProfile,EditCustomerProfile,CustomerVerify,CreateOrder,GetOrder, GetOrderById,addToCart,GetCart,DeleteCart,verifyOffer, CreatePayment} from "../controllers/CustomerController";
import { authenticate } from "../middlewares";

const router=express.Router();

/** SignUp/Create Customer */
router.post("/signup",CustomerSignup);

/**Login */
router.post("/login",CustomerLogin);

/**Authenctication */
router.use(authenticate)


/** Verify Customer Account */
router.patch("/verify",CustomerVerify);
/** OTP */
router.get("/otp",RequestOTP);

router.get("/profile",GetCustomerProfile);

router.patch("/profile",EditCustomerProfile);

//Cart
router.post("/cart",addToCart);
router.get("/cart",GetCart);
router.delete("/cart",DeleteCart)

//verify offers
router.get("/verify/offer/:id",verifyOffer)

//Payment
router.post("/create-payment",CreatePayment)

//Order

router.post("/create-order",CreateOrder);
router.get("/orders",GetOrder);
router.get("/order/:id",GetOrderById);




export {router as CustomerRoutes};