
const { default: mongoose } = require("mongoose");

const favouriteSchema = mongoose.Schema({
  homeId : {
    type : mongoose.Schema.Types.ObjectId, //Instead of storing full data, we store:the ID of another document
    //Above field will store a MongoDB ObjectId (a unique ID of another document)
    ref : 'Home', //tells Mongoose: “This ObjectId belongs to Home collection”
    required : true,
    unique : true
  }
});


module.exports = mongoose.model('Favourite', favouriteSchema);
// Tells create a model(Class) named Favouurite who have this structure: favouriteSchema

