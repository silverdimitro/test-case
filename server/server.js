
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const _ = require('lodash');
const port=process.env.PORT || 3000;

var {Todo} = require('./models/todos');
var {mongoose} = require('./db/dbConnection');
var {ObjectID} = require('mongodb');
var {User} = require('./models/users');
var {authenticate}=require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());
app.set('view engine','hbs');
app.get('/',(req,res)=>{
  Todo.find().then((doc)=>{
    res.send(doc);
  });

});
app.post('/adduser',(req,res)=>{
  var body = _.pick(req.body,['email','password']);
  console.log(body);
  var user = new User(body);
  console.log(user);
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





app.post('/add1',(req,res)=>{
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc)=>{
    res.send(doc);
  },(e)=>{
    res.status(400).send(e);
  });
});

//get todo by id
app.get('/todos/:id',(req,res)=>{
  var id = req.params.id;
  Todo.findById(id).then((doc)=>{
    res.send(doc);
  });
});
//delete by id
app.delete('/todos/:id',(req,res)=>{
  var id = req.params.id;
  Todo.findByIdAndRemove(id).then((doc)=>{
    res.send(doc);
  });
});
//update by id
app.patch('/todos/:id',(req,res)=>{
  var id = req.params.id;
  var body = _.pick(req.body,['text','completed']);
  console.log(body);
  Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
    res.send({todo});
  });
});

app.listen(port,(req,res)=>{
  console.log('server is running');
});
