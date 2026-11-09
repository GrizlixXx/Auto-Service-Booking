import db from './db.js';

const [, , login, role = 'operator'] = process.argv;

if (!login) {
  console.log('Usage: node server/set-role.js <username> [operator|admin|client]');
  process.exit(1);
}

try {
  const [res] = await db.query('UPDATE users SET role = ? WHERE user_login = ?', [role, login]);
  if (res.affectedRows > 0) {
    console.log(`Success: User "${login}" now has role "${role}"!`);
    console.log(`Sign in with this account at http://localhost:4200/signin`);
  } else {
    console.log(`User "${login}" was not found in the database. Please check the spelling.`);
  }
} catch (err) {
  console.error('Database error:', err.message);
} finally {
  process.exit(0);
}
