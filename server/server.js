
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const _ = require('lodash');
const port=process.env.PORT || 3000;
const path = require('path');
const morgan = require('morgan');

var {Todo} = require('./models/todos');
var {mongoose} = require('./db/dbConnection');
var {ObjectID} = require('mongodb');
var {User} = require('./models/users');
var {authenticate}=require('./middleware/authenticate');
// var pub=path.join(__dirname ,'..','public');
const publicPath=path.join(__dirname,'../public');

var app = express();
app.use(bodyParser.json());
// console.log(path.join(__dirname ,'..','public'));

app.use(express.static(publicPath));
app.set('view engine','hbs');
// // app.use(express.static(__dirname+'/../'));
// app.set('views',path.join(__dirname,'../public/views'));
app.get('/',(req,res)=>{
  // Todo.find({
  //   _creator:req.user._id
  // }).then((doc)=>{
  //   res.send(doc);
  // // });
  // res.send(root.html);

});
app.post('/adduser',(req,res)=>{
   var body = _.pick(req.body,['email','password']);
  var p = req.body.email;
  //console.log('this is request body ',req.body);

  var user = new User(body);
  console.log('this is a user object',user);
  console.log('\n\n');
  user.save().then(()=>{
    return user.generateAuthToken();

  }).then((token)=>{
    res.header('x-auth',token).send(user);

  }).catch((e)=>{
    res.status(400).send(e);
  });

});

app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});


app.post('/users/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);

  User.findByCredentials(body.email , body.password).then((user)=>{
    // return user.generateAuthToken().then((token)=>{
    //    res.header('x-auth',token);
    //
    // });
    res.send(user);
  }).catch((e)=>{
    res.status(400).send();
  });
});

app.delete('/users/me/token',authenticate,(req,res)=>{
  req.user.removeToken(req.token).then(()=>{
    res.status(200).send();
  },()=>{
    res.status(400).send();
  });
});
app.post('/add1',authenticate,(req,res)=>{
  var todo = new Todo({
    text: req.body.text,
    _creator:req.user._id
  });
  todo.save().then((doc)=>{
    res.send(doc);
  },(e)=>{
    res.status(400).send(e);
  });
});

//get todo by id
app.get('/todos/:id',authenticate,(req,res)=>{
  var id = req.params.id;
  Todo.findOne({
    _id:id,
    _creator:req.user._id
  }).then((doc)=>{
    res.send(doc);
  });
});
//delete by id
app.delete('/todos/:id',authenticate,(req,res)=>{
  var id = req.params.id;
  Todo.findOneAndRemove({
    _id:id,
    _creator:req.user._id
  }).then((doc)=>{
    res.send(doc);
  });
});
//update by id
app.patch('/todos/:id',authenticate,(req,res)=>{
  var id = req.params.id;
  var body = _.pick(req.body,['text','completed']);
  console.log(body);
  Todo.findOneAndUpdate({
    _id:id,
    _creator:req.user._id
  },{$set:body},{new:true}).then((todo)=>{
    res.send({todo});
  });
});

app.listen(port,(req,res)=>{
  console.log('server is running');
});
