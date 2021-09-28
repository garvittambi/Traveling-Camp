if(process.env.NODE_ENV !== "production"){
   require("dotenv").config();
}

const express =  require("express");
const mongoose =  require("mongoose");
const app = express();
const path = require('path');
const methodOverride =  require("method-override");
const ejsMate  =  require("ejs-mate");
const  ExpressError =  require("./utils/ExpressError");
const {campgroundSchema,reviewSchema} = require("./schemas.js");
const expressSession =  require("express-session");
const flash =  require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User =  require("./models/user");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoDBStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//const localDBUrl = 'mongodb://localhost:27017/yelp-camp';
const secret =  process.env.SECRET || "I want to spend All beatiful moments with you but it can take place only in my Memories";


const campgroundsRoutes =  require("./routes/campground");

const reviewsRoutes =  require("./routes/review");

const userRoutes = require("./routes/user");
const { contentSecurityPolicy } = require("helmet");
const { session } = require("passport");

const store =  new MongoDBStore({
   mongoUrl: dbUrl,
   secret,
   touchAfter : 24*60*60
});

store.on("error", function(e) {
   console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
   store,
   secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      expires: Date.now() + 1000*60*60*24*7,
      maxAge:  1000*60*60*24*7,
   }
}

//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl,{useNewUrlParser: true,useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
   console.log("Database Connected!!");
})
app.engine('ejs',ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));


app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

app.use(expressSession(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy : false}));

const scriptSrcUrls = [
   "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" ,
   "https://api.tiles.mapbox.com/",
   "https://api.mapbox.com/",
   "https://kit.fontawesome.com/",
   "https://cdnjs.cloudflare.com/",
   "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js",
];
const styleSrcUrls = [
   "https://kit-free.fontawesome.com/",
   "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
   "https://api.mapbox.com/",
   "https://api.tiles.mapbox.com/",
   "https://fonts.googleapis.com/",
   "https://use.fontawesome.com/",
];
const connectSrcUrls = [
   "https://api.mapbox.com/",
   "https://a.tiles.mapbox.com/",
   "https://b.tiles.mapbox.com/",
   "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
   helmet.contentSecurityPolicy({
       directives: {
           defaultSrc: [],
           connectSrc: ["'self'", ...connectSrcUrls],
           scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
           styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
           workerSrc: ["'self'", "blob:"],
           objectSrc: [],
           imgSrc: [
               "'self'",
               "blob:",
               "data:",
               "https://res.cloudinary.com/garvit-yelpcamp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
               "https://media.gettyimages.com/",
               "https://images.unsplash.com/",
               "https://i5.walmartimages.com/asr/538e6ee9-b8ce-4c50-bb78-e0ef9ca3e5d7.d92a2e915d667614f121ea11f0d1ec7e.jpeg",
           ],
           fontSrc: ["'self'", ...fontSrcUrls],
       },
   })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

app.use((req,res,next) => {
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error =  req.flash("error");
   next();
})

app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews",reviewsRoutes);
app.use("/", userRoutes);
app.use(express.static(path.join(__dirname,"public")));
app.use(mongoSanitize());


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const validateCampground = (req,res,next) =>{
   const {error} = campgroundSchema.validate(req.body);
   if(error){
      const msg = error.details.map(el =>el.message).join(',');
      throw new  ExpressError(msg, 400);
   }else{
      next();
   }
}

const validateReview = (req,res,next) => {
   const {error} = reviewSchema.validate(req.body);
   if(error){
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
   }else{
      next();
   }
}
/*
app.get("/nakliUpbhokta", async (req,res) => {
const upbhokta = new User({email: "MukeshMeraBaap@gmail.com", username: "SastaAnant"})
const nayeUpbhokta = await User.register(upbhokta ,  "Reliance69@MereLawdeP");
res.send(nayeUpbhokta);
})
*/

app.get('/', (req,res) =>{
    res.render("home");
})


app.all("*", (req,res,next) =>{
   next(new ExpressError("Page Not Found",404))
})


app.use((err,req,res,next) => {
   const {statusCode=500} = err;
   if(!err.message)err.message = "Something Went wrong Here"
   res.status(statusCode).render("error",{err});
})

app.listen(3000, () =>{
  console.log("Serving on port 3000");
})