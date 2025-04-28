import mongoose from "mongoose";
import bycrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    profileImage: {
        type: String,
        default: "",
    }
}, {
    timestamps: true, // automatically add createdAt and updatedAt fields
});

// hash the password before saving the user
userSchema.pre("save", async function(next) {

    if (!this.isModified("password")) {
        return next(); // if password is not modified or modified, skip hashing
    } 

    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(this.password, salt);

    next(); // call the next middleware function
});

// compare password function
userSchema.methods.comparePassword = async function(userPassword) {
    return await bycrypt.compare(userPassword, this.password);
};

// create a model from the schema (users)
const User = mongoose.model("User", userSchema); 

export default User;