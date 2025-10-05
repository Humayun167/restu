
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
         fullName: { type: String, required: true },
         phone: { type: String, required: true },
         address: { type: String, required: true },
         city: { type: String, required: true },
         state: { type: String, required: true },
         zipCode: { type: String, required: true },
         country: { type: String, required: true, default: 'USA' },
         isDefault: { type: Boolean, default: false }
}, {
    timestamps: true
})

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);  

export default address;