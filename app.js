//core module
const path = require('path');

require("dotenv").config();

//External Module
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session); //creating a session Store for session data in MongoDB Database.
const { default: mongoose } = require('mongoose');
const mongoUrl = process.env.MONGO_URL;


//Local/Internal Modules
const authRouter = require('./routes/authRouter.js');
const storeRouter = require("./routes/storeRouter.js"); //router imported 
const {adminRouter} = require("./routes/adminRouter.js"); //router imported as an object
const rootDir = require("./utility/fileHelperUtility.js");
const errorsController = require("./controllers/errors.js"); //we Imported as a specific value {} from object
const { error } = require('console');
const multer = require('multer');


const app = express();
app.set("view engine", "ejs"); // Tells Express: Use EJS files for frontend rendering”
app.set("views", path.join(__dirname, "views")); //Tells Express where EJS files are stored.

const store = new MongoStore({
  uri: mongoUrl,
  collection: "sessions"
})

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = '';
  for (let i=0; i<length; i++){//"Pick one random letter from a-z and add it to the result string."
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }//Math.floor removes decimal par of number, & then find char and put it in result string.
  return result;
}

const fileStoreOption = multer.diskStorage({ //{dest: 'uploads/'}
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); //define where to save the file
  },
  filename: (req, file, cb) => { //cb is callback fn 
    cb(null, randomString(9) + "-" + file.originalname);//defines what will be the name of file
  }
});

//Backend file type filter applied
const fileFilter = (req, file, cb) => {
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
    cb(null, true); //accept the file and save it
  }
  else{
    cb(null, false); // reject the file & don't save it
  }
}

// const multerOptions = {
//       storage: fileStoreOption;
//       fileFilter: fileFilter,
// }

app.use(multer({storage: fileStoreOption, fileFilter: fileFilter}).single('photo')); // a middleware used for saving file with given name & destination
//Above line tells: Accept only ONE uploaded file with input named "photo" and save it using fileStoreOption.

app.use(express.urlencoded()); //Converts form data into: req.body object
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/admin/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/homes/uploads', express.static(path.join(rootDir, 'uploads')));


app.use(session({ //This is storing session data in our device's memory, so each time when server restarts, session data will be re-initialized and lost or reset. So in production we need a proper database like MongoDB to store session data.
  secret: "bookMyStay",
  resave: false,
  saveUninitialized: true,
  store: store // To store session data in MongoDB store instead of memory.
}));



app.use((req, res, next) => {
  //console.log("Middleware for checking cookies", req.get("Cookie")); // we will get:- Middleware for checking cookies isLoggedIn=true
  //Above cookie is coming in string format, we need to convert it into obj format. for that we need to break cookie using split method.
  //req.isLoggedIn = req.get("Cookie")? req.get("Cookie").split("=")[1] === "true" : false; // checking... if true then req.isLoggedin=true;
  //Now we will read the data of session instead of direct cookie. 
  req.isLoggedIn = req.session.isLoggedIn;
  next();
})

app.use(authRouter);
app.use(storeRouter); 
//Middleware for checking user login status
app.use("/admin", (req, res, next) => { //Run this middleware for every route starting with /admin
  if(req.session.isLoggedIn) { // if user is loggedin 
    next(); // It tells that "Middleware finished, move to next middleware/route"
  }
  else{ //If User NOT Logged In then User is redirected to login page
    res.redirect("/login");
  }
})
app.use("/admin", adminRouter); // Every route inside adminRouter starts with: /admin


//Adding 404 Error when URL not found
app.use(errorsController.pageNotFound);


//MongoDB connection and server start
const PORT = 3007;

mongoose.connect(mongoUrl)
  .then( () => { //First we will connect to DB
    console.log("Connected with MongoDB");
    app.listen(PORT, ()=>{
      console.log(`The server is running at http://localhost:${PORT}`); //Then after we will start our server.
    });
  })
  .catch(error => {
    console.log("Error while connecting to DB", error);
  })  




