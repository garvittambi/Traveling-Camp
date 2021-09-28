const express = require("express");
const router =  express.Router({mergeParams: true});
const  catchAsync  =  require("../utils/catchAsync");
const {validateReview,isLoggedIn,isReviewAuthor} =  require("../middleware");
const reviews = require("../controllers/reviewsController")

router.post("/", validateReview,isLoggedIn, catchAsync(reviews.createNewReview)) 

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;