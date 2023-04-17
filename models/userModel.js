const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

//Defining schema
const userSchema = new mongoose.Schema({
    "fname" : {
        "type" : String,
        "require" : true
    },
    "lname" : {
        "type" : String,
        "require" : true
    },
    "email" : {
        "type" : String,
        "unique" : true
    },
    "pswd" : {
        "type" : String,
        "require" : true
    }
});

userSchema.pre("save", function(next) {

    let user = this;

    //Create a Salt
    bcryptjs.genSalt()
    .then(salt => {

        //Hash password by sing salt
        bcryptjs.hash(user.pswd, salt)
        .then(hashedPwd => {

            user.pswd = hashedPwd;
            next(); //giving permission to continue

        })
        .catch(err => {
            console.log(`Error occured while hashing password....${err}`);
        });

    })
    .catch(err => {
        console.log(`Error occured while salting password....${err}`);
    });
    
});

//Creating model named - 'users'
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
