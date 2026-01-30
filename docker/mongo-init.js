// MongoDB initialization script
db = db.getSiblingDB('elora-art');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        name: {
          bsonType: 'string',
          minLength: 2
        },
        role: {
          enum: ['super_admin', 'admin', 'rookie', 'installation', 'client']
        }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderNumber', 'clientId', 'storeId', 'status', 'items'],
      properties: {
        status: {
          enum: ['pending', 'assigned', 'measured', 'in_production', 'ready_for_installation', 'installed', 'completed', 'cancelled']
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ clientId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ assignedRookie: 1 });
db.orders.createIndex({ assignedInstaller: 1 });
db.clients.createIndex({ email: 1 }, { unique: true });

// Create default super admin user
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('admin123', 12);

db.users.insertOne({
  email: 'admin@eloraart.com',
  name: 'Super Admin',
  password: hashedPassword,
  role: 'super_admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');