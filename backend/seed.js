// seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function run() {
  await db._ready;
  const cost = parseInt(process.env.BCRYPT_COST || '12', 10);

  const adminEmail = 'meena.admin@cleancity.app';
  const residentEmail = 'ravi.kumar@gmail.com';

  if (!await db.get('SELECT id FROM users WHERE email = ?', [adminEmail])) {
    const hash = await bcrypt.hash('Admin@1234', cost);
    await db.run('INSERT INTO users (full_name, email, password_hash, role) VALUES (?,?,?,?)',
      ['S. Meena', adminEmail, hash, 'admin']);
    console.log('Created admin:', adminEmail, '/ Admin@1234');
  }

  let resident = await db.get('SELECT id FROM users WHERE email = ?', [residentEmail]);
  if (!resident) {
    const hash = await bcrypt.hash('Resident@1234', cost);
    const info = await db.run('INSERT INTO users (full_name, email, password_hash, role) VALUES (?,?,?,?)',
      ['Ravi Kumar', residentEmail, hash, 'resident']);
    resident = { id: info.lastInsertRowid };
    console.log('Created resident:', residentEmail, '/ Resident@1234');
  }

  const admin = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);

  const samples = [
    { public_id: 'CLC-2026-0842', location: 'Gandhipuram Town Bus Stand, Coimbatore',
      description: 'Overflowing bin near the bus stand entrance for 3 days.', status: 'In Progress' },
    { public_id: 'CLC-2026-0799', location: 'RS Puram 4th Street, Coimbatore',
      description: 'Community bin damaged and lid missing.', status: 'Resolved' },
    { public_id: 'CLC-2026-0851', location: 'Peelamedu Market Road, Coimbatore',
      description: 'Construction debris dumped alongside household waste.', status: 'Pending' }
  ];

  for (const s of samples) {
    if (await db.get('SELECT id FROM reports WHERE public_id = ?', [s.public_id])) continue;
    const info = await db.run(
      `INSERT INTO reports (public_id, user_id, location, description, status) VALUES (?,?,?,?,?)`,
      [s.public_id, resident.id, s.location, s.description, s.status]
    );
    await db.run(
      `INSERT INTO status_history (report_id, old_status, new_status, changed_by_user_id) VALUES (?, NULL, 'Pending', ?)`,
      [info.lastInsertRowid, resident.id]
    );
    if (s.status !== 'Pending') {
      await db.run(
        `INSERT INTO status_history (report_id, old_status, new_status, changed_by_user_id) VALUES (?, 'Pending', ?, ?)`,
        [info.lastInsertRowid, s.status, admin.id]
      );
    }
    console.log('Seeded report', s.public_id);
  }

  console.log('Done.');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
