import { Router } from 'express';
import { 
  getChallans, 
  getChallanById, 
  createChallan, 
  confirmChallan,
  cancelChallan
} from './challan.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getChallans);
router.post('/', createChallan);
router.get('/:id', getChallanById);
router.put('/:id/confirm', confirmChallan);
router.put('/:id/cancel', cancelChallan);

export default router;
