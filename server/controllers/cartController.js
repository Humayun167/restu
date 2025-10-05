import User from "../models/User.js";
// update user cartData :/api/cart/update

export const updateCart = async(req, res) => {
    try {
        console.log('📦 Cart update request received');
        console.log('👤 User ID:', req.userId);
        console.log('🛒 Cart items:', req.body.cartItems);
        
        const { cartItems } = req.body;
        const userId = req.userId;
        
        // Validate user ID
        if (!userId) {
            console.log('❌ No user ID provided');
            return res.json({ success: false, message: "User ID is required" });
        }
        
        // Validate cart items
        if (!cartItems || typeof cartItems !== 'object') {
            console.log('❌ Invalid cart items format');
            return res.json({ success: false, message: "Cart items must be an object" });
        }
        
        // Validate each cart item
        for (const [productId, quantity] of Object.entries(cartItems)) {
            if (typeof quantity !== 'number' || quantity < 0) {
                console.log('❌ Invalid quantity for product:', productId);
                return res.json({ success: false, message: `Invalid quantity for product ${productId}` });
            }
        }
        
        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User not found:', userId);
            return res.json({ success: false, message: "User not found" });
        }
        
        // Update cart
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { cartItems }, 
            { new: true }
        );
        
        console.log('✅ Cart updated successfully');
        console.log('🛒 New cart items:', updatedUser.cartItems);
        
        res.json({ 
            success: true, 
            message: "Cart updated successfully",
            cartItems: updatedUser.cartItems 
        });
        
    } catch (error) {
        console.error('💥 Cart update error:', error.message);
        return res.json({ success: false, message: error.message });
    }
}