import express from "express";
import cors from "cors";
import connectDB from "./DB/Database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";
import chatbotRoutes from "./Routers/chatbotRouter.js";

dotenv.config({ path: ".env" });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, "../frontend/build");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");
const port = process.env.PORT || 5000;

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "https://main.d1sj7cd70hlter.amplifyapp.com",
  "https://expense-tracker-app-three-beryl.vercel.app",
  "https://finora-q47s.onrender.com",  
  "https://finora-frontend.onrender.com", 
].filter(Boolean);

app.use(express.json({ limit: "8mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Finora backend is running",
    docs: {
      auth: "/api/auth",
      transactions: "/api/v1",
      chatbot: "/api/chatbot",
      health: "/health",
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.head("/", (req, res) => {
  res.status(200).end();
});

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendBuildPath));

  app.get("/", (req, res) => {
    res.sendFile(frontendIndexPath);
  });

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Finora backend is running",
      note: "Frontend build not found on this deployment.",
      docs: {
        api: "/api",
        health: "/health",
      },
    });
  });
}

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
