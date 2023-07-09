require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const ejs = require("ejs");
const google=require("google-search-results-nodejs");

const search=new google.GoogleSearch(process.env.SEARCH_API);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-ranjith:test123@cluster1.4ovnbxe.mongodb.net/fruitsDB");



const fruitSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please check your data entry, no name specified!"]
    },
    rating:{
        type:Number,
        min:1,
        max:10
    },
    review:String
});


fruitSchema.index({name:"text"});


const Fruit=mongoose.model("Fruit",fruitSchema);



// const fruit=new Fruit({
//     name:"Apple",
//     rating:7,
//     review:"Pretty solid as a fruit."
// });




// fruit.save();

// const personSchema=new mongoose.Schema({
//     name:String,
//     age:Number,
//     favouriteFruit:fruitSchema
// });

// const Person=mongoose.model("Person",personSchema);

// const pineapple=new Fruit({
//     name:"Pineapple",
//     rating:9,
//     review:"Great Fruit."
// })

// pineapple.save();

// const person=new Person({
//     name:"Amy",
//     age:12,
//     favouriteFruit:pineapple
// })

// person.save();

// const kiwi=new Fruit({
//     name:"Kiwi",
//     rating:10,
//     review:"The best fruit"
// })

// const orange=new Fruit(
//     {
//         name:"Orange",
//         rating:4,
//         review:"Too sour for me."
//     }
// )

// Fruit.insertMany([kiwi,orange]).then(function(){
//     console.log("Successfully inserted into fruitsDB");
// }).catch(function(err){console.log(err);})

// Fruit.find().then(function(fruits){
//     fruits.forEach(function(fruit){
//         mongoose.connection.close();
//         console.log(fruit.name);
//     })
// }).catch(function(err){
//     console.log(err);
// })

// Fruit.updateOne({_id:"647cac7d5e2b91b064eb7c96"},{name:"Peach"}).then(function(){
//     console.log("Succesfully updated the document");
// }).catch(function(err){
//     console.log(err);
// });

// Fruit.deleteOne({_id:"647cac7d5e2b91b064eb7c97"}).then(function(){
//     mongoose.connection.close();
//     console.log("Succesfully deleted.");
// }).catch(function(err){
//     console.log(err);
// });

// Person.deleteMany({name:"John"}).then(function(){
//     mongoose.connection.close();
//     console.log("Succesfully deleted.");
// }).catch(function(err)
// {
//     console.log(err);
// });

// Person.updateOne({name:"John"},{favouriteFruit:orange}).then(function(){
//     mongoose.connection.close();
//     console.log("Succesfully updated");
// }).catch(function(err){
//     console.log(err);
// });

var autocompleteResults=[];


app.get("/",function(req,res){

    res.render("index");
})

app.post("/search",async function(req,res){
    const payload=req.body.payload.trim();
    const params={
        q:payload,
        engine:"google_autocomplete",
        location: "Austin, TX"
    };
    search.json(params,function(results){
        autocompleteResults=results.suggestions.splice(0,3);
        Fruit.aggregate([
            {
                $search:{
                    'index':"fruit-search",
                    'regex':{
                        'path':'name',
                        'query':_.capitalize(payload)+'(.*)'
                    }
                }
            }
        ]).then(function(fruits){
            res.send({
                fruits:fruits,
                results:autocompleteResults
            });
        }).catch(function(err){
            console.log(err)
        })
    })
    // await Fruit.find(
    //     { "name": { "$regex": new RegExp('^'+payload+'.*','i')}}
    // ).then(function(fruits){
    //     res.send({fruits:fruits})
    // }).catch(function(err){
    //     console.log(err);
    // })
    

})

app.get("/insert",function(req,res)
{
    res.render("insert");
})

app.post("/insert",function(req,res){
    const newFruit=new Fruit({
        name:req.body.name,
        rating:req.body.rating,
        review:req.body.review
    });
    newFruit.save();
    res.redirect("/");
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
