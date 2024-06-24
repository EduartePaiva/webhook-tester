import { Router } from "express";
import { createUser, getUserByID, getUsers } from "../handlers/users";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserByID);

// api/users
router.post("/", createUser);
export default router;
