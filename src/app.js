require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs')
const app = express();
const port = process.env.PORT || 8000;
require("./db/conn");
const Register = require("./models/registers");
const cookieParser = require('cookie-parser'); 
const auth = require('./middleware/auth');

// Public static Path 

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path)); 
app.set('view engine',"hbs");
app.set('views',template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

// Routing 
app.get("/",auth,(req,res)=>{
    res.render("index");
});

app.get("/secret",auth ,(req,res)=>{
    // console.log(`This is the cookie: ${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/logout", auth,async (req,res)=>{
    try {
        console.log(req.user);
        // for single logout
        // req.user.tokens = req.user.tokens.filter((currElement)=>{
        //     return currElement.token !== req.token
        // })

        // logout from all device
        req.user.tokens = [];
        res.clearCookie('jwt');
        console.log("logout sucessfully");

        await req.user.save();
        res.render('login');
    } catch (error) {
        res.status(401).send(error)
    }
    // res.render("logout");
});
// create a new user in our database
app.post("/register",async(req,res)=>{
    try {
        // console.log(req.body.firstname);
        // res.send(req.body.firstname)
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password===cpassword){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                age : req.body.age,
                email : req.body.email,
                phone : req.body.phone,
                password : password,
                confirmpassword : cpassword
            })
// genertae token 
            console.log(`The sucsess part ${registerEmployee}`);
            const token = await registerEmployee.genrateAuthToken();
            console.log(`The token part ${token}`);
            res.cookie("jwt",token,{
                expires:new Date(Date.now() + 30000),
                httpOnly:true
            });
            console.log(cookie);
            const registered = await registerEmployee.save();
            console.log("The page part " + registered);
            res.status(201).render("index");
        }else{
            res.send("password are not matching");
        }
    } catch (error) {
        res.status(400).send(error);
        console.log("The error part page");
    }
});

// login code
app.post("/login",async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(password,useremail.password);
        const token = await useremail.genrateAuthToken();
        console.log(`The token part ${token}`);
        res.cookie("jwt",token,{
            expires:new Date(Date.now() + 30000),
            httpOnly:true
        });
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("Invalid Login Details")
        }
    } catch (error) {
        res.status(400).send("Invalid Login Details");
    }
});

app.listen(port,()=>{
    console.log(`Listening to the port ${port}`);
})
