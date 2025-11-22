/* create_admin.js — run once to create admin */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { MONGO_URI } = process.env;
if(!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

const userSchema = new mongoose.Schema({
  name:String, email:String, passwordHash:String, role:String
});
const User = mongoose.model('User', userSchema);

async function main(){
  await mongoose.connect(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
  const name = process.env.ADMIN_NAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PW || 'Admin@1234';
  const exists = await User.findOne({ email });
  if(exists){ console.log('Admin exists:', email); process.exit(0); }
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const u = new User({ name, email, passwordHash, role:'admin' });
  await u.save();
  console.log('Created admin', email, 'pw:', password);
  process.exit(0);
}
main().catch(e=>{ console.error(e); process.exit(2); });
