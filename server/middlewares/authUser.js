

import jwt from "jsonwebtoken";

const authUser = async(req,res,next)=>{
   // Try to get token from cookies first
   let token = req.cookies?.token;
   
   // Debug logging for authentication
   console.log('🍪 Cookies received:', req.cookies);
   console.log('🔑 Token from cookies:', token ? 'Found' : 'Not found');
   
   // If no token in cookies, try Authorization header as fallback
   if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
       token = req.headers.authorization.split(' ')[1];
       console.log('📋 Token from Authorization header:', token ? 'Found' : 'Not found');
   }
   
    if (!token) {
         console.log('❌ No token found in cookies or headers');
         return res.json({ success: false, message: 'No token, authorization denied' });
    } 
         
    try {
        console.log('🔍 Verifying token...');
        console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);
        
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET not configured');
            return res.json({ success: false, message: 'Server configuration error' });
        }
        
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decoded:', { id: tokenDecode.id, exp: tokenDecode.exp });
        
        if(tokenDecode.id){
            req.userId = tokenDecode.id;
            req.user = { id: tokenDecode.id }; // Add this for consistency
            console.log('✅ User set in request:', req.user);
        }else{
            console.log('❌ Invalid token structure - no ID found');
            return res.json({ success: false, message: 'Invalid token structure' });
        }
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        console.error('❌ Error type:', error.name);
        
        let message = 'Token verification failed';
        if (error.name === 'TokenExpiredError') {
            message = 'Token has expired';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token format';
        }
        
        res.json({ success: false, message });
    } 
};

export default authUser;

