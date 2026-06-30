import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';

export function verifyToken(req: Request): string | null {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET) as { tenantId: string };
        return decoded.tenantId;
    } catch {
        return null;
    }
}

export function generateToken(tenantId: string): string {
    return jwt.sign({ tenantId }, SECRET, { expiresIn: '7d' });
}