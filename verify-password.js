import bcrypt from 'bcryptjs';

const hash = '$2b$10$9rNiA3FlMtx3R5oGiJA8s.1kW7MwNgrsUJjqkzLmv7b7XKl'; // replace with your hash
const password = process.argv[2];

if (!password) {
  console.error('Usage: node verify-password.js <candidate-password>');
  process.exit(2);
}

const ok = bcrypt.compareSync(password, hash);
console.log(ok ? 'MATCH' : 'NO MATCH');
process.exit(ok ? 0 : 1);
