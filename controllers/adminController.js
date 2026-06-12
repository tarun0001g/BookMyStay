const registeredHomes = [];
const Home = require("../models/home.js");
const fs = require("fs");

exports.getAddHome =  (req, res, next) => { //we also need to pass editing flag here
    res.render('admin/edit-home', {
      pageTitle: "Enter Home Details", 
      pageName: "Add Home", 
      editing: false, 
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    }); 
} 

exports.getAdminHomes = (req, res, next) => {
  Home.find().then( registeredHomes => {
    res.render('admin/admin-home-list', {
      registeredHomes: registeredHomes, 
      pageTitle: "Admin's Homes!", 
      pageName: "admin-homes", 
      isLoggedIn: req.session.isLoggedIn , 
      user: req.session.user,
    })
  });
}

//Edit home details
exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true'; //Query parameter/variable

  Home.findById(homeId).then( home => { //home details fetching
    if(!home){
      console.log("Home not found for editing!");
      res.redirect("/admin/admin-home-list");
    }
       //passed home details
      console.log(homeId, editing, home);
      res.render('admin/edit-home', { 
        pageTitle: "Edit Your Home", 
        pageName: "admin-homes", 
        editing: editing, 
        home: home, 
        isLoggedIn: req.session.isLoggedIn, 
        user: req.session.user,
      });
  });
}


exports.postAddHome =  (req, res, next) => {
 
  const { houseName, price, location, rating, description} = req.body;
  console.log(houseName, price, location, rating, description);
  console.log(req.file);

  if(!req.file){
    return res.status(422).send("Please upload a valid image file!");
  }

  const photo = req.file.path; // it will be the path of uploaded file on our server.(in uploads\image.. )

  const home = new Home ( { //saving home with below details on MongoDB
    houseName, 
    price, 
    location, 
    rating, 
    photo, 
    description
   } );

  home.save().then(() => {
    console.log("Home Saved Successfully!");
  });  
  res.redirect('/admin/admin-home-list');
}

//After Editing Home
exports.postEditHome =  (req, res, next) => {
  const { id, houseName, price, location, rating, description} = req.body;

  Home.findById(id).then((home) => {
    home.houseName = houseName;
    home.location = location;
    home.rating = rating;
    home.description = description;

    if(req.file){
      fs.unlink(home.photo, (err) => {
        if(err){
          console.log("Error while deleting old home home's photo!!", err);
        }//unlink() it will delete file from server. It takes path of file to be deleted and callback function as arguments.
      });
      home.photo = req.file.path; //if new photo is uploaded by home admin then & only then update with current photo path
    }

    home.save().then(result => {
      console.log("Home Updated", result);
    }).catch(err => {
      console.log("Error while updating home", err);
    })
    res.redirect('/admin/admin-home-list');

  }).catch(err => {
    console.log("Error while finding home", err);
  });
} 


//Delete Home
exports.postDeleteHome =  (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findByIdAndDelete(homeId).then(() => {
    res.redirect('/admin/admin-home-list'); 
    console.log("Home deleted successfully!", homeId);
  })
  .catch(error => {
    if(error){
      console.log("Error while deleting home!", error);
    }
  });
}



