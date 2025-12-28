import { Router } from "express";
import productRouter from "../routes/products.mjs";
import userRouter from "../routes/user.mjs";

const router = Router();

router.use(userRouter);
router.use(productRouter);

export default router;