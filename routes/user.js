const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const users = require("../controllers/usersController");

router.get('/register', users.renderRegister);

router.post("/register",catchAsync(users.createNewUser));

router.get("/login", users.renderLogin);

router.post("/login", passport.authenticate("local",{failureFlash: true, failureRedirect: "/login"}),users.enterUser)

router.get("/logout", users.logoutUser)

module.exports =  router;