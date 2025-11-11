import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';

export async function register(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body);
    
    // Log de auditoria
    await createAuditLog({
      userId: user.id,
      action: AUDIT_ACTIONS.USER_CREATE,
      entityType: 'User',
      entityId: user.id,
      entityName: user.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { role: user.role },
    });
    
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    
    // Log de auditoria - Login bem-sucedido
    await createAuditLog({
      userId: result.user.id,
      action: AUDIT_ACTIONS.LOGIN,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { email: result.user.email, role: result.user.role },
    });
    
    res.json({ success: true, ...result });
  } catch (err: any) {
    // Log de auditoria - Tentativa de login falhou
    if (req.body.email) {
      await createAuditLog({
        userId: 'system',
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { email: req.body.email, error: err.message },
      });
    }
    
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email, captcha } = req.body;
    console.log('[FORGOT-PASSWORD] Request:', { email: email ? '***' : undefined, captchaLength: captcha?.length });
    
    if (!email) throw new Error('Email obrigatório');
    if (!captcha) throw new Error('Captcha obrigatório');
    
    await authService.forgotPassword(email, captcha);
    
    // Log de auditoria
    await createAuditLog({
      userId: 'system',
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { email },
    });
    
    res.json({ success: true, message: 'Email de recuperação enviado' });
  } catch (err: any) {
    console.error('[FORGOT-PASSWORD] Erro:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword);
    
    // Log de auditoria
    if (result?.userId) {
      await createAuditLog({
        userId: result.userId,
        action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
    
    res.json({ success: true, message: 'Senha redefinida com sucesso' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function markTourVisto(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }
    await authService.markTourVisto(userId);
    res.json({ success: true, message: 'Tour marcado como visto' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getTourStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }
    const tourVisto = await authService.getTourStatus(userId);
    res.json({ success: true, tourVisto });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
