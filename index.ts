// import express  from "express";
// import bodyParser from "body-parser";
// import { AdminRoutes } from "./routes";
// import { VendorRoutes } from "./routes";
// import mongoose,{ConnectOptions} from "mongoose";
// import { MONGO_URI } from "./config";
// import path from "path";

// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.json());
// //route for handling images static file
// app.use("/images",express.static(path.join(__dirname,"images")))
// //routes
// app.use("/admin",AdminRoutes);
// app.use("/vendor",VendorRoutes);

// //Database Connection
// mongoose.connect(MONGO_URI).then(result=>{
//   console.log("DB Connected");
// }).catch(err=>console.log("error"+err));

// app.listen(8000,()=>{
//     console.log("App is listening")
// })

import express from "express";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";


  const startServer=async () => {
    const app=express();
    await dbConnection();
    await App(app);
    app.listen(8000,()=>{
    console.log("Listening");
  })
 
}


startServer();