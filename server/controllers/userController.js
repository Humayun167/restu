
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import Order from '../models/Order.js';
import {v2 as cloudinary} from 'cloudinary';
import User from '../models/User.js';

// Register users : /api/user/register
export const register =async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.json({success: false, message: 'All fields are required'});
        }


        const existingUser = await User.findOne({email})

        if(existingUser) {
            return res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,10)


        const user =await User.create({
            name, 
            email,
            password: hashedPassword
        });

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn:'7d'} )

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allow cross-site cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain       
        };

        res.cookie('token', token, cookieOptions);

        // Also send token in response for localStorage storage as fallback
        return res.json({
            success: true, 
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                profileImage: user.profileImage,
                cartItems: user.cartItems
            },
            token: token
        });

    } catch (error) {
        console.error( error.message);
        return res.json({success: false, message: error.message});
    }
}

// Login users : /api/user/login
export const login = async (req, res) => {
    try {
        console.log('🔐 Login attempt received:', { email: req.body.email, password: '***' });
        const { email, password } = req.body;

        if(!email || !password) {
            console.log('❌ Missing fields');
            return res.json({success: false, message: "All fields are required"});
        }

        const user = await User.findOne({email});
        console.log('👤 User found:', user ? 'Yes' : 'No');

        if(!user) {
            console.log('❌ User not found');
            return res.json({success: false, message: "Invalid email or password"});
        }
        
        console.log('🔒 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔒 Password match:', isMatch);
        
        if(!isMatch) {
            console.log('❌ Password mismatch');
            return res.json({success: false, message: "Invalid credentials"});
        }

        // Update last login time
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'7d'} )

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allow cross-site cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain       
        };

        res.cookie('token', token, cookieOptions);
        console.log('🍪 Setting cookie with options:', cookieOptions);
        console.log('🔑 Token being set:', token.substring(0, 20) + '...');

        // Also send token in response for localStorage storage as fallback
        console.log('✅ Login successful, sending response');
        return res.json({
            success: true, 
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                profileImage: user.profileImage,
                cartItems: user.cartItems,
                lastLogin: new Date()
            },
            token: token
        });

        
    } catch (error) {
        console.error('Login error:', error.message);
        return res.json({success: false, message: error.message});
    }
} 


// Get user details : /api/user/isAuth
export const isAuth = async (req, res) =>{
    try {
        console.log('🔍 isAuth called for userId:', req.userId);
        const { userId } = req;
        const user = await User.findById(userId).select("-password");
        console.log('👤 User found in database:', user ? 'Yes' : 'No');
        console.log('🛒 User cartItems:', user?.cartItems);
        return res.json({ success: true, user });
    } catch (error) {
        console.log('❌ isAuth error:', error.message);
        res.json({ success: false, message: error.message });
    }
}
// Logout user : /api/user/logout

export const logout = async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allow cross-site cookies in production
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
        };

        res.clearCookie('token', cookieOptions);
        return res.json({success: true, message: "User logged out successfully"});
    } catch (error) {
          console.error( error.message);
          return res.json({success: false, message: error.message});
    }
}

// // Update user profile : /api/user/update-profile
// export const updateProfile = async (req, res) => {
//     try {
//         const { userId } = req;
//         const { name, email, profileImage } = req.body;

//         if (!name || !email) {
//             return res.json({ success: false, message: 'Name and email are required' });
//         }

//         // Check if email is already taken by another user
//         const existingUser = await User.findOne({ email, _id: { $ne: userId } });
//         if (existingUser) {
//             return res.json({ success: false, message: 'Email is already taken by another user' });
//         }

//         const updateData = { name, email };
//         if (profileImage) {
//             updateData.profileImage = profileImage;
//         }

//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             updateData,
//             { new: true }
//         ).select("-password");

//         return res.json({ 
//             success: true, 
//             message: 'Profile updated successfully',
//             user: updatedUser 
//         });

//     } catch (error) {
//         console.error(error.message);
//         return res.json({ success: false, message: error.message });
//     }
// };

// // Update user password : /api/user/update-password
// export const updatePassword = async (req, res) => {
//     try {
//         const { userId } = req;
//         const { currentPassword, newPassword } = req.body;

//         if (!currentPassword || !newPassword) {
//             return res.json({ success: false, message: 'Current password and new password are required' });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.json({ success: false, message: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return res.json({ success: false, message: 'Current password is incorrect' });
//         }

//         const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//         await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

//         return res.json({ 
//             success: true, 
//             message: 'Password updated successfully'
//         });

//     } catch (error) {
//         console.error(error.message);
//         return res.json({ success: false, message: error.message });
//     }
// };

// // Get user order count : /api/user/order-count
// export const getUserOrderCount = async (req, res) => {
//     try {
//         const { userId } = req;
        
//         const orderCount = await Order.countDocuments({
//             userId,
//             $or: [{ paymentType: "COD" }, { isPaid: true }]
//         });

//         return res.json({ 
//             success: true, 
//             orderCount 
//         });

//     } catch (error) {
//         console.error(error.message);
//         return res.json({ success: false, message: error.message });
//     }
// };

// // Upload profile image : /api/user/upload-image
// export const uploadProfileImage = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         if (!req.file) {
//             return res.json({ success: false, message: 'No image file provided' });
//         }

//         // Upload image to cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             resource_type: 'image',
//             folder: 'greennest/profile-images'
//         });

//         // Update user's profile image URL
//         const user = await User.findByIdAndUpdate(
//             userId,
//             { profileImage: result.secure_url },
//             { new: true }
//         ).select('-password');

//         if (!user) {
//             return res.json({ success: false, message: 'User not found' });
//         }

//         res.json({
//             success: true,
//             message: 'Profile image updated successfully',
//             imageUrl: result.secure_url,
//             user: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 profileImage: user.profileImage
//             }
//         });
//     } catch (error) {
//         console.error('Upload profile image error:', error);
//         res.json({ success: false, message: 'Server error' });
//     }
// };

// // Get all users for seller dashboard : /api/user/all-users
// export const getAllUsers = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = '' } = req.query;
//         const skip = (page - 1) * limit;

//         // Build search query
//         let searchQuery = {};
//         if (search) {
//             searchQuery = {
//                 $or: [
//                     { name: { $regex: search, $options: 'i' } },
//                     { email: { $regex: search, $options: 'i' } }
//                 ]
//             };
//         }

//         // Get users with basic information (excluding password)
//         const users = await User.find(searchQuery)
//             .select('-password')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(parseInt(limit));

//         // Get total count for pagination
//         const totalUsers = await User.countDocuments(searchQuery);

//         // Get user statistics
//         const userStats = await User.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     totalUsers: { $sum: 1 },
//                     activeUsers: {
//                         $sum: {
//                             $cond: [
//                                 { $gte: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
//                                 1,
//                                 0
//                             ]
//                         }
//                     }
//                 }
//             }
//         ]);

//         res.json({
//             success: true,
//             users,
//             pagination: {
//                 currentPage: parseInt(page),
//                 totalPages: Math.ceil(totalUsers / limit),
//                 totalUsers,
//                 hasNext: skip + users.length < totalUsers,
//                 hasPrev: page > 1
//             },
//             stats: userStats[0] || { totalUsers: 0, activeUsers: 0 }
//         });

//     } catch (error) {
//         console.error('Get all users error:', error);
//         res.json({ success: false, message: 'Server error' });
//     }
// };

// Upload Avatar
export const uploadAvatar = async (req, res) => {
    try {
        console.log('🔄 Avatar upload request received');
        console.log('👤 User ID:', req.user?.id);
        console.log('📁 File info:', req.file ? { 
            filename: req.file.filename, 
            size: req.file.size, 
            mimetype: req.file.mimetype,
            path: req.file.path 
        } : 'No file');

        const userId = req.user.id;

        if (!req.file) {
            console.log('❌ No file uploaded');
            return res.json({ success: false, message: 'No file uploaded' });
        }

        // Use the already imported cloudinary
        console.log('☁️ Uploading to Cloudinary...');

        // Upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'user_avatars',
            width: 300,
            height: 300,
            crop: 'fill',
            format: 'jpg'
        });

        console.log('✅ Cloudinary upload success:', result.secure_url);

        // Update user avatar in database
        console.log('💾 Updating user in database...');
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: result.secure_url },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            console.log('❌ User not found in database');
            return res.json({ success: false, message: 'User not found' });
        }

        console.log('✅ Avatar upload completed successfully');
        res.json({
            success: true,
            message: 'Avatar updated successfully',
            avatarUrl: result.secure_url,
            user: updatedUser
        });

    } catch (error) {
        console.error('❌ Upload avatar error:', error);
        console.error('Error details:', error.message);
        res.json({ success: false, message: `Server error: ${error.message}` });
    }
};