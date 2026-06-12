

## In this file we will add option to upload photos of home directly from the admin instead of putting URLs.

## Adding file picker in home/edit-home.ejs file
- we will change type to type="file"
- we will replace name="photo" from name="photoURL" in entire project
- we can add multiple files if we add multiple
- we will also add  accept=".png,.jpg,.jpeg" to specify type of files.

## now we will replace setting of sending data in multipart form instead of text (urlencoded) form. 
# also handle the multipart form data
- enctype means: Encoding Type
It tells the browser that:
"How should I package the form data before sending it to the server?"
- for any text field data we will use <form method="POST">
- But, A file is not simple text. it may contain Thousands or millions of bytes
- so we need to change 
<form
  method="POST"
  enctype="multipart/form-data"// Browser puts each field in separate packets
   />

- now we will install multer package to handle maltipart form data
- we will use it in app.js file
- we will use logging req.body in postAddHome(of adminController) to understand data and its type.

## Now we will save the image file
- we can pass the saving options in multer() fn in app.js to define where to save file and how to name it.
now if we add new home with photo, then we can see that photo saved in new folder named uploads/.
here we need to save that photo as .jpg to view it. 
# custom file names 
- now we will add storing option where we define how to name the file with formate and where to save it.

result += characters.charAt(Math.floor(Math.random() * characters.length));
-> Here first random value is generated and then multiplied with charcters.length (26) ex. 13.26
now math.floor() will remove decimal part and return only integer value ex. 13
then charAt() will return character at inddex 13 and put it in the result string.

multer.diskStorage() gives instructions to Multer:
User defines :- "When a file is uploaded, where should you save it and what should you name it?"
Multer:- Multer is a middleware for Express that helps your server receive uploaded files.
Multer is a translator between the browser and your server for file uploads.(Server cannot understand uploaded files)

# Restricting Upload file types on frontend 
- we can restrict input file types on frontend by adding accept=".png, .jpg, .jpeg" in input tag

# Restricting Upload file types on backend 
- to add file type restriction on backend, first we need to remove accept="..." from input tag
- now we will pass fileFilter logic in multer()
- then we will add:-   if(!req.file){
    return res.status(422).send("Please upload a valid image file!");
  }
now if we try to add any other file type like .exe, .doc, etc then we will get above error message.
ideally:- we should render this error on same page with proper UI.

# Saving uploaded file's path on MongoDB
- the path will specify where the file is stored in our server
- const photo = req.file.path; a parth of uploaded file on server.

## Handling edit-home for image update
- in current scenario, if admin update any home detail without uploading any new image, then the photo field will bocome empty & will not be awailabe on MongoDb. because server is not remembering old photo path & it is expecting a new photo on each home update.
- that issue is occured in postEditHome where server is saving details of req.body. 
But as we know during editing home , req.body is containing old home details except photo field because we haven't defined logic to show & remember old photo & its path on edit-hoem.ejs file.
- we will add only one if(){..} condition in postEditHome to check if new photo is uploaded then save otherwise save old photo's path as it is.

## Serving Saved Data (Rendering uploaded home images on UI)
- to showe saved home images on UI we need to make uploads folder public.
- for that we will use one more middleware in app.js as like:- app.use(express.static("uploads"));
- we will specify path for /admin/uploads (admin's homes) & /uploads (for home page) & /homes/uploads for home detail page.

## Adding feature:-  download home details pdf for each home and for only loggedin users
- we will add one more button in home-details.ejs page for downloading file in pdf. 

## Unlink/Deleting files
- now we are going to add one feature or fn where admin will be able to keep one image file for each home and whenever admin will update home details with new image, then old image will be deleted from uploads folder.
- when new image comes then the previous image will be automatically deleted from uploads 
- for that we will use unlink() fn in postEditHome of adminController.


# app.use(express.urlencoded());
means:- "Express, whenever a form sends data, convert that data into req.body."
- Express translates the form data into an object.

## How image-data storage and my server works together in real-world web apps?(for large no of users)
Admin uploads image
       ↓
Node receives image
       ↓
Node uploads image to storage service
       ↓
Storage service returns URL
       ↓
MongoDB stores URL

## How our BookMyStay app server will works after deployment on Deployement server?(for less no of users)
Admin uploads image
        ↓
Node.js Server
        ↓
uploads/
        ↓
MongoDB stores path


## A modern web application is usually built from 3 major parts:
1. Application / Deployment Server 
(For beginners:- Render, Railway, Vercel, etc. )
(For professionals:- Amazon Web Services, Google Cloud, Microsoft Azure, etc.)

2. Database Server
MongoDB:- MongoDB Atlas
SQL Databases:- MySWL, PostgreSQL, Microsoft SQL Server, etc.

3. File Storage System (To Store images, videos, documents, etc.)
Cloudinary, Amazon S3, Google Cloud Storage, Microsoft Azure Storage, etc.