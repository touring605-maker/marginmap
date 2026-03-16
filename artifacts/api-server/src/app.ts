import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";

const app: Express = express();

const allowedOrigins = process.env.REPLIT_DEV_DOMAIN
  ? [`https://${process.env.REPLIT_DEV_DOMAIN}`, `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`]
  : ["http://localhost:5173"];

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => origin === allowed || origin.endsWith(".replit.dev"))) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
