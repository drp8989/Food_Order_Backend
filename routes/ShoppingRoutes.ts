import express,{ Request,Response,NextFunction } from "express";
import {GetFoodAvailability,GetTopResturants,GetFoodsIn30Min,SearchFoods,ResturantById,GetAvailableOffers} from "../controllers/ShoppingController";
const router= express.Router();

/**Food Availability */
router.get("/:pincode",GetFoodAvailability);
/** Top Resturants */
router.get("/top-resturants/:pincode",GetTopResturants);
/** Foods Available in 30min */
router.get("/food-in-30-min/:pincode",GetFoodsIn30Min);

/**Food Offer */
router.get("/offers/:pincode",GetAvailableOffers)

/** search Foods */
router.get("/search/:pincode",SearchFoods);
/** Find Resturant by Id */
router.get("/resturant/:id",ResturantById);

export {router as ShoppingRoutes};
