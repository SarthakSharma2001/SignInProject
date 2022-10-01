const express = require("express");
const request = require("request");
const crypto = require("crypto");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const hash = require("./util/hash");

const app = express();

app.use(express.static(__dirname + "/public"));

const User = require("./models/UserSchema");

app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const dbURL = "mongodb://localhost:27017/SignInProject";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/sign-in.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/registration.html");
});

app.post("/register", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  hashed_password = hash(password);

  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    } else {
      const newUser = new User({
        password: hashed_password,
        email: email,
      });
      newUser.save();
      return res.status(200).json({ message: "Successful Register" });
    }
  });
});

app.post("/login-validator", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  hashed_password = hash(password);

  //Find user by Email
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    else if (hashed_password != user.password) {
      return res.status(404).json({ message: "Password Does not Match" });
    }
    else {
      return res.status(200).json({ message: "Success Login" });
    }    
  });
});

app.listen(PORT, () => {
  console.log("listening at localhost:" + PORT);
});
