import express, { Application }  from "express";
import bodyParser from "body-parser";
import path from "path";
import { AdminRoutes, DeliveryRoutes } from "../routes";
import { VendorRoutes } from "../routes";
import {ShoppingRoutes} from "../routes";
import {CustomerRoutes} from "../routes";

export default async(app:Application)=>{ 
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.json());

    // const imagePath=path.join(__dirname,"../images");
    //route for handling images static file
    app.use("/images",express.static(path.join(__dirname,"images")))
    //routes
    app.use("/admin",AdminRoutes);
    app.use("/vendor",VendorRoutes);
    app.use("/shopping",ShoppingRoutes);
    app.use("/customer",CustomerRoutes);
    app.use("/delivery",DeliveryRoutes);

}
//Database Connection