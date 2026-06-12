
const { default: mongoose } = require("mongoose");

const homeSchema = mongoose.Schema({

  houseName : {type: String, required: true}, 
  price : {type: Number, required: true} ,
  location : {type: String, required: true},
  rating :  {type: Number, required: true},
  photo :  String, 
  description : String,

});
//required true  means this field should be filled mandotary
//String, Not mandotary field , we can keep it empty


//It tells create one Home Model(Class) who have homeSchema structure and then export it
module.exports = mongoose.model('Home', homeSchema);




