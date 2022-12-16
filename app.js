//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const loadash = require("lodash");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

const uri = "mongodb://localhost:27017/BlogDB";

// Schema for Blog DB
/*
1. Id 
2. Title
3. Content
4. Date/Time
*/
const blogSchema = mongoose.Schema(
  {
    title : {
      required : true,
      type: String,
      minLength: 2,
      maxLength: 50
    },
    content : {
      required : true,
      type: String,
      minLength: 10,
      maxLength: 1000
    },
    timeOfCreation : {
      required : true,
      type: Date,
      default: Date.now
    }
  }
);

//create model
const blogModel = mongoose.model('BlogRecords', blogSchema);

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const resMap = {};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

mongoose.connect(uri);

app.get('/', function(req, res){
  posts = [];
  blogModel.find({},function(err, result){
    if(err){
      console.log('Error while retriving records: '+err);
    }
    else{
      result.forEach(function(doc){
        posts.push(doc);
      });
      res.render('home', {homeContent : homeStartingContent, allPosts : posts});
    }
  });
});

app.get('/about', function(req, res){
  res.render('about', {aboutInfo : aboutContent});
});

app.get('/contact', function(req, res){
  res.render('contact', {contactInfo : contactContent});
});

app.get('/compose', function(req, res){
  res.render('compose', {resultMap : resMap});
});

app.post('/compose', function(req, res){
  if(req.body.textTitle.trim().length === 0 || req.body.textContent.trim().length === 0){
    resMap['fail'] = "Both the fields should have content, empty spaces are not allowed as input!!!";
    delete resMap['success'];
    res.redirect('/compose');
  }
  else{
    errMsg = validateInputs(req.body.textTitle, req.body.textContent);
    if(errMsg != null && errMsg.length > 0){
      resMap['fail'] = errMsg[0];
      delete resMap['success'];
      res.redirect('/compose');
    }
    else{
      const newBlog = new blogModel({
        title : req.body.textTitle,
        content : req.body.textContent,
        timeOfCreation : Date.now()
      });
      newBlog.save(function(err){
        if(err){
          console.log('Error while saving the blog: '+err);
          resMap['fail'] = err;
          delete resMap['success'];
        }
        else{
          resMap['success'] = 'Post added successfully!';
          delete resMap['fail'];
        }
        res.redirect('/compose');
      });      
     
    }
  }
});

app.get('/posts/:postId', function(req, res){
  let pTitle;
  let pContent;
  let postId = req.params['postId'];
  blogModel.find(
    {_id : postId},
    function(err, result){
      if(err){
        console.log('Error while retreiving the post');
      }
      else{
        if(result != null){
          pTitle = result[0].title;
          pContent = result[0].content;
        }
        res.render('post', {postTitle : pTitle, postContent : pContent});
      }
    }
  ); 
});

function validateInputs(title, content){
  errMssgs = [];
  if(title.length < 2){
    errMssgs.push('Title should be minimum of 2 characters');
  }
  else if(title.length > 50){
    errMssgs.push('Title can be maximum of 50 characters');
  }
  else if(content.length < 10){
    errMssgs.push('Content should be minimum of 10 characters');
  }
  else if(content.length > 1000){
    errMssgs.push('Content can be maximum of 1000 characters');
  }
  return errMssgs;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
