

const express = require("express"); // external module

const authController = require("../controllers/authController");
const authRouter = express.Router();


authRouter.get("/login", authController.getLogin); 
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/signup", authController.getSignUp);
authRouter.post("/signup", authController.postSignUp);

module.exports = authRouter;

