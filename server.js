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

//const path = require("path");
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const rentals = require("./models/rentals-db");

//middleware
// To make assets folder public
app.use(express.static("assets"));

//registering handlebars as the rendering engine for 'views' directory
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

//setting up body parser
app.use(express.urlencoded({ extended: false }));

// Add your routes here
// e.g. app.get() { ... }
app.get("/", (req, res) => {

    res.render('home',
    {
        featuredRentals: rentals.getFeaturedRentals()
    });

});

app.get("/rentals", (req, res) => {
    res.render('rentals',
    {
        allRentals: rentals.getRentalsByCityAndProvince()
    });
});

app.get("/sign-up", (req, res) => {
    res.render("sign-up");
});

app.get("/log-in", (req, res) => {
    res.render("log-in");
});

app.post("/log-in", (req,res)=>
{
    const {email, pswd} = req.body;
    let validationSuccessful = true;
    let validationMsg = {};

    if (email.trim().length === 0)
    {
        validationSuccessful = false;
        validationMsg.email = "Please enter a valid email address";
    }

    if (pswd.trim().length === 0)
    {
        validationSuccessful = false;
        validationMsg.pswd = "Please enter your password";
    }

    if(validationSuccessful)
    {
        res.render('home',
        {
            featuredRentals: rentals.getFeaturedRentals()
        });
    }
    else
    {
        res.render("log-in",
        {
            msg: validationMsg,
            data: req.body
        });

    }

});

app.post("/sign-up", (req, res) => {
    
    const {fname, lname, email, pswd} = req.body;

    let validationSuccessful = true;
    let validationMsg = {};
    let validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let validPswdRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,12}$/;


    if(typeof fname !== "string" || fname.trim().length === 0)
    {
        validationSuccessful = false;
        validationMsg.fname = "A valid first name is required";
    }

    if(typeof lname !== "string" || lname.trim().length ===0)
    {
        validationSuccessful = false;
        validationMsg.lname = "A valid lirst name is required";
    }

    if (email.trim().length === 0 || !(email.match(validEmailRegex)))
    {
        validationSuccessful = false;
        validationMsg.email = "Please enter a valid email address";
    }
    

    if (pswd.trim().length === 0 || !(pswd.match(validPswdRegex)))
    {
        validationSuccessful = false;
        validationMsg.pswd = "Please enter your password";
    }
    
    if(validationSuccessful)
    {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

        const msg = {
            to: email,
            from: "swatikumari90151@gmail.com",
            subject: "Welcome to Room-e-Yo",
            html: `Welcome to the club ${fname}! <br> 
            Get ready to emark upon the journey filled with vacations and conforts!
            <br><br>
            Room-e-Yo Owner,<br>
            Swati Kumari`
        };

        sgMail.send(msg)
        .then(() => {
            res.render('welcome',
            {
                title: "Welcome!",
                data: req.body
            });
        })
        .catch(err =>{

            console.log(err);

            res.render("sign-up",
            {
                msg: validationMsg,
                data: req.body
            });

        });
    }
    else
    {
        res.render("sign-up",
        {
            msg: validationMsg,
            data: req.body
        });

    }

});



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
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);