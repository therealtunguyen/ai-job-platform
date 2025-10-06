import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cvRoutes from "./routes/cv/cvRoutes";
import jobRoutes from "./routes/jobs/jobRoutes";
import matchingRoutes from "./routes/matching/matchingRoutes";
import applicationRoutes from "./routes/application/applicationRoutes";
import userRoutes from "./routes/users/userRoutes";
import authRoutes from "./routes/auth/authRoutes";
import { errorHandler } from "./middleware/error/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
