const express = require("express");
const jwt = require("jwt-simple");
const cors = require("cors");
const bodyParser = require("body-parser");
const users = require("./users");
const config = require("./config");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const knexFile = require("./knexfile")["development"];
const knex = require("knex")(knexFile);

const authClass = require("./auth")(knex);

app.use(authClass.initialize());

app.post("/api/login", async function (req, res) {
  if (req.body.email && req.body.password) {
    console.log(req.body.email, req.body.password);
    var email = req.body.email;
    var password = req.body.password;
    var user = users.find((u) => {
      return u.email === email && u.password === password;
    });
    if (user) {
      var payload = {
        id: user.id,
      };
      var token = jwt.encode(payload, config.jwtSecret);
      res.json({
        token: token,
      });
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }

  console.log("start");
  // if (req.body.email && req.body.password) {
  //     let email = req.body.email;
  //     let password = req.body.password;
  //     console.log(email, password)

  //     let query = await knex
  //     .select('id', 'email', 'password')
  //     .from('users')
  //     .where('email', email)
  //     .andWhere('password', password)
  //     .returning('id')
  //     await query

  //     if (query) {
  //         console.log('start with user')

  //         let payload = {
  //             id: query[0].id
  //         }
  //         let token = jwt.encode(payload, config.jwtSecret);
  //         res.json({
  //             token: token
  //         });
  //     } else {
  //         res.sendStatus(401);
  //     }
  // } else {
  //     res.sendStatus(401);

  // }
});

app.post("/api/login/facebook", function (req, res) {
  console.log(req.body);
  if (req.body.access_token) {
    var accessToken = req.body.access_token;

    axios
      .get(
        `https://graph.facebook.com/me?access_token=${accessToken}`
      )
      .then((data) => {
        if (!data.data.error) {
          var payload = {
            id: accessToken,
          };
          users.push({
            id: accessToken, // better to use DB auto increment ID
            name: "Facebook User", // better to use data or profile to check the facebook user name
            email: "placeholder@gmail.com", // better to use data or profile to check the email
            password: "",
          });
          // Return the JWT token after checking
          var token = jwt.encode(payload, config.jwtSecret);
          res.json({
            token: token,
            // optionally provide also the user id to frontend
          });
        } else {
          res.sendStatus(401);
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(401);
      });
  } else {
    res.sendStatus(401);
  }
});

app.get(
  "/api/information",
  authClass.authenticate(),
  (req, res) => {
    console.log("getting information");
    const information = {
      content:
        "Well this is important information from the backend",
      title: "Backend Info",
    };
    res.json(information);
  }
);

app.listen(8080, () => {
  console.log("App is listening to port 8080");
});
