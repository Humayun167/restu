
import jwt  from 'jsonwebtoken';

//Login Sellers : /api/seller/login

export const adminLogin = async(req,res)=>{
    try {
        const {email, password} = req.body;
        
        console.log('Login attempt:');
        console.log('Received email:', email);
        console.log('Received password:', password);
        console.log('Expected email:', process.env.ADMIN_EMAIL);
        console.log('Expected password:', process.env.ADMIN_PASSWORD);
        console.log('Email match:', email === process.env.ADMIN_EMAIL);
        console.log('Password match:', password === process.env.ADMIN_PASSWORD);

    if(password === process.env.ADMIN_PASSWORD && email === process.env.ADMIN_EMAIL){
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

        // Cookie configuration for cross-origin requests
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allow cross-site cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
        };

        res.cookie('adminToken', token, cookieOptions);

        console.log('Admin logged in successfully, token set:', !!token);
        console.log('Cookie options:', cookieOptions);

        return res.json({success: true, message: 'Admin logged in successfully'});
    }
    else{
        return res.json({success: false, message: 'Invalid credentials'});
    }
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: error.message});
    }
}
// admin auth: /api/admin/is-auth

export const isAdminAuth = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// admin logout: /api/admin/logout

export const adminLogout = async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allow cross-site cookies in production
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
        };

        res.clearCookie('adminToken', cookieOptions);
        return res.json({success: true, message: "Admin logged out successfully"});
    } catch (error) {
          console.error( error.message);
          return res.json({success: false, message: error.message});
    }
}