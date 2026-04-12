import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const userRepo = () => AppDataSource.getRepository(User);

/** POST /api/auth/login — exchange credentials for a JWT */
router.post(
  '/login',
  wrap(async (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return void res.status(400).json({ error: 'username and password required' });
    }

    const user = await userRepo().findOne({ where: { username } });
    if (!user) {
      // constant-time rejection to avoid username enumeration
      await bcrypt.compare(password, '$2b$10$invalidhashpadding000000000000000000000000000000000000');
      return void res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return void res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1y' },
    );

    res.json({ token, username: user.username });
  }),
);

/** POST /api/auth/admin-login — validate the root admin password (no token issued) */
router.post('/admin-login', (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return void res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
  }
  if (!password || password !== expected) {
    return void res.status(403).json({ error: 'Invalid admin password' });
  }
  res.json({ ok: true });
});

export default router;
