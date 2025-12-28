import { Router } from "express";  
import { getParamsId,getUserIndexById } from "../utils/middlewares.mjs";
import { users } from "../utils/constants.mjs";
import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
import {validationResult,matchedData,checkSchema} from "express-validator";

 

const router = Router();

router.get("/api/users", (req, res) => {

  console.log(req.signedCookies);
  if (req.signedCookies.user && req.signedCookies .user === "Admin") {
      const { query: { filter, value }, } = req;
      // console.log(filter, value);
      if (filter && value) {
        return res.send(users.filter((user) => user[filter].toLowerCase().includes(value)));
      }
      res.send(users);
  }
  else {
    return  res.status(401).send({ msg: "you are not an admin" });
  }
});

router.get("/api/users/:id", getParamsId, (req, res) => {
  const id = req.id;
  const user = users.find((user) => user.id === id);
  if (user) {
    return res.send(user);
  }
  return res.status(404).send({ msg: "user not found" });
});

router.post("/api/users",checkSchema(createUserValidationSchema),(req, res) => {
  const result = validationResult(req);
  console.log(result);
  if(!result.isEmpty()){
    return res.status(400).send({errors:result.array()});
  }
  const  body  = matchedData(req);
  const newUser = { id: users[users.length - 1].id + 1, ...body };
  users.push(newUser);
  return res.status(201).send(newUser);
});
router.put("/api/users/:id", getUserIndexById, (req, res) => {
  const userIndex = req.userIndex;
  const { body } = req;
  users[userIndex] = { id: userIndex  , ...body };
  return res.status(200).send({ msg: "user updated" });
});

//patch
router.patch("/api/users/:id", getUserIndexById, (req, res) => {
  const userIndex = req.userIndex;
  const { body } = req;
  users[userIndex] = { ...users[userIndex], ...body };
  console.log(body);
  return res.sendStatus(200);
});

router.delete("/api/users/:id", getUserIndexById, (req, res) => {
  const userIndex = req.userIndex;
  users.splice(userIndex, 1);
  return res.status(200).send({ msg: "user deleted successfully" });
});


export default router;