const express = require("express");
const router = express.Router();
const rentals = require("../models/rentals-db");

//Routing for path  Rentals page
router.get("/rentals", (req, res) => {

    if (req.session.user && req.session.isClerk === true)
    {
        //count rentals
        rentals.rentalModel.count()
        .then(numOfRentals => {

            if (numOfRentals === 0)
            {
                //Load all rentals
                const allRentals = rentals.getAllRentals();

                rentals.rentalModel.insertMany(allRentals)
                .then(() => {

                    req.session.loaded = true;

                    res.render("load-data/rentals", {
                        msg : "Added rentals to the database"
                    });

                })
                .catch(err => {
                    
                    res.send("Error occured in inserting rentals to the database...." + err);

                });
            }
            else
            {
                //Rentals already present, don't duplicate them
                req.session.loaded = true;

                res.render("load-data/rentals", {
                    msg : "Rentals have already been added to the database"
                });

            }
        })
    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});

module.exports = router;