import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail.js';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = '24h';
const otpStore = {};
const verifiedEmails = {};

const createToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

//REGISTER A USER
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fiels are required."
        });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }
    
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "password must be atleast of 8 characters."
        });
    }
    
    try {
        if (await User.findOne({ email })) {
            return res.status(409).json({
                success: false,
                message: "User already present"
            })
        }
        if (!verifiedEmails[email]) {
        return res.status(400).json({
            success: false,
            message: "Please verify OTP first"
        });
    }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const token = createToken(user._id);
        delete verifiedEmails[email]; 
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic}
        });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

// to login a user
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Both Fields are required."
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        //PASSWORD CHECK
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createToken(user._id);
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

// to get login user details
export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("name email profilePic");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({ success: true, user });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

// to update a user profile
export async function updateProfile(req, res) {
    const { name, email } = req.body;
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(404).json({
            success: false,
            message: "valid email and name are required."
        });
    }

    try {
        const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Email already in use."
            });
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true, select: "name email" }
        );
        res.status(200).json({
            success: true,
            user
        })
    }

    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
}

// to change user password
export async function updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password invalid or too short."
        });
    }
    try {
        const user = await User.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "current Password is incorrect."
            });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({
            success: true,
            message: "Password changed"
        })
    }

    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// sendMail 
export const sendOtp = async (req, res) => {
    try {
         console.log("SEND OTP ROUTE HIT");
        const { email } = req.body;
 console.log(email);
        // check if already registered
        const isUser = await User.findOne({ email });
        if (isUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists, please login"
            });
        }

        // generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // HTML template
        const template = `
            <h2>OTP Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>Valid for 5 minutes</p>
        `;

        // send email
        const isSent = await sendMail(email, "OTP Verification", template);

        if (!isSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send email"
            });
        }

        // store OTP
        otpStore[email] = {
            otp,
            expires: Date.now() + 5 * 60 * 1000 //5 min
        };

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    const data = otpStore[email];

    if (!data) {
        return res.status(400).json({
            success: false,
            message: "OTP not found"
        });
    }

    if (Date.now() > data.expires) {
        delete otpStore[email];
        return res.status(400).json({
            success: false,
            message: "OTP expired"
        });
    }

    if (data.otp === otp) {
        delete otpStore[email];

        verifiedEmails[email] = true;
        return res.json({
            success: true,
            message: "OTP verified"
        });
    }

    return res.status(400).json({
        success: false,
        message: "Invalid OTP"
    });
};