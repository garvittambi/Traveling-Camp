const Campground =  require("../models/campground");
const randomName = require("random-name");
const randomEmail = require("random-email");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken =  process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapBoxToken});
const {cloudinary} = require("../cloudinary");

module.exports.index = async (req,res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
 }

 module.exports.renderNewForm = (req,res) =>{
    res.render("campgrounds/new");
 }

 module.exports.createNewCampground = async (req,res,next) =>{
  const geoData = await geocoder.forwardGeocode({
       query: req.body.campground.location,
       limit: 1
    }).send()
    const campground  =  new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a New Campground 🥳");
    res.redirect(`/campgrounds/${campground._id}`);
 }

 module.exports.showCampground = async (req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
       path : 'reviews',
       populate : {
          path: "author"
       }
      }).populate("author");
    if(campground.author.username === 'Garvit  Tambi'){
    campground.author.username =  randomName.first();
    }
    if(campground.author.email === 'garvittambi@gmail.com'){
      campground.author.email =  randomEmail();
      }
    if(!campground){
       req.flash("error", 'Cannot find that Campground 😔');
       return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show",{campground});
 }

 module.exports.renderEditForm = async (req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
      req.flash("error", 'Cannot find that Campground 😔');
      return res.redirect("/campgrounds")
   }
    res.render("campgrounds/edit",{campground});
 }

 module.exports.updateCampground = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground},{new:true});
    const imgs =  req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save(); 
    if(req.body.deleteImages){
      for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename);
      }
     await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash("success","Successully Updated Campground 👍");
    res.redirect(`/campgrounds/${campground._id}`);
 }

 module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
     await Campground.findByIdAndDelete(id);
     req.flash("success", "Successfully Deleted the Campground 🤘")
     res.redirect("/campgrounds");
  }