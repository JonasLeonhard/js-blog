"use strict";
/*showcls a formular to edit a post*/

var model = require("./model.js");
var multer = require("multer"); //for file uploads
var upload = multer({ dest: "./public/uploads/}" });
var expressValidator = require("express-validator");
var flash = require("connect-flash");

module.exports = {
  test: function() {
    console.log("Form-Controller: TEST!");
  },

  showEditFormular: function(req, res) {
    console.log("form-controller: showEditFormular");
    model.getPost(req.params.id, function(data) {
      res.render("./views/entry_id_edit.html.twig", { data: data });
    });
  },
  handleAddFormular: function(req, res) {
    console.log("handleAddFormular");
    if (req.file) {
      var postimg = req.file.filename;
    } else {
      var postimg = null;
    }

    if (
      req.body.form.title != "" &&
      req.body.form.blogText != "" &&
      req.body.form.teaserText != ""
    ) {
      //title, blogText, publishDate, teaserText, callback
      model.createPost(
        req.body.form.title.toString(),
        req.body.form.blogText.toString(),
        date(),
        req.body.form.teaserText.toString(),
        req.user.username,
        postimg,
        function() {
          res.redirect("/");
        }
      );
    } else {
      if (req.body.form.title == "") {
        //data.title = "required!"; //SET REQUIRED
        console.log("EMPTRY TITLE ERROR!:");
        req.flash("error", `title is required!`);
      }
      if (req.body.form.blogText == "") {
        //data.blogText = "required"; //SET REQUIRED
        req.flash("blogtxterror", `blogText is required!`);
      }
      if (req.body.form.teaserText == "") {
        //data.teaserText = "required"; //SET REQUIRED
        req.flash("teasertxterror", `teaserText is required!`);
      }
      res.redirect("/entry");
    }
  },

  handleEditFormular: function(req, res) {
    console.log(
      "handleeditformular " + req.params.id,
      req.body.form.title,
      req.body.form.blogText,
      date()
    );

    model.getPost(req.params.id, function(data) {
      if (
        req.body.form.title != "" &&
        req.body.form.blogText != "" &&
        req.body.form.teaserText != ""
      ) {
        //id, title, blogText, publishDate, teaserText, username,postimg, callback
        model.changePost(
          req.params.id.toString(),
          req.body.form.title.toString(),
          req.body.form.blogText.toString(),
          date(),
          req.body.form.teaserText.toString(),
          req.user.username,
          data.postimg,
          function() {
            //redirect to start page:
            res.redirect("/");
          }
        );
      } else {
        if (req.body.form.title == "") {
          data.title = "required!";
        }
        if (req.body.form.blogText == "") {
          data.blogText = "required";
        }
        if (req.body.form.teaserText == "") {
          data.teaserText = "required";
        }

        res.render("./views/entry_id_edit.html.twig", { data: data });
      }
    });
  },
  handleDeleteEditFormular: function(req, res) {
    console.log("handleDeleteEditFormular");
    //check privelege here?
    model.deletePost(req.params.id, function() {
      res.redirect("/");
    });
  },

  handleDeleteComment: function(req, res) {
    console.log("formcontroller handledeletecomment" + req.params.commentid);
    //userid comment

    //postid userid comment
    model.deleteComment(req.params.commentid, function() {
      res.redirect("/entry/" + req.params.id);
    });
  },

  handleRegisterFormular: function(req, res) {
    //called after sending register formular and handling upload of profileimg 'req.file'
    var name = req.body.form.name;
    var username = req.body.form.username;
    var email = req.body.form.email;
    var password = req.body.form.password;
    var confirmpassword = req.body.form.confirmpassword;

    if (req.file) {
      var profileimg = req.file.filename;
    } else {
      var profileimg = "noimage.png";
    }

    //Form Validation:
    req.checkBody("form[name]", "name is required").notEmpty();
    req.checkBody("form[email]", "email is required").notEmpty();
    req.checkBody("form[email]", "email is no email").isEmail();
    req.checkBody("form[username]", "username is required").notEmpty();
    req.checkBody("form[password]", "password is required").notEmpty();
    req
      .checkBody("form[confirmpassword]", "confirmpassword is required")
      .notEmpty();
    req
      .checkBody("form[password]", "passwords not matching")
      .equals(req.body.form.confirmpassword);

    //check validation errors:
    var errors = req.validationErrors();

    //check if username is taken:
    var usernametaken = true;
    model.userNametaken(username, function(taken) {
      if (!taken) {
        usernametaken = false;
      }

      //error handling:
      if (errors || usernametaken) {
        console.log(errors);
        res.render("./views/user_register.html.twig", {
          errors: errors,
          usernametaken: usernametaken,
          name: name,
          email: email,
          username: username,
          profileimg: profileimg
        });
      } else {
        //no errors:
        model.createUser(name, username, email, password, profileimg, function(
          err
        ) {
          if (!err) {
            console.log("created user with register formular");
            req.flash(
              "createUsersuccess",
              `${username} is now registered, login with your accountdata`
            );
            res.redirect("/user/login");
          } else {
            console.error(err);
            res.send(err);
          }
        });
      }
    }); //end username taken
  }, //end handle register formular

  handleLoginFormular: function() {
    //called on post routing: /user/login
  }
};

function date() {
  //iso formatted date
  var today = new Date();
  console.log("MONTH:" + today.getMonth() + 1);
  //var month = today.getMonth()+1;
  if (today.getMonth() + 1 < 10) {
    var month = `0${today.getMonth() + 1}`;
    console.log("FORMATTED" + month);
  } else {
    var month = today.getMonth() + 1;
  }

  if (today.getMinutes() < 10) {
    var min = `0${today.getMinutes()}`;
  } else {
    var min = today.getMinutes();
  }

  if (today.getSeconds() < 10) {
    var sec = `0${today.getSeconds()}`;
  } else {
    var sec = today.getSeconds();
  }

  if (today.getHours() < 10) {
    var hour = `0${today.getHours()}`;
  } else {
    var hour = today.getHours();
  }

  if (today.getDate() < 10) {
    var date = `0${today.getDate()}`;
  } else {
    var date = today.getDate();
  }

  today = `${today.getFullYear()}-${month}-${date}T${hour}:${min}:${sec}Z`;
  //return today;
  return today;
}
