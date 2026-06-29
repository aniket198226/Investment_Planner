const jwt = require('jsonwebtoken');
const { connectDB, Plan } = require('./_db');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getSession(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) throw new Error('No token');
  return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => (raw += c));
    req.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Bad JSON')); } });
  });
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  let session;
  try { session = getSession(req); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }

  await connectDB();

  if (req.method === 'GET') {
    const plan = await Plan.findOne({ userId: session.uid });
    return res.json({ plan: plan?.data ?? null });
  }

  if (req.method === 'POST') {
    const { data } = await parseBody(req);
    await Plan.findOneAndUpdate(
      { userId: session.uid },
      { data, updatedAt: new Date() },
      { upsert: true }
    );
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
