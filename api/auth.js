const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { connectDB, User } = require('./_db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { idToken } = await parseBody(req);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();

    await connectDB();

    const user = await User.findOneAndUpdate(
      { googleId: p['sub'] },
      { email: p['email'], name: p['name'], picture: p['picture'] },
      { upsert: true, new: true }
    );

    const token = jwt.sign(
      { uid: user._id.toString(), email: user.email, name: user.name, picture: user.picture },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { name: user.name, email: user.email, picture: user.picture } });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
