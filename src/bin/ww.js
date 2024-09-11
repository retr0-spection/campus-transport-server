import app from '../app.js'
import docRouter from '../routers/v1/docs/docs.js'
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();


//attach docs
app.use('/docs', docRouter)

//setup mongodb
const port = 3000
const dbInit = async () => {
    try {
      if (process.env.NODE_ENV == "test") {
        await mongoose.connect()
      } else {
        await mongoose.connect(process.env.NODE_ENV == "production" ? "mongodb+srv://admin:0FZNTLHqYZHN05iY@cluster0.yral1.mongodb.net/user?retryWrites=true&w=majority&appName=Cluster0" : "mongodb://localhost:27017/campus");
      }
      mongoose.set("strictQuery", false);
  
      app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };



  await dbInit();
// Start the server

export default app