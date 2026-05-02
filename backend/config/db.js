import mongoose from "mongoose";

export const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://tanishkagahlot059_db_user:tanishka2729@cluster0.bnmy4qv.mongodb.net/ExpenseTracker")
    .then(()=> console.log("db Connected"));
}