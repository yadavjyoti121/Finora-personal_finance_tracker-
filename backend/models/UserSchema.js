import mongoose from "mongoose";
import validator from "validator";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique : true,
        lowercase: true,
        trim: true,
        validate : validator.isEmail,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength : [8, "Password must be at least 8 characters"],
        validate: {
            validator: (value) => passwordRegex.test(value),
            message:
              "Password must include uppercase, lowercase, number, and special character",
        },
    },
    isAvatarImageSet: {
        type: Boolean,
        default: false,
    },

    avatarImage: {
        type: String,
        default: ""
    },
    passwordResetToken: {
        type: String,
        default: null,
    },
    passwordResetExpires: {
        type: Date,
        default: null,
    },
    transactions: {
        type: [],
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default  User;
