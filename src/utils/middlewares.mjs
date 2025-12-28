import { users } from "./constants.mjs";

 
export const getUserIndexById = (req, res, next) => {
  const uId = parseInt(req.params.id);
  if (isNaN(uId)) {
    return res.status(400).send({ msg: "Bad request, Invalid ID" });
  }
  const userIndex = users.findIndex((user) => user.id === uId);
  if (userIndex === -1) {
    return res.status(404).send({ msg: "user not found" });
  }
  req.userIndex = userIndex;
  next();
};

export const getParamsId = (req, res, next) => {
  const pId = parseInt(req.params.id);
  console.log(pId);
  if (isNaN(pId)) {
    return res.status(400).send({ msg: "invalid prodect" });
  }
  req.id = pId;
  next();
};
