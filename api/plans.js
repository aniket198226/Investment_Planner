const jwt = require('jsonwebtoken');
const { connectDB, Plan } = require('./_db');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    const plans = await Plan.find({ userId: session.uid })
      .sort({ updatedAt: -1 })
      .select('name updatedAt createdAt data')
      .lean();
    return res.json({ plans });
  }

  if (req.method === 'POST') {
    const { data, name, planId } = await parseBody(req);
    if (planId) {
      await Plan.findOneAndUpdate(
        { _id: planId, userId: session.uid },
        { data, name: name || 'My Plan', updatedAt: new Date() }
      );
      return res.json({ ok: true, planId });
    } else {
      const plan = await Plan.create({
        userId: session.uid,
        name: name || 'My Plan',
        data,
        updatedAt: new Date(),
      });
      return res.json({ ok: true, planId: plan._id.toString() });
    }
  }

  if (req.method === 'DELETE') {
    const planId = req.query?.id;
    if (!planId) return res.status(400).json({ error: 'Missing plan id' });
    await Plan.findOneAndDelete({ _id: planId, userId: session.uid });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
