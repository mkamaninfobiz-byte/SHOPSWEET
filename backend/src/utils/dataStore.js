const bcrypt = require('bcryptjs');

const users = [];
const orders = [];
const contacts = [];

const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@shopsweet.local';
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';

const seedAdminUser = () => {
  if (!users.some((user) => user.roles?.includes('Admin'))) {
    const passwordHash = bcrypt.hashSync(defaultAdminPassword, 10);
    users.push({
      id: 'U-ADMIN',
      name: 'Admin',
      email: defaultAdminEmail,
      passwordHash,
      roles: ['Admin'],
    });
    console.log(`Seeded default admin account: ${defaultAdminEmail}`);
  }
};

seedAdminUser();

const findUserByEmail = (email) => users.find((user) => user.email.toLowerCase() === email.toLowerCase());
const addUser = (user) => users.push(user);
const addOrder = (order) => orders.push(order);
const addContact = (contact) => contacts.push(contact);

module.exports = { users, orders, contacts, findUserByEmail, addUser, addOrder, addContact };
