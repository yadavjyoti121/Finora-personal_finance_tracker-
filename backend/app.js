import express from "express";
import cors from "cors";
import connectDB from "./DB/Database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";
import chatbotRoutes from "./Routers/chatbotRouter.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env" });
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT;

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "https://main.d1sj7cd70hlter.amplifyapp.com",
  "https://expense-tracker-app-three-beryl.vercel.app",
].filter(Boolean);

// Middleware
app.use(express.json({ limit: "8mb" }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Router
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => {
  res.send("Finora Backend is Running 🚀");
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
