import app from '../app.js'
import mongoose from 'mongoose';

//setup mongodb
const dbInit = async () => {
    try {
      if (process.env.NODE_ENV == "test") {
        await mongoose.connect()
      } else {
        await mongoose.connect(process.env.NODE_ENV == "production" ? "mongodb+srv://2327853:VPOPyFASBGnndvjl@cluster0.y8fh3.mongodb.net/campus?retryWrites=true&w=majority&appName=Cluster0" : "mongodb://localhost:27017/campus");
      }
      mongoose.set("strictQuery", false);
  
      server.listen(port);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };



  await dbInit();
// Start the server
const port = 3000
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default server