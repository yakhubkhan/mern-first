require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers");





const port = process.env.PORT || 8000;

const static_path = path.join(__dirname, "../public");

const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

//------------dotenv-----------------

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index")
});
app.get("/secret", auth, (req, res) => {
    // console.log(`this is the cookie : ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/logout", auth, async (req, res) => {

    try {
        console.log(req.user);


        //---------for single logout------------
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !== req.token
        // })


        //-----------logout for all devices--------

        req.user.tokens = [];


        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
})

// ---------------------Registration Form----------------------

app.post("/register", async (req, res) => {
    try {

        const registerEmployee = new Register({
            Username: req.body.Username,
            password: req.body.password
        })

        const token = await registerEmployee.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 30000),
            httpOnly: true
        });

        const registered = await registerEmployee.save();
        res.status(201).render("index")

    } catch (error) {
        res.status(400).send(error);
    }
})


// ---------------login form---------------

app.post("/login", async (req, res) => {
    try {
        const Username = req.body.Username;
        const password = req.body.password;

        const Usernames = await Register.findOne({ Username: Username });

        const isMatch = await bcrypt.compare(password, Usernames.password);

        const token = await Usernames.generateAuthToken();
        console.log("the token part: " + token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            // secure:true
        });



        if (isMatch) {
            res.status(201).render("index");

        } else {
            res.send("Invalid Login Details")
        }

    } catch (error) {
        res.status(400).send("Invalid Login Details")
    }
})


// -----------------------Login form type 1---------------------

// app.post("/login" , async(req,res) => {

//     try {
//         const Username = req.body.Username;
//         const password = req.body.password;

//         const usernames = await Register.findOne({Username:Username});
//         res.send(usernames);
//         console.log(usernames);
//     }
//     catch (error) {
//         res.status(400).send("invalid email")
//     }
// })


// --------------------------bcryptjs------------------------


// const bcrypt = require("bcryptjs");

// const securePassword = async (password) => {

//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare(password,passwordHash);
//     console.log(passwordmatch);
// }

// securePassword("12345");



// --------------JSON TOKEN-------------

// const jwt = require("jsonwebtoken");

// const createToken = async() => {

//     const token = await jwt.sign({_id:"60ffb96306024723a842aac7"}, "mynameisyakhubkhanfromkodad", {
//         expiresIn: "20 seconds"
//     });
//     console.log(token);

//     const userverification = await jwt.verify(token, "mynameisyakhubkhanfromkodad");
//     console.log(userverification);
// }

// createToken();


app.listen(port, () => {
    console.log(`server is running at port no ${port}`)
})