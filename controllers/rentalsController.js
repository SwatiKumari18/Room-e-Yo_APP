const express = require("express");
const router = express.Router();
const rentals = require("../models/rentals-db");

//Routing for path Rentals page
router.get("/", (req, res) => {
    res.render('rentals/rental',
    {
        allRentals: rentals.getRentalsByCityAndProvince()
    });
});

//Routing for path Rentals list page
router.get("/list", (req, res) => {

    if (req.session.user && req.session.isClerk === true)
    {
        res.render('rentals/list');
    }
    else{
        res.status(401).send("You are not authorized to view this page");
    }

});

module.exports = router;