const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Swagger Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Elora Art API',
    version: '1.0.0',
    description: 'Enterprise SaaS platform for art installation management'
  },
  servers: [{ url: 'http://localhost:3001', description: 'Development server' }],
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'API is running' } }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@eloraart.com' },
                  password: { type: 'string', example: 'admin123' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Login successful' } }
      }
    },
    '/api/v1/orders': {
      get: {
        summary: 'Get orders with pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Orders retrieved successfully' } }
      }
    },
    '/api/v1/users': {
      get: {
        summary: 'Get users with pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: { '200': { description: 'Users retrieved successfully' } }
      }
    }
  }
};

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mock data
const mockOrders = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  orderNumber: `ELR2024${String(i + 1).padStart(4, '0')}`,
  clientId: { 
    name: ['ABC Corporation', 'XYZ Store', 'Design Studio', 'Art Gallery', 'Creative Space'][i % 5] 
  },
  status: ['pending', 'assigned', 'measured', 'in_production', 'completed'][i % 5],
  items: [{ 
    productType: ['Wall Art', 'Canvas Print', 'Sculpture', 'Digital Display'][i % 4], 
    quantity: Math.floor(Math.random() * 5) + 1 
  }],
  dueDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString(),
  createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
  priority: ['low', 'medium', 'high'][i % 3],
  assignedRookie: i % 3 === 0 ? 'John Doe' : null,
  assignedInstaller: i % 4 === 0 ? 'Jane Smith' : null
}));

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `User ${i + 1}`,
  email: `user${i + 1}@eloraart.com`,
  role: ['admin', 'rookie', 'installation', 'client'][i % 4],
  isActive: i % 5 !== 0,
  phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
  createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
}));

// Routes
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Elora Art API is running!',
    timestamp: new Date().toISOString(),
    documentation: 'http://localhost:3001/api/docs'
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@eloraart.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        user: { id: '1', email, name: 'Super Admin', role: 'super_admin' },
        accessToken: 'demo-token-123',
        refreshToken: 'demo-refresh-123'
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/v1/orders', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const search = req.query.search;
  
  let filteredOrders = mockOrders;
  
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  if (search) {
    filteredOrders = filteredOrders.filter(order => 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.clientId.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      orders: paginatedOrders,
      pagination: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
        hasNext: endIndex < filteredOrders.length,
        hasPrev: page > 1
      }
    }
  });
});

app.get('/api/v1/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const role = req.query.role;
  
  let filteredUsers = mockUsers;
  
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      users: paginatedUsers,
      pagination: {
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      }
    }
  });
});

app.get('/api/v1/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalOrders: mockOrders.length,
      pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
      completedOrders: mockOrders.filter(o => o.status === 'completed').length,
      activeUsers: mockUsers.filter(u => u.isActive).length,
      totalUsers: mockUsers.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Elora Art API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`👤 Demo login: admin@eloraart.com / admin123`);
});