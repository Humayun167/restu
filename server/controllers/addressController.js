


// Add address: /api/address/add

import Address from "../models/address.js";

export const addAddress = async(req,res)=>{
    try {
        const { fullName, phone, address, city, state, zipCode, country, isDefault } = req.body;
        const userId = req.userId;
        
        // Validate required fields
        if (!fullName || !phone || !address || !city || !state || !zipCode) {
            return res.json({success: false, message: "All required fields must be filled"});
        }
        
        // If this is set as default, remove default from other addresses
        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false });
        }
        
        // If this is the user's first address, make it default automatically
        const addressCount = await Address.countDocuments({ userId });
        const makeDefault = isDefault || addressCount === 0;
        
        const newAddress = await Address.create({
            userId,
            fullName,
            phone, 
            address,
            city,
            state,
            zipCode,
            country: country || 'USA',
            isDefault: makeDefault
        });
        
        res.json({success:true, message:"Address added successfully", address: newAddress});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get all addresses: /api/address/get

export const getAddress = async(req,res)=>{
    try {
        const userId = req.userId;
        const addresses = await Address.find({userId});
        res.json({success:true,addresses});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Update address: /api/address/update/:id

export const updateAddress = async(req,res)=>{
    try {
        const { id } = req.params;
        const { address } = req.body;
        const userId = req.userId;
        
        // Find the address and check if it belongs to the user
        const existingAddress = await Address.findById(id);
        if (!existingAddress) {
            return res.json({success: false, message: "Address not found"});
        }
        
        if (existingAddress.userId !== userId) {
            return res.json({success: false, message: "Unauthorized to update this address"});
        }
        
        // Update the address
        const updatedAddress = await Address.findByIdAndUpdate(
            id, 
            { ...address, userId }, 
            { new: true }
        );
        
        res.json({
            success: true, 
            message: "Address updated successfully",
            address: updatedAddress
        });
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Delete address: /api/address/delete/:id

export const deleteAddress = async(req,res)=>{
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        // Find the address and check if it belongs to the user
        const address = await Address.findById(id);
        if (!address) {
            return res.json({success: false, message: "Address not found"});
        }
        
        if (address.userId !== userId) {
            return res.json({success: false, message: "Unauthorized to delete this address"});
        }
        
        // Check if trying to delete default address
        if (address.isDefault) {
            return res.json({success: false, message: "Cannot delete default address. Set another address as default first."});
        }
        
        await Address.findByIdAndDelete(id);
        res.json({success:true, message:"Address deleted successfully"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Set address as default: /api/address/set-default/:id

export const setDefaultAddress = async(req,res)=>{
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        // Find the address and check if it belongs to the user
        const address = await Address.findById(id);
        if (!address) {
            return res.json({success: false, message: "Address not found"});
        }
        
        if (address.userId.toString() !== userId) {
            return res.json({success: false, message: "Unauthorized to modify this address"});
        }
        
        // Remove default from all other addresses
        await Address.updateMany({ userId }, { isDefault: false });
        
        // Set this address as default
        await Address.findByIdAndUpdate(id, { isDefault: true });
        
        res.json({success:true, message:"Default address updated successfully"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}