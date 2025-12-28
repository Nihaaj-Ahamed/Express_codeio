import { Router } from "express";  
import { getParamsId,getUserIndexById } from "../utils/middlewares.mjs";
import { products} from "../utils/constants.mjs";
import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
import {validationResult,matchedData,checkSchema} from "express-validator";
 
const router = Router();
router.get("/api/products", (req, res) => {
  req.session.visited=true;
  console.log(req.session.id);
  const { query: { filter, value },} = req;
  // console.log(filter, value);
  if (filter && value) {
    return res.send(
      products.filter((product) =>
        product[filter].toLowerCase().includes(value)
      )
    );
  }
  res.send(products);
});

router.get("/api/products/:id",getParamsId, (req, res) => {
    const pId = req.id;
  const product = products.find((user) => user.id === pId);
  if (product) {
    return res.send(product);
  }
  return res.status(400).send({ msg: "undifind product..." });
});




export default router;