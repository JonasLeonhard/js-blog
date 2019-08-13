"use strict";
var sqlite3 = require("sqlite3").verbose();
//password encryption:
var bcrypt = require("bcryptjs");
let db;

function sortNumber(a, b) {
  //sort Data Array by Date, descending order
  /*
    console.log(
    "sortArrayByDate, comparing:" + a.publishDate + " | " + b.publishDate
  );
  */
  if (b.publishDate < a.publishDate) {
    return -1;
  } else if (b.publishDate > a.publishDate) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = {
  test: function() {
    db.get(`SELECT * FROM post`, (e, r) => {
      console.log("MODEL_DATABASE_TEST():" + r.title);
    });
  },

  initDB: function(callback) {
    db = new sqlite3.Database(
      "./src/blog/blog.db",
      sqlite3.OPEN_READWRITE,
      err => {
        if (err) {
          console.log(err);
        } else {
          console.log("Created SQlite database");
          callback(db);
        }
      }
    );
  },

  getDB: function() {
    if (!db) {
      console.log("ERROR: db: null" + db);
    }
    return db;
  },

  initializeTable: function() {
    //initialize Database Table if not existing: post(title, blogText, publishDate);
    db.run(
      `CREATE TABLE IF NOT EXISTS post(
        postid PRIMARY KEY,title VARCHAR(45), blogText VARCHAR(300) , publishDate VARCHAR(20));`
    );
  },

  postasArray: function(callback) {
    //return each post in Database as Array:
    db.serialize(function() {
      db.all(
        "SELECT * FROM post JOIN user ON post.username = user.username",
        function(err, rows) {
          if (err) {
            console.log(err);
            callback(err);
          }
          console.log("get DB: post - as Array");
          callback(rows);
        }
      );
    });
  },

  userasArray: function(callback) {
    //return each user in DB as array:
    db.serialize(function() {
      db.all("SELECT * FROM user", function(err, rows) {
        if (err) {
          console.log(err);
          callback(err);
        }
        console.log("get DB: user- as Array");
        callback(rows);
      });
    });
  },

  sortArrrayByDate: function(data, callback) {
    //sort data by Date- most recent first, called in controller before rendering html.twig
    data.sort(sortNumber);
    console.log("callback - Array sorted");
    callback(data);
  },

  getPost: function(id, callback) {
    //get one post in Database by id
    db.serialize(function() {
      //get post

      db.get(
        `SELECT * FROM user JOIN post ON user.username = post.username WHERE post.postid = ${id}`,
        function(err, row) {
          if (!row) {
            console.log("ERROR: getpost:" + err);
          }
          //console.log("model.getpost()"+row);
          callback(row);
        }
      );
    });
  },

  getUser: function(id, callback) {
    //get user in DB by id
    db.serialize(function() {
      db.get(`SELECT * FROM user WHERE user.userid = ${id}`, function(
        err,
        row
      ) {
        if (!row) {
          console.log("ERROR: getUser: " + err);
        }
        callback(row);
      });
    });
  },

  getUserById: function(id, callback) {
    //specially to return with error object for passport:
    db.serialize(function() {
      db.get(`SELECT * FROM user WHERE user.userid = ${id}`, function(
        err,
        row
      ) {
        if (!row) {
          console.log("ERROR: getUser: " + err);
        }
        callback(err, row);
      });
    });
  },

  deletePost: function(id, callback) {
    //delete one post in Dataabase by id
    db.serialize(function() {
      db.run(`DELETE FROM post WHERE post.postid= ${id}`, function(err) {
        if (err) {
          console.error("ERROR: DELETION_ERROR" + err);
        }
        console.log(`Row(s) deleted ${this.changes}`);
        callback();
      });
    });
  },

  deleteUser: function(id, callback) {
    //delete on user in DB by id
    db.serialize(function() {
      db.run(`DELETE FROM user WHERE user.userid = ${id}`, function(err) {
        if (err) {
          console.error("ERROR: DELETION_ERROR" + err);
        }
        console.log(`Row(s) deleted ${this.changes}`);
        callback();
      });
    });
  },

  createPost: function(
    title,
    blogText,
    publishDate,
    teaserText,
    username,
    postimg,
    callback
  ) {
    db.serialize(function() {
      db.run(
        `INSERT INTO post(
        title,
        blogText,
        publishDate,
        teaserText,
        username,
        postimg)
        VALUES
        (
        "${title}",
        "${blogText}",
        "${publishDate}",
        "${teaserText}",
        "${username}",
        "${postimg}"
        )`,
        function(err) {
          if (err) {
            console.error("ERROR: CREATE_POST_ERROR" + err);
          } else {
            console.log(
              "Row created 1-> +ID!!" +
                " | " +
                title +
                " | " +
                blogText +
                " | " +
                publishDate +
                " | " +
                teaserText +
                " | " +
                username +
                " | " +
                postimg
            );
          }
          callback();
        }
      );
    });
  },

  createUser: function(name, username, email, password, profileimg, callback) {
    //create user: id INTEGER PRIMARY KEY AUTOINCREMENT,
    // name VARCHAR(45),
    // username VARCHAR(45),
    // email VARCHAR(45),
    // password VARCHAR(100))
    // profileimg VARCAHR(100)`
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        //store hash in your password db + rest of user
        db.serialize(function() {
          db.run(
            `
      INSERT INTO user(
      name, 
      username,
      email,
      password,
      profileimg)
      VALUES(
      "${name}",
      "${username}",
      "${email}",
      "${hash}",
      "${profileimg}"
      )`,
            function(err) {
              if (err) {
                console.error("ERROR: CREATE_USER_ERROR " + err);
                callback(err);
              } else {
                console.log(
                  "Row created 1-> +ID!!" +
                    " | " +
                    name +
                    " | " +
                    username +
                    " | " +
                    email +
                    " | " +
                    password +
                    " | " +
                    hash +
                    " | " +
                    profileimg
                );
              }
              callback(err);
            }
          );
        });
      });
    });
  },

  createComment(postid, userid, comment, callback) {
    db.serialize(function() {
      db.run(
        `INSERT INTO comment(
          postid,
          userid,
          comment
          )VALUES(
          ${postid},
          ${userid},
          "${comment}"
          )`,
        function(err) {
          if (err) {
            console.log("CREATE COMMENT ERROR");
          } else {
            console.log("CREATE COMMENT: " + userid + comment);
          }
          callback(err);
        }
      );
    });
  },

  getCommentsByPostId(postid, callback) {
    //commentid INTEGER PRIMARY KEY AUTOINCREMENT, postid INTEGER, userid INTEGER comment VARCHAR(500))
    db.serialize(function() {
      //get post

      db.all(
        `SELECT * FROM comment JOIN user ON comment.userid = user.userid WHERE comment.postid = ${postid}`,
        function(err, row) {
          if (!row) {
            console.log("ERROR: getpost:" + err);
          }
          console.log("GETCOMMENTS:::: " + row);
          callback(row);
        }
      );
    });
  },

  deleteComment(commentid, callback) {
    //postid, userid, comment
    db.serialize(function() {
      db.run(
        `DELETE FROM comment WHERE comment.commentid = ${commentid}`,
        function(err) {
          if (err) {
            console.error("ERROR: DELETION_ERROR" + err);
          }
          console.log(`Row(s) deleted ${this.changes}`);
          callback();
        }
      );
    });
  },

  changePost: function(
    id,
    title,
    blogText,
    publishDate,
    teaserText,
    username,
    postimg,
    callback
  ) {
    db.serialize(function() {
      db.run(
        `UPDATE post
                    SET title = "${title}",
                    blogText = "${blogText}",
                    publishDate = "${publishDate}",
                    teaserText = "${teaserText}",
                    username = "${username}",
                    postimg = "${postimg}"
                    WHERE postid = ${id};
                    `,
        function(err) {
          if (err) {
            console.error("ERROR: CHANGE_POST_ERROR" + err);
          } else {
            console.log(
              "Row changed 1 -SET--> " +
                id +
                " | " +
                title +
                " | " +
                blogText +
                " | " +
                publishDate +
                " | " +
                teaserText +
                " | " +
                postimg
            );
            callback();
          }
        }
      );
    });
  },

  changeUser: function(
    id,
    name,
    username,
    email,
    password,
    profileimg,
    callback
  ) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        db.serialize(function() {
          db.run(
            `UPDATE user
                    SET name = "${name}",
                    username = "${username}",
                    email = "${email}",
                    password = "${hash}",
                    profileimg = "${profileimg}"
                    WHERE userid = ${id};
                    `,
            function(err) {
              if (err) {
                console.error("ERROR: CHANGE_USER_ERROR" + err);
              } else {
                console.log(
                  "Row changed 1 -SET--> " +
                    id +
                    " | " +
                    name +
                    " | " +
                    username +
                    " | " +
                    email +
                    " | " +
                    password +
                    " | " +
                    hash +
                    " | " +
                    profileimg
                );
                callback();
              }
            }
          );
        });
      });
    });
  },

  userNametaken: function(username, callback) {
    //used to check if the username is already taken
    //get one user in Database by username,
    //returns !obj if username is taken, returns obj if username is not taken
    db.serialize(function() {
      db.get(
        `SELECT * FROM user WHERE user.username = ${"'" + username + "'"}`,
        function(err, row) {
          if (!row) {
            console.log("Success: Username is Not taken!");
            callback();
          } else {
            console.log(row.username);
            callback("ERROR: username is taken!");
          }
        }
      );
    });
  },

  getUserByUsername: function(username, callback) {
    //get the user by username, returns row in callback: for passport
    db.serialize(function() {
      db.get(
        `SELECT * FROM user WHERE user.username = ${"'" + username + "'"}`,
        function(err, row) {
          if (!row) {
            console.log("ERROR: cant find User by username");
            callback("cant find User by Username: /" + username, row);
          } else {
            console.log("Found User by Username: " + username);
            callback(err, row);
          }
        }
      );
    });
  },

  comparePassword: function(candidatePassword, hash, callback) {
    //
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      console.log(isMatch);
      callback(null, isMatch);
    });
  }
};
