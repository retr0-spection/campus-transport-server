import mongoose from "mongoose";
import bcrypt from "bcrypt";
import axios from "axios";

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"], // Basic email validation
  },
  password: {
    type: String,
    required: false,
  },
  googleAuth: {
    type: mongoose.SchemaTypes.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.serializeData = function () {
  const payload = {
    email: this.email,
  };

  return payload;
};

userSchema.post("save",(doc, next) => {
    // After saving, check again
    if (doc.isNew){
      // call notification API
      const api = 'http://ec2-52-40-184-137.us-west-2.compute.amazonaws.com/v1/api/notifications/create/notification'
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5)
      const payload = {
        userId:doc._id,
        message:"Thanks for joining us, let's get moving!",
        type:'Welcome',
        scheduleTime: now
      }

      console.log("making request")

      const res = axios.post(api, payload)

      
    }
    next()
  });

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      if (this.isNew){
        const api = 'http://ec2-52-40-184-137.us-west-2.compute.amazonaws.com/api/v1/notification/create/notification'
        const now = new Date();
        now.setMinutes(now.getMinutes() + 2)
        const payload = {
          userId:this._id,
          message:"Thanks for joining us, let's get moving!",
          type:'Welcome',
          scheduleTime: now
        }
  
        console.log("making request")
  
        const res = axios.post(api, payload)
      }
    }catch (err){
      console.log("could not send welcome notification", err.message)
    }

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      
    } catch (error) {
      next(error);
    }finally{
      
    }
  } else {
    next();
  }
});

// Method to compare the given password with the hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  console.log(bcrypt.compare(candidatePassword, this.password))
  return bcrypt.compare(candidatePassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export default User;
