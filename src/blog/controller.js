"use strict";

const sqlite3 = require("sqlite3").verbose();
var model = require("./model.js");

var Twig = require("twig"), //Twig module
  twig = Twig.twig; // render function
var formcontroller  = require("./form-controller");

module.exports = {
  initDB: function(callback) {
    model.initDB(function(db) {
      callback(db);
    });
  },

  getDB: function() {
    model.getDB();
  },

  test: function() {
      /*
    model.postasArray(function(data) {
      console.log(Array.isArray(data)); //<-- returns an array
      data.forEach(element => {
        console.log(element); //<-- log each element
      });
    });
    */

    /*
    model.getUser(1, function (row) {
          console.log(row);
    });
    */


    //<-- if(!err) --> no error
      /*
    model.createUser("jonas", "jns3_username", "stts@gmail.com", "pw", "public/uploads/noimage.png", function (err) {
      if(!err)
      {
      console.log("created new User");
      }
    });
    */
      /*
      model.changeUser("2", "jonas", "jns3_username", "stts@gmailchanged.com", "pw", "public/uploads/changed.png", function (err) {

      });
      */

    /*
    model.userNametaken("createtest2", function (taken) {
      console.log("TAKEN: "+taken)
        if (taken) {
            console.log("ERROR: username is taken");
        } else
        {
          console.log("username is NOT taken!!");
        }
    });
    */
    /*
    model.userasArray(function (data) {
        data.forEach(element => {
          console.log(element);
        });
    });
    */
    /*
    model.createComment(1,1, "co11233123", function (err) {
        if(err)
        {
          console.log(err);
        }
    });
    */

    /*
    model.getCommentsByPostId(1, function (row) {
        console.log("TEST***+"+row);
        row.forEach(element => {
          console.log(element);
        });
     });
     */
  },


  home: function(req, res) {
    console.log("Controller: /");
    model.postasArray(function (data) {
      model.sortArrrayByDate(data, function (sorted) {

          sorted.forEach(element => {
              //console.log("DATE::"+element.publishDate);
              element.publishDate = new Date(`${element.publishDate}`);
              //console.log("DATE:FORMATED:"+element.publishDate.getFullYear()+element.publishDate.getDay()+element.publishDate.getMonth());
          });
          res.render("./views/index.html.twig", {data: sorted});
      });
    });
  },

  entry: function(req, res) {
    console.log("Controller: /entry");
      res.render("./views/entry_add.html.twig");
  },

  entry_add: function(req, res) {
    console.log("Controller: /entry/add");
      res.render("./views/entry_add.html.twig");
  },
  entry_id: function(req, res) {
    console.log("Controller: /entry/:id");
      model.getPost(req.params.id, function (post) {
          model.getCommentsByPostId(req.params.id,function (comment) {
              post.publishDate = new Date(`${post.publishDate}`);
                  res.render("./views/entry_id.html.twig", {data: post, comment: comment});
          });
      });

  },
  entry_id_edit: function(req, res) {
    console.log("Controller: /entry/:id/edit");
    //res.send(`/entry/:id= ${req.params.id}/edit`);
    formcontroller.showEditFormular(req,res);
  },

  entry_id_delete: function(req, res) {
    console.log("Controller: /entry/:id/delete");
    res.send(`entry/:id = ${req.params.id}/delete router`);
  },

    entry_id_comment: function(req, res){
    console.log("COntroller: /entry/comment User:" +req.user.username+ "|Userid" + req.user.userid +"|postid:"+req.params.id+ "|comment:" +req.body.form.comment);
      model.createComment(req.params.id, req.user.userid, req.body.form.comment, function () {
          res.redirect(`/entry/${req.params.id}`);
      });
    },

  user_register: function (req, res) {
      //res.send("/register");
      res.render("./views/user_register.html.twig", {pagetitle: "user_register"});
  },
    
    user_login: function (req,res) {
        res.render("./views/user_login.html.twig", {pagetitle:"user_login"});
    },
    
    user_logout: function (req,res) {
        res.send("/logout");
    },

    user: function (req,res) {
        res.send("/user");
    },

    showUserProfile: function(req, res){
      console.log("profile of "+ req.params.username);
      model.getUserByUsername(req.params.username, function (err, row) {
          res.render("./views/user_profile.html.twig", {pagetitle: "Profile: "+req.params.username, userprofile: row, error: err});
      });

    },
    
    getUserByUsername: function (username,callback) {
        //console.log("controller passport TEST");
      model.getUserByUsername(username, callback);
    },

    comparePassword: function(candidatePassword, hash, callback){
      console.log("Controller comparePassword: comparing: "+candidatePassword +" : "+hash);
     model.comparePassword(candidatePassword, hash, function (err, isMatch) {
         callback(err,isMatch);
     });
    },

    getUserById: function (id, callback) {
        //console.log("passport TEST");
        model.getUserById(id, callback);
    }
};
