"use strict";

/*
 * Initialize Database - cannot be called from Web
 * Create a Database with basic tables to work with:
 * TABLE post(id PRIMARY KEY,title VARCHAR(45), blogText VARCHAR(300) , publishDate VARCHAR(20))
 * */

var sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./src/blog/blog.db");
/*
 * CREATE SQLITE3 DATABASE:
 * */
initDB().catch(err => console.log(err));

async function initDB() {
  await createDB();
  await createTables();
  await createUserTables();
  await createCommentTables();
  //await fillTables(); //test data
  //await fillUserTable(); //test data
  //await fillCommentTable(); //test data
  await printDB();
  await printUserDB();
  closeDB();
}

function createDB() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database("./src/blog/blog.db");
    if (db) {
      console.log("created Database..." + db);
      resolve();
    } else {
      reject("Error: CREATE_DATABASE_ERROR: db == null");
    }
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS post(
        postid INTEGER PRIMARY KEY AUTOINCREMENT,title VARCHAR(45), blogText VARCHAR(1000) , publishDate DATETIME, teaserText VARCHAR(300), username VARCHAR(45), postimg VARCHAR(100))`,
      function(err) {
        if (!err && db) {
          console.log("created tables...");
          resolve();
        } else {
          reject(err);
        }
      }
    );
  });
}

function createUserTables() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS user(
    userid INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(45), username VARCHAR(45) UNIQUE, email VARCHAR(45), password VARCHAR(100), profileimg VARCHAR(100))`,
      function(err) {
        if (!err && db) {
          console.log("created User Table...");
          resolve();
        } else {
          reject(err);
        }
      }
    );
  });
}

function createCommentTables() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS comment(
      commentid INTEGER PRIMARY KEY AUTOINCREMENT, postid INTEGER, userid INTEGER, comment VARCHAR(500))`,
      function(err) {
        if (!err && db) {
          console.log("created comment Table");
          resolve();
        } else {
          reject(err);
        }
      }
    );
  });
}

function fillTables() {
  return new Promise((resolve, reject) => {
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
 "Welcome",
 "This is a Blog",
 "2013-08-02T10:20:08Z",
 "TEASERTEXT1",
 "jns_username",
 null
 ),
 (
 "Welcome again",
 "This is another Post",
 "2014-08-02T10:20:08Z",
 "TEASERTEXT2",
 "jns_username",
 null
 ),
 (
 "Welcome you!",
 "This Post is very special",
 "2015-08-02T10:20:08Z",
 "TEASERTEXT3",
 "jns_username",
 "/public/uploads/noimage.png"
 )
 ;
`,
      function(err) {
        if (!err && db) {
          console.log("filled tables...");
          resolve();
        } else {
          console.log("filled tables ERROR");
          reject(err);
        }
      }
    );
  });
}

function fillUserTable() {
  //name(Varchar45), username VARCHAR(45), email VARCHAR(45), password VARCHAR(100), profileimg VARCHAR(100)
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO user(
      name,
      username,
      email,
      password,
      profileimg)
      VALUES
      (
      "jonas",
      "jns_username",
      "jonasleonhardfl@gmail.com",
      "password",
      "/public/uploads/noimage.png"
      )
      ;
      `,
      function(err) {
        if (!err && db) {
          console.log("filled User Table...");
          resolve();
        } else {
          console.log("filled User Table ERROR");
          reject(err);
        }
      }
    );
  });
}

function fillCommentTable() {
  //commentid INTEGER PRIMARY KEY AUTOINCREMENT, postid INTEGER, userid INTEGER comment VARCHAR(500))
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO comment(
      postid,
      userid,
      comment
      )
      VALUES
      (
      1,
      1,
      "comment test"
      )
      ;
      `,
      function(err) {
        if (!err && db) {
          console.log("filled comment table");
          resolve();
        } else {
          console.log("comment table err" + err);
          reject(err);
        }
      }
    );
  });
}
function printDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log("DATA IN 'post' : ");
      db.all("SELECT * FROM post", function(err, rows) {
        rows.forEach(function(row) {
          console.log(
            row.id +
              " " +
              row.title +
              " " +
              row.blogText +
              " " +
              row.publishDate +
              " " +
              row.username +
              " " +
              row.postimg
          ); // and other columns, if desired
        });

        if (!err && db) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  });
}

function printUserDB() {
  //name,
  //       username,
  //       email,
  //       password

  return new Promise((resolve, reject) => {
    console.log("TESTETATTAEETET");
    db.serialize(() => {
      console.log("DATA IN 'user' : ");
      db.all("SELECT * FROM user", function(err, rows) {
        rows.forEach(function(row) {
          console.log(
            row.id +
              " " +
              row.name +
              " " +
              row.username +
              " " +
              row.email +
              " " +
              row.password +
              " " +
              row.profileimg
          );
        });

        if (!err && db) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  });
}

function closeDB() {
  db.close();
  console.log("closed database.");
}
