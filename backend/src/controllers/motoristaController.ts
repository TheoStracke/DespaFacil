import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as motoristaService from '../services/motoristaService';

export async function create(req: AuthRequest, res: Response) {
  try {
    const motorista = await motoristaService.createMotorista(req.body, req.user!.id);
    res.status(201).json({ success: true, motorista });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const result = await motoristaService.listMotoristas(req.user!.id, req.user!.role, req.query);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const motorista = await motoristaService.getMotoristaById(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, motorista });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const motorista = await motoristaService.updateMotorista(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json({ success: true, motorista });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await motoristaService.deleteMotorista(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, message: 'Motorista excluído' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
