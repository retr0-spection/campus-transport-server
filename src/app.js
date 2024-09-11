import express from "express";
import v1API from "./routers/v1/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { jwtDecode } from "./utils/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware to handle JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// handle options
app.use("/", function (req, res, next) {
  // Allow access request from any computers
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, PATCH, OPTIONS",
  );
  res.header("Access-Control-Allow-Credentials", true);
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

// middleware to fetch user object
app.use("/", async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    const token = authHeader.split(" ")[1];
    const user = (await jwtDecode(token)) || null;

    if (user) {
      req.user = user;
    }
  } catch (e) {}

  next();
});

app.use("/", v1API);

export default app;
