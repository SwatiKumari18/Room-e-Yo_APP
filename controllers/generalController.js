const express = require("express");
const router = express.Router();
const rentals = require("../models/rentals-db");
const userModel = require("../models/userModel.js");
const bcryptjs = require("bcryptjs");


//Routing for Home page
router.get("/", (req, res) => {

    res.render('general/home',
    {
        featuredRentals: rentals.getFeaturedRentals()
    });

});

//Routing for Registration page
router.get("/sign-up", (req, res) => {
    res.render("general/sign-up");
});

router.post("/sign-up", (req, res) => {
    
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
        validationMsg.lname = "A valid last name is required";
    }

    if (email.trim().length === 0 || !(email.match(validEmailRegex)))
    {
        validationSuccessful = false;
        validationMsg.email = "Please enter a valid email address";
    }
    

    if (pswd.trim().length === 0)
    {
        validationSuccessful = false;
        validationMsg.pswd = "Please enter your password";
    }
    else if (!(pswd.match(validPswdRegex)))
    {
        validationSuccessful = false;
        validationMsg.pswd = "Password should have 8 to 12 characters,at least one lowercase letter, uppercase letter, number and a symbol";
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
            Get ready to embark upon the journey filled with vacations and conforts!
            <br><br>
            Room-e-Yo Owner,<br>
            Swati Kumari`
        };
        let valid = true;

        userModel.find({email: req.body.email}, "email")
        .exec()
        .then((mails) => {
            if(mails.length > 0)
            {   
                valid = false;
                validationMsg.email = "This email address has already been taken by another user! Use a different email address.";
            }
        })
        .then(() => {

            if (valid)
            {
                const newUser = new userModel({ fname, lname, email, pswd });
                newUser.save()
                .then(() => {
                    console.log(`User ${req.body.fname} has been added to the database.`);
                })
                .catch(err => {
                    console.log(`Error adding user to the database ... ${err}`);
                    valid = false;
                });
                
            }
            else
            {
                throw new error("error!");
            }

        })
        .then(() => {
            sgMail.send(msg)
        })
        .then(() => {
            res.redirect("/welcome");
            })
        .catch(err =>{

            res.render("general/sign-up",
            {
                msg: validationMsg,
                data: req.body
            });
        });
        
    }
    else
    {
        res.render("general/sign-up",
        {
            msg: validationMsg,
            data: req.body
        });

    }

});


//Routing for Login page
router.get("/log-in", (req, res) => {
    res.render("general/log-in");
});

router.post("/log-in", (req,res)=>
{
    const {loginType, email, pswd} = req.body;
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

    if (!loginType)
    {
        validationSuccessful = false;
        validationMsg.loginType = "Please select a login type:";
    }

    if(validationSuccessful)
    {

        //Search MongoDB for the document with the same email address
        userModel.findOne({
            email: req.body.email
        })
        .then(user => {

            if (user)
            {
                //Found user
                //Compare the password supplied by the user with the password we have in our document
                bcryptjs.compare(req.body.pswd, user.pswd)
                .then((matched => {

                    //Done comparing the password
                    if (matched)
                    {
                        //Password matched
                        //User found
                        //Create a session by storing the user document to the session
                        req.session.user = user;

                        if (req.body.loginType === "Data Entry Clerk")
                        {
                            req.session.isClerk = true;
                            res.redirect('rentals/list');
                        }
                        else
                        {
                            req.session.isClerk = false;
                            res.redirect('/cart');
                        }
                    }
                    else
                    {
                        //Password did not match
                        validationMsg.pswd = "Sorry, you entered an invalid password";

                        res.render("general/log-in",
                        {
                            msg: validationMsg,
                            data: req.body
                        });

                    }
                }))
            }
            else{

                //Could not find the user
                validationMsg.email = "Sorry, you entered an invalid email";

                res.render("general/log-in",
                {
                    msg: validationMsg,
                    data: req.body
                });
                
            }
        })
        .catch(err => {
            console.log(err);
        });
            
    }
    else
    {
        res.render("general/log-in",
        {
            msg: validationMsg,
            data: req.body
        });

    }

});

//Routing for Welcome Page
router.get("/welcome", (req, res) => {

    res.render('general/welcome',
    {
        title: "Welcome!"
    });

});

//Routing for Shopping cart
router.get("/cart", (req, res) => {

    if (req.session.user && req.session.isClerk === false)
    {
        res.render('general/cart');
    }
    else{
        res.status(401).send("You are not authorized to view this page");
    }

});

//Routing for Logout Page
router.get("/logout", (req, res) =>
{
    req.session.destroy();
    res.redirect("/log-in");
});

module.exports = router;