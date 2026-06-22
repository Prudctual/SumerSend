import { loadUsers } from './db.js';

async function check() {
  try {
    const users = await loadUsers();
    console.log('--- Registered Users ---');
    if (users.length === 0) {
      console.log('No users registered in the database yet.');
    } else {
      console.table(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt
      })));
    }
  } catch (err) {
    console.error('Error fetching users:', err.message);
  }
}

check();
