

const Home = require("../models/home.js");

const User = require('../models/user.js');

exports.getHomePage = (req, res, next) => {
  // console.log("Session data is:", req.session);
Home.find().then( registeredHomes => { // we are using destructured array of all homes(registeredHomes)
   res.render('store/home', {
    registeredHomes: registeredHomes, 
    pageTitle: "Welcome to BookMyStay!", 
    pageName: "Home", 
    isLoggedIn: req.session.isLoggedIn, 
    user: req.session.user,
  });
});
}

exports.getHomeList = (req, res, next) => {
  Home.find().then( registeredHomes => {
    res.render('store/home-list', {
      registeredHomes: registeredHomes, 
      pageTitle: "List of Homes!", 
      pageName: "Homes", 
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    })
  });
}

exports.getBookings = (req, res, next) => {
    res.render('store/bookings', { 
      pageTitle: "My Bookings!", 
      pageName: "bookings", 
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    })
  };

exports.getFavoriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render('store/favorite-list', {
      favouriteHomes: user.favourites,
      pageTitle: "Favourite Homes",
      pageName: "Favourites",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
  })

}


//Add Home to favourites
exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);

  if(!user.favourites.includes(homeId)){ //if not already favourite, then push in favourites
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");


}


//Remove Home from favourites
exports.postRemoveFromFavourites = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);

  if(user.favourites.includes(homeId)){
      user.favourites = user.favourites.filter(fav => fav && fav.toString() !== homeId);
      await user.save();
  }
  res.redirect("/favourites");


}
 



//Get Home details
exports.getHomeId =  (req, res, next) => {
    const homeId = req.params.homeId;
    Home.findById(homeId).then( home  => { //home details fetching
      if(!home){
        console.log("Home not Found!");
        res.redirect("/homes");
      }
      else{
          // console.log("Home Details found: ", home);
          res.render('store/home-detail', { 
            pageTitle: "Home Detail", 
            pageName: "Homes", 
            home: home, 
            isLoggedIn: req.session.isLoggedIn, 
            user: req.session.user,
          });
      }
    });
}


//Get House Rules
exports.getHouseRules = (req, res, next) => {
  const path = require("path");
  const rootDir = require("../utility/fileHelperUtility");

  if(!req.session.isLoggedIn){
    return res.redirect("/Login");
  }

  else{
    const homeId = req.params.homeId;
    const rulesFileName = "BookMyStay_Rules.pdf";

    const filePath = path.join(rootDir, "rules", rulesFileName);

    res.download(filePath, "Rules.pdf");
  }
} 