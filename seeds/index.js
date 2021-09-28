const express =  require("express");
const mongoose = require("mongoose");
const cities = require("./cities");
const Campground =  require("../models/campground");
const {places,descriptors} =  require("./seedHelpers");


mongoose.connect('mongodb://localhost:27017/yelp-camp',{useNewUrlParser: true,useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
   console.log("Database Connected!!");
});

const sample = array => array[Math.floor(Math.random()*array.length)]


const seedDB = async () =>{
 await Campground.deleteMany({});
 for(let i=0;i<500;i++)
  {
      const random1000 =  Math.floor(Math.random()*1000);
      const price = Math.floor(Math.random()*20) + 10;
     const camp =  new Campground({
          author: "61441f68eaf6efc899aa1731",
          location: `${cities[random1000].city},${cities[random1000].state}`,
          title:  `${sample(descriptors)} ${sample(places)}`,
          description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Id, aspernatur! Vitae recusandae eaque totam incidunt libero, numquam dolorum architecto aliquam! Maiores, aliquid tempore impedit repudiandae eum pariatur! Cum, cupiditate inventore.",
          price,
          geometry: {
            type: "Point",
            coordinates: [
              cities[random1000].longitude,
              cities[random1000].latitude,
            ]
          },
          images: [
            {
              url: 'https://res.cloudinary.com/garvit-yelpcamp/image/upload/v1632152516/YelpCamp/vf7knhux4pjg0gqf1hto.jpg',
              filename: 'YelpCamp/vf7knhux4pjg0gqf1hto',
            },
            {
              url: 'https://res.cloudinary.com/garvit-yelpcamp/image/upload/v1632152518/YelpCamp/ufyeuwpyohlxwbzzabkn.png',
              filename: 'YelpCamp/ufyeuwpyohlxwbzzabkn',
            }
          ]           
     })
      await camp.save();
  }
}


seedDB().then(() => {
 mongoose.connection.close()
})