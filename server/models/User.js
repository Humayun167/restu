import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String,required: true,},
    email: {type: String,required: true, unique: true, },
    password: {type: String, required: true,},
    profileImage: {type: String, default: ""},
    cartItems: {type: Object,default: {}, },
    lastLogin: {type: Date, default: null},
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { minimize:false, timestamps: true})


const User = mongoose.models.User || mongoose.model("User", userSchema);


export default User;