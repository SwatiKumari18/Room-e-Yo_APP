const express = require("express");
const router = express.Router();
const rentals = require("../models/rentals-db");
const path = require("path");

//Routing for Rentals page
router.get("/", (req, res) => {
    res.render('rentals/rental',
    {
        allRentals: rentals.getRentalsByCityAndProvince()
    });
});


//Routing for Rentals list page
router.get("/list", (req, res) => {

    if (req.session.user && req.session.isClerk === true)
    {
        var sortBy = { headline: 1 };
        rentals.rentalModel.find().sort(sortBy)
        .then(sortedRentals => {

            sortedRentals = sortedRentals.map(value => value.toObject());

            res.render('rentals/list', {
                data: sortedRentals
            });
        })
        .catch(err => {
            console.log(`Error occured while sorting the rentals by headline........${err}` );
        });

    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});


//Routing for rentals/add page
router.get("/add", (req, res) => {

    if (req.session.user && req.session.isClerk === true)
    {
        res.render('rentals/add');
    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});

router.post("/add", (req, res) => {
    
    if (req.session.user && req.session.isClerk === true)
    {
        var{ headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, featuredRental } = req.body;
        let validationSuccessful = true;
        let validationMsg = {};

        
        //Authentication
        if (!req.body.featuredRental)
        {
            validationSuccessful = false;
            validationMsg.featuredRental = "Please make a selection";
        }

        if (validationSuccessful)
        {
           
            //Create a new rental
            const newRental = new rentals.rentalModel({
                headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, featuredRental
            });
    
            //Save the new rental to the database
            newRental.save()
            .then(rentalSaved => {
                console.log(`Added the new rental ${rentalSaved.headline} !`);

                //Creating uniquename for the image to be stored in the file system
                let uniqueName = `rental-image-${rentalSaved._id}${path.parse(req.files.imageUrl.name).ext}`;

                //Copying the image data to "/assets/images/Rentals" folder
                req.files.imageUrl.mv(`assets/images/Rentals/${uniqueName}`)
                .then(() => {

                    //Update the document to include a unique name
                    rentals.rentalModel.updateOne({
                        _id: rentalSaved._id
                    }, {
                        "imageUrl": uniqueName
                    })
                    .then(() => {

                        //Rental image updated
                        console.log("Updated the rental image");
                        res.redirect("/rentals/list");
                    })
                    .catch(err => {
                        console.log("Error occured while updating rental image.... " + err);
                    });

                })
                .catch(err => {
                    console.log("Unable to update the document to include a unique name.... " + err);
                });

            })
            .catch(err => {
                
                console.log(err);
                console.log("Error occured while adding rental- " + headline);
                
            });

        }
        else
        {
            res.render("rentals/add",
            {
                msg: validationMsg,
                data: req.body
            });
        }

        
    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});



//Routing for rentals/edit/:id page
router.get("/edit/:id", (req, res) => {

    // console.log(req.body);
    if (req.session.user && req.session.isClerk === true)
    {
        rentals.rentalModel.find({_id : req.params.id})
        .then(rental => {
            rental = rental.map(value => value.toObject());

            res.render('rentals/edit',
            {
                data: rental
            });

        })
        .catch(err => {

            console.log("Error occured while finding for the rental...." + err);

        });
    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});


//Routing for rentals/edit/:id page
router.post("/edit/:id", (req, res) => {

    if (req.session.user && req.session.isClerk === true)
    {
        var{ headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, featuredRental } = req.body;
        
        rentals.rentalModel.updateOne({_id : req.params.id}, {
            $set:{
                headline, 
                numSleeps, 
                numBedrooms, 
                numBathrooms, 
                pricePerNight, 
                city, 
                province, 
                featuredRental
            }
        })
        .then(() => {

            if (!req.files)
            {
            
                console.log("Updated the rental");
                res.redirect("/rentals/list");
            }
            else
            {

                //Creating uniquename for the image to be stored in the file system
                let uniqueName = `rental-image-${req.params.id}${path.parse(req.files.imageUrl.name).ext}`;
               
                //Copying the image data to "/assets/images/Rentals" folder
                req.files.imageUrl.mv(`assets/images/Rentals/${uniqueName}`)
                .then(() => {
                    
                    //Update the document to include a unique name
                    rentals.rentalModel.updateOne({
                        _id: req.params.id
                    }, {
                        $set: {
                        "imageUrl": uniqueName
                        }
                    })
                    .then(() => {
                        
                        //Rental image updated
                        console.log("Updated the rental image");
                        console.log("Updated the rental");

                        res.redirect("/rentals/list");

                    })
                    .catch(err => {
                        console.log("Error occured while updating rental image.... " + err);
                    });
                })
                .catch(err => {
                    console.log("Unable to update the document to include a unique name.... " + err);
                });
    
            }
        })
        .catch(err => {
            console.log("Error occured while updating rental.... " + err);
        });

    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});


//Routing for rentals/remove page
router.get("/remove/:id", (req, res) => {


    if (req.session.user && req.session.isClerk === true)
    {
        rentals.rentalModel.find({_id : req.params.id})
        .then(rental => {
            rental = rental.map(value => value.toObject());

            res.render('rentals/remove',
            {
                data: rental
            });

        })
        .catch(err => {

            console.log("Error occured while finding for the rental...." + err);

        });
    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});


router.post("/remove/:id", (req, res) => {

    if (req.session.user && req.session.isClerk === true)
    {
        console.log(req.body);
        // const toBeDeleted = req.body.delete;
        
        if(req.body.delete === 'true')
        {

            rentals.rentalModel.deleteOne({_id : req.params.id})
            .then(() => {

                console.log("Successfully deleted the rental");
                res.redirect("/rentals/list");
    
            })
            .catch(err => {
    
                console.log("Error occured while finding for the rental...." + err);
    
            });

        }
        else
        {
            console.log("Removing process canceled");
            res.redirect("/rentals/list");

        }

    }
    else
    {
        res.status(401).send("You are not authorized to view this page");
    }

});


module.exports = router;