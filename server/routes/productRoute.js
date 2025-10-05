import express from 'express';
import { upload } from '../configs/multer.js';
import { addProduct, changeStock, productById, productList, searchProducts } from '../controllers/productController.js';
import authAdmin from '../middlewares/authAdmin.js';

const productRouter = express.Router();


productRouter.post('/add', upload.array('images'), authAdmin, addProduct)
productRouter.get('/list', productList);
productRouter.get('/:id', productById);
productRouter.post('/stock', authAdmin, changeStock);
productRouter.get('/search', searchProducts);


export default productRouter;