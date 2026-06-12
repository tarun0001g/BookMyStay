

const express = require("express");// external module
const adminRouter = express.Router(); 
const adminController = require("../controllers/adminController.js");


adminRouter.get("/add-home",adminController.getAddHome);

adminRouter.post("/add-home",adminController.postAddHome);

adminRouter.get("/admin-home-list",adminController.getAdminHomes);

adminRouter.get("/edit-home/:homeId", adminController.getEditHome);

adminRouter.post("/edit-home", adminController.postEditHome);

adminRouter.post("/delete-home/:homeId", adminController.postDeleteHome);

exports.adminRouter = adminRouter;

