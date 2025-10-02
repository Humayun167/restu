import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: Array,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    // Track which user originally submitted this product (if it came from UserProductRequest)
    originalSubmitterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null,
    },
}, {timestamps: true});


const Product = mongoose.models.Product || mongoose.model('Product', productSchema);


export default Product;