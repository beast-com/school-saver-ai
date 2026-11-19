import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { name, type, rn, co, hd, ph, em, pw } = req.body;

    // 1. Insert the school
    const school = await sql`
      INSERT INTO schools (name, institution_type, registration_number, county, head_name, phone, email, status)
      VALUES (${name}, ${type}, ${rn}, ${co}, ${hd}, ${ph}, ${em}, 'pending_verification')
      RETURNING id
    `;
    const schoolId = school[0].id;

    // 2. Insert the subscription (Pending)
    await sql`
      INSERT INTO subscriptions (school_id, plan, annual_amount, status)
      VALUES (${schoolId}, ${type}, 0, 'pending')
    `;

    res.status(200).json({ ok: true, schoolId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
}
