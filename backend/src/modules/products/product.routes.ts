import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct,
  getStockMovements,
  createStockMovement
} from './product.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);

router.get('/:id/stock-movements', getStockMovements);
router.post('/:id/stock-movements', createStockMovement);

export default router;
