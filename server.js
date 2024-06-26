/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Swati Kumari
* Student ID    : 156149213
* Course/Section: WEB322 ZBB
*
**************************************************************************************/

const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const fileUpload = require("express-fileupload");

// Set up dotenv to protect environment variables.
dotenv.config({ path: "./config/keys.env" });

//Set up express
const app = express();

//middleware
// To make assets folder public
app.use(express.static("assets"));

//registering handlebars as the rendering engine for 'views' directory
// Set up Handlebars.
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main'
}));

app.set("view engine", ".hbs");

// Set up body parser.
app.use(express.urlencoded({ extended: true }));

//Set up express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req,res,next) => {
    res.locals.user = req.session.user;
    res.locals.isClerk = req.session.isClerk;
    res.locals.loaded = req.session.loaded;
    res.locals.isCustomer = req.session.isCustomer;
    next();
});

//Set up fileUpload
app.use(fileUpload());

// Controllers
const generalControllers = require("./controllers/generalController");
const rentalsController = require("./controllers/rentalsController");
const loadDataController = require("./controllers/load-dataController");

app.use("/", generalControllers);
app.use("/rentals", rentalsController);
app.use("/load-data", loadDataController);


// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    //console.error(err.stack)
    console.error(err);
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

//Connect to MongoDB
mongoose.connect(process.env.MONGO_CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to the MongoDB database.");

    // Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
    // because sometimes port 80 is in use by other applications on the machine
    app.listen(HTTP_PORT, onHttpStart);
}).catch(err => {
    console.log(`Unable to connect to MongoDB ... ${err}`);
});