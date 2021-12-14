require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const sgTransport = require("nodemailer-sendgrid-transport");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

const router = express.Router();

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).array("image", 20);

router.get("/", (req, res) => {
  res.render("userArticle");
});

router.post("/", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.end("Something went wrong!");
    } else {
      const fullname = `${req.body.fname} ${req.body.lname}`;
      const subject = req.body.topic;
      const email = req.body.email;
      const text = req.body.headline;
      const markdown = req.body.markdown;

      const attach = [];
      const files = req.files;
      console.log(files);

      //   console.log(`attach array object ${attach}`);
      files.forEach((file) => {
        attach.push({
          filename: `${file.filename}`,
          path: `${file.path}`,
        });
      });

      const transporter = nodemailer.createTransport(
        sgTransport({
          auth: {
            api_key: process.env.PASSWORD,
          },
        })
      );

      var mailOptions = {
        from: "conquerorraj2626@gmail.com",
        to: "mohanraj.2k00@gmail.com",
        subject: `${subject} fullname ${fullname}`,
        html: `<p> email : ${email} </br> <h3> headline${text}</h3> </br><h6>${markdown}<h6></p>`,
        attachments: attach,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          console.log(files);
          console.log("Success !!");
          res.redirect("/");
        }
      });
    }
  });
});

module.exports = router;
