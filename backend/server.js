import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT ||4000;

// MIDDLEWARE
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/uploads", express.static("uploads"));

//DB
connectDB();

//ROUTES
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);

app.get('/', (req,res)=>{
    res.send("API WORKING");
});

app.listen(port, ()=>{
    console.log(`Server Started on http://localhost:${port}`);
});