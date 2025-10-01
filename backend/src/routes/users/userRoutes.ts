import express from "express";
import { createUser, getUser, updateUser } from "../../controllers/users/userController";

const router = express.Router();

router.post("/", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);

export default router;
