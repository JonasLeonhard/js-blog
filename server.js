"use strict";

/*
 * BLOG APP- Jonas Leonhard 611179, Jole7181, Hochschule Flensburg
 * DESCRIPTION
 * DESCRIPTION
 * */

/*
 * ATTRIBUTES
 * */
const port = 3000; //server call with: localhost:port
const url = require("url");
const myUri =
  "http://benutzername:passwort@hostname:9090/pfad/zur/resource?argument=wert#textanker";

//routing Engine:
var express = require("express"),
  app = express(),
  entryRouter = express.Router(),
  userRouter = express.Router();

//render Engine:
const nunjucks = require("nunjucks"); //rendering Engine
const path = require("path");

//login Stuff:
var session = require("express-session"); //for staying logged in
var passport = require("passport"); //for login
var expressValidator = require("express-validator");
var LocalStrategy = require("passport-local").Strategy;
var multer = require("multer"); //for file uploads
var upload, uploadadd, storage; //for uploading/storing files- set in setup_multer
var flash = require("connect-flash");
var expressMessages = require("express-messages");

//Database:
const sqlite3 = require("sqlite3").verbose(); //import the sqlite module .verbose for long stack traces;

//External Controllers:
const controller = require("./src/blog/controller.js");
const formController = require("./src/blog/form-controller.js");
var bodyParser = require("body-parser"); //json encoding

//password encryption:
var bcrypt = require("bcryptjs");

/*
 * FUNCTIONS: Main
 * */
start()
  .catch(err => console.log(err))
  .then(test());

async function start() {
  setup_Twig();
  setup_Nunjucks();
  setup_Express();
  setup_Sessions();
  setup_Passport();
  setup_Validator();
  setup_ExpessFlash();
  setup_Multer();
  await initDB();
  server_Routing();
  server_Listen();
}

function hallo(callback) {
  console.log("hi");
  callback();
}
function test() {
  //stuff to do after start: print db ...
  controller.test();
}
function setup_Nunjucks() {
  nunjucks.configure({
    express: app,
    autoescape: true
  });
}

function setup_Multer() {
  //storage engine set:
  storage = multer.diskStorage({
    destination: "./views/uploads",
    filename: function(req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    }
  });
  setuploadregister();
  setuploadadd();
  //init upload profileimg
  /*
    upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb); //<-- check if file is allowed: jpeg, jpg, png, gif
    }
  }).single("form[profileimg]"); //<-- key from register form
    */
}

function setuploadregister() {
  //init upload profileimg
  console.log("setuploadregister");
  upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb); //<-- check if file is allowed: jpeg, jpg, png, gif
    }
  }).single("form[profileimg]"); //<-- key from register form
}

function setuploadadd() {
  console.log("setuploadadd");
  uploadadd = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb); //<-- check if file is allowed: jpeg, jpg, png, gif
    }
  }).single("form[postimg]"); //<-- key from register form
}

function checkFileType(file, cb) {
  //allowed extensions:
  console.log("CHECK FILE TYPE...");
  const filetypes = /jpeg|jpg|png|gif/;
  //check ext:
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}
function setup_Twig() {
  //specifiy views folder for use in html.twig to load css file
  app.use("/views", express.static("views"));
}

function setup_Sessions() {
  //setup sessions for login
  app.use(session({ secret: "secret", saveUninitialized: true, resave: true }));
}

function setup_Passport() {
  //setup Passport for login
  app.use(passport.initialize()); //<-- initialize authentication module
  app.use(passport.session()); //<-- alter request object to 'user' value that is current session id
}

function setup_Validator() {
  //code snipped from github.com/ctavan/express-validator
  // In this example, the formParam value is going to get morphed into form body format useful for printing.
  app.use(
    expressValidator({
      errorFormatter: function(param, msg, value) {
        var namespace = param.split("."),
          root = namespace.shift(),
          formParam = root;

        while (namespace.length) {
          formParam += "[" + namespace.shift() + "]";
        }
        return {
          param: formParam,
          msg: msg,
          value: value
        };
      }
    })
  );
}

function setup_ExpessFlash() {
  app.use(flash());
  app.use(function(req, res, next) {
    res.locals.messages = expressMessages(req, res);
    next();
  });
}
function setup_Express() {
  app.use(bodyParser());
  app.use(bodyParser.json()); // to support JSON-encoded bodies
  app.use(
    bodyParser.urlencoded({
      // to support URL-encoded bodies
      extended: true
    })
  );
}

function server_Routing() {
  //Anhand der URI wird die richtige Funktion in den Controllern aufgerufen
  //local variavle user for checking if logged in:
  app.get("*", function(req, res, callback) {
    res.locals.user = req.user || null;
    res.locals.message = req.flash();
    callback();
  });

  //Routing:
  app.get("/", homepage);
  app.get("/documentation", documentation);
  app.get("/impressum", impressum);

  app.use("/entry", entryRouter); //if url = /entry --> send to router, calls routers get method
  //entryRouter.get("/", _entry); // /entry
  // /entry with authentication check:
  entryRouter.get("/", function(req, res) {
    checkAuthenticated(req, res, function() {
      _entry(req, res);
    });
  });
  //entryRouter.get("/add", _entry_add);
  entryRouter.get("/add", function(req, res) {
    checkAuthenticated(req, res, function() {
      _entry_add(req, res);
    });
  });
  entryRouter.get("/:id", _entry_id);
  //entryRouter.get("/:id/edit", _entry_id_edit); // /entry/:id/...
  entryRouter.get("/:id/edit", function(req, res) {
    checkAuthenticated(req, res, function() {
      //_entry_id_edit(req, res);
      res.redirect(`/entry/${req.params.id}`);
    });
  });
  //entryRouter.get("/:id/delete", _entry_id_delete);
  entryRouter.get("/:id/delete", function(req, res) {
    checkAuthenticated(req, res, function(req, res) {
      _entry_id_delete(req, res);
    });
  });

  app.use("/user", userRouter);
  userRouter.get("/register", _register);
  userRouter.get("/login", _login);
  userRouter.get("/logout", _logout);
  userRouter.get("/get/:username", _showProfile);

  //called with forms - post:

  //router.get("/", checkAuthenticated(function(req,res,callback){
  //* res.render("/index.html.twig");
  //* });

  //app.post("/entry", _entry_add);
  //post with authentication check:
  /*
  app.post("/entry", function(req, res) {
    checkAuthenticated(req, res, function() {;
      _entry_add(req, res);
    });
  });
  */
  //entryRouter.post("/add", formController.handleAddFormular);
  //Register Upload: //req.file ist file --> oder req.file.filename = speichername
  userRouter.post("/add", function(req, res) {
    register_upload(req, res);
  });

  entryRouter.post("/:id/edit", function(req, res) {
    checkAuthenticated(req, res, function() {
      _entry_id_edit(req, res);
    });
  });
  entryRouter.post("/:id/edited", function(req, res) {
    checkAuthenticated(req, res, function() {
      formController.handleEditFormular(req, res);
    });
  });
  entryRouter.post("/:id/delete", formController.handleDeleteEditFormular);

  entryRouter.post("/:id/deletecomment/:commentid", function(req, res) {
    checkAuthenticated(req, res, function() {
      formController.handleDeleteComment(req, res);
    });
  });

  //called with forms - post:
  app.post("/user", _user);

  //Passport Login:
  passportSerializeUser();
  passportLocalStrategy();

  //only invokes local strategy if req.body.username
  userRouter.post(
    "/login",
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true
    }),
    function(req, res) {
      req.flash("loginsuccess", "You are now logged in");
      res.redirect("/");
    }
  );

  //Register Upload: //req.file ist file --> oder req.file.filename = speichername
  userRouter.post("/register", function(req, res) {
    register_upload(req, res);
  });

  entryRouter.post("/add", function(req, res) {
    checkAuthenticated(req, res, function() {
      add_upload(req, res);
    });

    //register_upload(req,res);
  });

  //when submiting comment:
  entryRouter.post("/:id/comment", function(req, res) {
    checkAuthenticated(req, res, function() {
      _entry_id_comment(req, res);
    });
  });

  //Catch all other Routes:
  app.get("/*", noroute);
}

function passportLocalStrategy() {
  /*
   * When the user submits the login form, a POST request to /login is made
   * resulting in the execution of the passport.authenticate middleware we've set up.
   *
   * As the authenticate middleware for that route is configured to handle the local strategy,
   * passport will invoke implementation of the local strategy.
   *
   * Passport takes the req.body.username and req.body.password and passes it to
   * our verification function in the local strategy.
   * Then: loading the user from the database and checking if
   * the password given matches the one in the database.
   *
   *
   * */

  passport.use(
    new LocalStrategy(function(username, password, callback) {
      console.log("local Strategy!");
      controller.getUserByUsername(username, function(err, user) {
        if (err) {
          console.log("localStrategy: err" + err);
          return callback(err);
        }

        //user not found:
        if (!user) {
          console.log("localStrategy: return !user: user not found");
          return callback(null, false, { message: "user not found" }); //<-- user not found
        }

        //compare login password to Database hashed-user.password
        controller.comparePassword(password, user.password, function(
          err,
          isValid
        ) {
          console.log(
            "localStrategy: compared input login password to database password of login user"
          );
          if (err) {
            console.log("localStrategy: comparePassword- ERR" + err);
            return callback(err); //<--- error comparing
          }
          if (!isValid) {
            console.log(
              "localStrategy: comparePasswrod- ERR: !isValid Password"
            );
            return callback(null, false, { message: "invalid password" }); //<-- passwords are not matching
          }

          return callback(null, user); //<-- user where: loginform userdata == database userdata -call passport serialize user
        });
      });
    })
  );
}

function passportSerializeUser() {
  //invoked on authentication: serialize user with the information we pass to it: (user id), store it in the session with a cookie
  //called after localstrategy
  passport.serializeUser(function(user, cb) {
    console.log("SERIALIZE USER");
    cb(null, user.userid);
  });

  //on request to deserialize instance, providing cookie as credencial
  passport.deserializeUser(function(id, cb) {
    controller.getUserById(id, function(err, user) {
      //console.log("DESERIALIZE USER");
      cb(err, user);
    });
  });
}

function checkAuthenticated(req, res, callback) {
  /*use case:
   * router.get("/", checkAuthenticated(function(req,res,callback){
   * res.render("/index.html.twig");
   * });
   * */
  console.log("checkAuthentication...");
  if (req.isAuthenticated()) {
    console.log("isAuthenticated");
    return callback();
  }
  console.log("notAuthenticated");
  res.redirect("/user/login");
}

function register_upload(req, res) {
  //called in userRouter - /user/register post, uses upload object to handle error with uploading,
  // puts uploaded file with userdata into database
  upload(req, res, function(err) {
    if (err) {
      console.log("ERROR: Wrong FileType-");
      res.render("./views/user_register.html.twig", {
        msg: "Error: wrong filetype!"
      });
    } else {
      //no error while uploading- put user in database with profileimg
      if (!req.file) {
        console.log("ERROR: no file selected-");
      }
      formController.handleRegisterFormular(req, res);
    }
  });
}

function add_upload(req, res) {
  //called in entryRounter - /entry/add post, user upload object to handle error with uploading,
  //put uploaded file with blogdata into database
  console.log("IN ADDUPLOAD!!!");
  uploadadd(req, res, function(err) {
    if (err) {
      console.log("ERROR: Wrong FileType-");
      res.render("./views/entry_add.html.twig", {
        msg: "Error: wrong filetype!"
      });
    } else {
      //not error while uploading- put post in database with postimg
      if (!req.file) {
        console.log("ERROR: no file selected-");
      }
      formController.handleAddFormular(req, res);
    }
  });
}
function server_Listen() {
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

/*
 * FUNCTIONS: Secondary
 * */

function isNumeric(num) {
  //checks if num is numeric: isNaN('foo')//true  --> !num
  return !isNaN(num);
}

function initDB() {
  //open a databse object:
  return new Promise((resolve, reject) => {
    controller.initDB(function(db) {
      if (db) {
        resolve();
      } else {
        reject("ERROR: db == null " + db);
      }
    });
  });
}

function closeDB(db) {
  //close database when done with it-->
  this.db.close(err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("\n");
    console.log("...Closed the database connection.");
  });
}

/*
 * ROUTING: called in server_Routing
 * */
function noroute(req, res) {
  res.send(
    `ERROR: 404 - The requested URL was not found on the server: -->${
      req.url
    }<-- `
  );
}
function homepage(req, res) {
  controller.home(req, res);
}

function _entry(req, res) {
  controller.entry(req, res);
}

function _entry_id_edit(req, res) {
  console.log("ENTRYIDEDIT");
  if (isNumeric(req.params.id)) {
    controller.entry_id_edit(req, res);
  } else {
    res.send("ERROR- entry/:id/edit !isNumeric");
  }
}

function _entry_id_delete(req, res) {
  if (isNumeric(req.params.id)) {
    controller.entry_id_delete(req, res);
  } else {
    res.send("ERROR: entry/:id/delete !isNumeric");
  }
}

function _entry_add(req, res) {
  controller.entry_add(req, res);
}

function _entry_id(req, res) {
  if (isNumeric(req.params.id)) {
    controller.entry_id(req, res);
  } else {
    req.flash("error", "entry/:id is not numeric");
    res.redirect("/");
  }
}

function _entry_id_comment(req, res) {
  controller.entry_id_comment(req, res);
}

function _showProfile(req, res) {
  controller.showUserProfile(req, res);
}

function _register(req, res) {
  controller.user_register(req, res);
}

function _login(req, res) {
  controller.user_login(req, res);
}

function _logout(req, res) {
  if (req.user) {
    console.log("user: " + req.user.username + " -log out");
    req.logout();
    req.flash("logoutsuccess", "You are now logged out");
  } else {
    console.log("already logged out");
  }
  res.redirect("/user/login");
  //controller.user_logout(req, res);
}

function _user(req, res) {
  controller.user(req, res);
}

function documentation(req, res) {
  res.render("./views/documentation.html");
}

function impressum(req, res) {
  res.render("./views/impressum.html");
}
