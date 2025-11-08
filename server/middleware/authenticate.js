import jwt from 'jsonwebtoken';

export default function(req, res, next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid token format' });
  const token = parts[1];
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET || 'pcrexsecret');
    req.user = data;
    next();
  }catch(err){
    return res.status(401).json({ error: 'invalid token' });
  }
}
