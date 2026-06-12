
const { check, validationResult } = require("express-validator");
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');


exports.getLogin =  (req, res, next) => { 
    isLoggedIn = false;
    res.render('auth/login', {
        pageTitle: "Login", 
        pageName: "login", 
        oldInput: {email: ""}, 
        errors: [],
        user: {},
    }); 

} 

exports.postLogin = async (req, res, next) => { 
    console.log(req.body);
   
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            pageName: "login",
            isLoggedIn: false,
            errors: ["User does not exist"], //Ideal error message: "Invalid Username or Password!"
            oldInput: {email},
            user: {},
        })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            pageName: "login",
            isLoggedIn: false,
            errors: ["Invalid Password!"], //Ideal error message: "Invalid Username or Password!"
            oldInput: {email},
            user: {},
        })
    }

    req.session.isLoggedIn = true; 
   // req.session.user = user; //we are passing entire user obj in sesssion, to access user's details quickly on UI (like Name of user)
    req.session.user = {
            _id: user._id.toString(),
            firstName: user.firstName,
            email: user.email,
            userType: user.userType
        };
    await req.session.save();
    
    res.redirect("/");
}

exports.postLogout = (req, res, next) =>{
    req.session.destroy( () => {
        res.redirect("/login");
    })
}

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: "User Registration",
        pageName: "signup",
        isLoggedIn:req.session.isLoggedIn,
        errors: [],
        oldInput: { 
            firstName: "", 
            lastName: "", 
            email:"", 
            userType:"",
            user: {},
        } 
    });
}

exports.postSignUp = [
    
    //FirstName
    check("firstName")
    .trim()
    .notEmpty()
    .withMessage("First Name is required!")
    .isLength({min: 3})
    .withMessage("First Name must me be atleast 3 charachters long!")
    .matches(/^[A-Za-z]+$/)
    .withMessage("First Name should contains only alphabets!"),
    
    //LastName
    check("lastName")
    .trim() //trim() is used to remove extra spaces from the beginning and end of the input string.
    .notEmpty()
    .withMessage("Last Name is required!")
    .isLength({min: 2})
    .withMessage("Last Name must me be atleast 2 charachters long!")
    .matches(/^[A-Za-z]+$/)
    .withMessage("Last Name should contains only alphabets!"),
 
    //Email
    check("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please enter a valid email!")
    .normalizeEmail(),

    //Passwords Validation
    check("password")
    .isLength({min: 8})
    .withMessage("Password must be 8 characters long!")
    .matches(/[a-z]/)
    .withMessage("Password must contains atleast one Lowercase letter!")
    .matches(/[A-Z]/)
    .withMessage("Password must contains atleast one Uppercase letter!")
    .matches( /[!@#$%&*(),.?":{}|<>]/)
    .withMessage("Password must contains atleast one special character!")
    .trim(),

    //confirm password
    check("confirmPassword")
    .trim()
    .custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Password do not matches!');
        }
        return true;
    }),

    //User Type Validation
    check("userType")
    .notEmpty()
    .withMessage("Please select user type!")
    .isIn(["guest", "admin"])
    .withMessage("Invalid user type selected!"),

    //Terms & Conditions
    check("terms")
    .notEmpty()
    .withMessage("You must accept Terms & Conditions!"),

    //Final handler middleware
    (req, res, next) => {
        const { firstName, lastName, email, password, userType } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) { //If errors.isEmpty() == false means error found
            return res.status(422).render('auth/signup', {
                pageTitle: 'Sign Up',
                pageName: 'signup',
                isLoggedIn: false,
                errors: errors.array().map(error => error.msg),// Convert errors into simple message array
                oldInput: { firstName, lastName, email, password, userType, user: {}, } //It will helps to Store old input values
            });
        }
        //else If errors.isEmpty() == true;  means no any error found

        bcrypt.hash(password, 12)
        .then((hashedPassword) => {
            const user = new User ({ firstName, lastName, email, password: hashedPassword, userType } );
            return user.save();
        })
        .then(()=> {
            console.log("Registration successful with", req.body);
            res.redirect('/login');
        })
        .catch(err => {
            console.log("Error occured during user registration!");
            return res.status(422).render('auth/signup', {
                pageTitle: 'Sign Up',
                pageName: 'signup',
                isLoggedIn: false,
                errors: [err.message],// Convert errors into simple message array
                oldInput: { firstName, lastName, email, password, userType, user: {}, } //It will helps to Store old input values
            })
        })
        
        
    }
]


