import 'dotenv/config';
import express from "express";
// import { createUserValidationSchema } from "./utils/validationSchemas.mjs";
// import {validationResult,matchedData,checkSchema,check} from "express-validator";
// import {products,users } from "./utils/constants.mjs";
import router from "./routes/router.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { users } from "../src//utils/constants.mjs";
import { User } from "./mongoose/schema/user.mjs";
import mongoose from "mongoose";
import { comparePassword } from "./utils/helper.mjs";
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';


const app = express();

app.use(express.json()); //middleware
// app.use(userRouter);
// app.use(productsRouter);
app.use(cookieParser("code io"));

mongoose.connect("mongodb://localhost/express_auth")
.then(() => console.log("connected to mongoDB"))
.catch((err)=>console.log(`Error:-- ${err}`));

app.use(
  session({
    secret:"romba secrettttt",
    saveUninitialized: false,
    resave: false,
    cookie:{
      maxAge: 60000 * 60,
    }
  }));

app.use(passport.initialize());
app.use(passport.session());

passport.use( new LocalStrategy(
  {usernameField:"user_name",passwordField:"password"},
  async(user_name,password,done)=>{
    try{
      const user= await User.findOne({user_name:user_name})
      if(!user){
      return done(null,false,{message:"invalid username"});
    }
    if(comparePassword(password, user.password)){
      return done(null,false,{message:"Incorrect password"});
    }
      return done(null,user);
    }catch(err){
      console.log(err)
      return done(err,false);
    }

}));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,


    callbackURL: "/auth/google/cb"
  },
  async function(accessToken, refreshToken, profile, done) {
    try{
      const user = await User.findOne({googleId: profile.id});
      if(user){
        return done(null, user);
      }
      const email = profile.emails?.[0]?.value;
      const newUser =await User.create({
        user_name: profile.displayName,
        googleId: profile.id,
        email
      });
      return done(null, newUser);
    
    }catch(err){
      return done(err,null);
    }
    
  }
));

passport.serializeUser((user,done)=>{
  done (null,user.id);
});
passport.deserializeUser(async(id,done)=>{
  try{
    const user = await User.findById(id);
    done (null,user);
  }catch(err){
    
    console.log(err)
    done (err,null);
  }
});


app.use(router);
const PORT = 3000;

app.get("/", (req, res) => {
  res.cookie("user","Admin",{maxAge:60000 * 60,signed:true });
  console.log(req.session.id);
  req.sessionStore.get(req.session.id,(err,sessionData)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log(sessionData);
    }
  });

  res.send({ msg: "Hello World" });
});

app.post('/login',(req,res,next)=>{
  passport.authenticate('local',(err,user,info)=>{
    if(err) return next (err);
    if(!user){
      return res.json({message: info?.message || "login failed"});
    }
    req.logIn(user,(err)=>{
      if(err) return next (err);
      return res.json({message:"login successful",user});

    });  
    
})(req,res,next);
});

app.get('/auth/google',passport.authenticate("google",
  { scope:['profile','email'] }
));

app.get('/auth/google/cb',passport.authenticate("google",{
  failureRedirect:"/"
}),
(req,res)=>{
  res.send({msg:"google login successful",user:req.user});
}
)

//middlware to get user index by id
// const getUserIndexById = (req, res, next) => {
//   const uId = parseInt(req.params.id);
//   if (isNaN(uId)) {
//     return res.status(400).send({ msg: "Bad request, Invalid ID" });
//   }
//   const userIndex = users.findIndex((user) => user.id === uId);
//   if (userIndex === -1) {
//     return res.status(404).send({ msg: "user not found" });
//   }
//   req.userIndex = userIndex;
//   next();
// };

// const getParamsId = (req, res, next) => {
//   const pId = parseInt(req.params.id);
//   console.log(pId);
//   if (isNaN(pId)) {
//     return res.status(400).send({ msg: "invalid prodect" });
//   }
//   req.id = pId;
//   next();
// };

// app.get("/", (req, res) => {
//   res.send({ msg: "Hello World" });
// });

// app.get("/api/users", (req, res) => {
//   const {
//     query: { filter, value },
//   } = req;
//   console.log(filter, value);
//   if (filter && value) {
//     return res.send(
//       users.filter((user) => user[filter].toLowerCase().includes(value))
//     );
//   }
//   res.send(users);
// }); //this is using queary paramiters

// app.get("/api/users/:id",(req,res)=>{
//     const id =parseInt(req.params.id);
//     console.log(id);
//     if(isNaN(id)){
//         return res.status(400).send({msg:"Bad request, Invalid ID"});

//     }
//     const user =users.find((user)=>user.id===id);
//     if(user){
//         return res.send(user);
//     }
//     return res.status(404).send({msg:"user not found"});

// });
// app.get("/api/users/:id", getParamsId, (req, res) => {
//   const id = req.id;
//   const user = users.find((user) => user.id === id);
//   if (user) {
//     return res.send(user);
//   }
//   return res.status(404).send({ msg: "user not found" });
// });
// app.get('/api/products',(req,res)=>{
//     res.send(products);
// });

// app.get("/api/products", (req, res) => {
//   const { query: { filter, value },} = req;
//   console.log(filter, value);
//   if (filter && value) {
//     return res.send(
//       products.filter((product) =>
//         product[filter].toLowerCase().includes(value)
//       )
//     );
//   }
//   res.send(products);
// });

// app.get("/api/products/:id",getParamsId, (req, res) => {
//     const pId = req.id;
//   const product = products.find((user) => user.id === pId);
//   if (product) {
//     return res.send(product);
//   }
//   return res.status(400).send({ msg: "undifind product..." });
// });

//post
//client ->Server

// app.post("/api/users",checkSchema(createUserValidationSchema),(req, res) => {
//   const result = validationResult(req);
//   console.log(result);
//   if(!result.isEmpty()){
//     return res.status(400).send({errors:result.array()});
//   }
//   const  body  = matchedData(req);
//   const newUser = { id: users[users.length - 1].id + 1, ...body };
//   users.push(newUser);
//   return res.status(201).send(newUser);
// });

//put
// app.put("/api/users/:id", getUserIndexById, (req, res) => {
//   const userIndex = req.userIndex;
//   const { body } = req;
//   users[userIndex] = { id: userIndex, ...body };
//   return res.status(200).send({ msg: "user updated" });
// });

// //patch
// app.patch("/api/users/:id", getUserIndexById, (req, res) => {
//   const userIndex = req.userIndex;
//   const { body } = req;
//   users[userIndex] = { ...users[userIndex], ...body };
//   console.log(body);
//   return res.sendStatus(200);
// });

// //delete
// // app.delete('/api/users/:id',(req,res)=>{
// //         const uId =parseInt(req.params.id);
// //     console.log(uId);
// //     if(isNaN(uId)){
// //         return res.status(400).send({msg:"Bad request, Invalid ID"});
// //     }
// //     const userIndex =users.findIndex((user)=>user.id===uId);
// //     if(userIndex === -1){
// //         return res.status(404).send({msg:"user not found"});
// //     }
// //     users.splice(userIndex,1);
// //     return res.status(200).send({msg:"user deleted successfully"});

// // });
// //as same as above using middleware
// //hv any toubt about this take a look coid io  timeline-getById Middleware
// //ella edathulayum means ella http request irukka edathila ippidi seiya elum athoda anda req la namna save panna index a intha function ku set pannanum
// app.delete("/api/users/:id", getUserIndexById, (req, res) => {
//   const userIndex = req.userIndex;
//   users.splice(userIndex, 1);
//   return res.status(200).send({ msg: "user deleted successfully" });
// });

app.listen(PORT, () => {
  console.log(`App is running on Port ${PORT}`);
});

//query params
//localhost:3000/api/users?filter=user_name&value=go
