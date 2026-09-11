import { Router } from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  addFollowUp, 
  getFollowUps 
} from './customer.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

router.post('/:id/follow-ups', addFollowUp);
router.get('/:id/follow-ups', getFollowUps);

export default router;
