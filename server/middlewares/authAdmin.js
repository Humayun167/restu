import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
    try {
        let token = null;
        
        // Try to get token from cookies first
        const {adminToken} = req.cookies;
        
        // If no cookie token, try Authorization header as fallback
        if (!adminToken) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        } else {
            token = adminToken;
        }
        
        // Debug logging for production troubleshooting
        console.log('Auth Admin Debug:');
        console.log('Cookies received:', req.cookies);
        console.log('AdminToken from cookie:', !!adminToken);
        console.log('Token from header:', !!token && !adminToken);
        console.log('Final token present:', !!token);

        if (!token) {
            console.log('No admin token found in cookies or headers');
            return res.json({ success: false, message: 'No token, authorization denied' });
        }
        
        try {
            const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully:', tokenDecode);

            if(tokenDecode.email === process.env.ADMIN_EMAIL){
                next();
            } else {
                console.log('Email mismatch:', tokenDecode.email, 'vs', process.env.ADMIN_EMAIL);
                return res.json({ success: false, message: 'not authorized' });
            }
        } catch (jwtError) {
            console.log('JWT verification error:', jwtError.message);
            return res.json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        console.log('Auth admin error:', error.message);
        res.json({ success: false, message: error.message });
    } 
}

export default authAdmin;
