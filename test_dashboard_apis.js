const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test authentication first
async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@healthhub.com', 
      password: 'your-password'
    });
    
    authToken = response.data.token;
    console.log('Authentication successful');
    return true;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Test dashboard endpoints
async function testDashboardAPIs() {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  const endpoints = [
    { name: 'Daily Bookings', url: '/dashboard/bookings/daily' },
    { name: 'Hourly Revenue', url: '/dashboard/revenue/hourly' },
    { name: 'Dashboard Metrics', url: '/dashboard/metrics' },
    { name: 'Revenue Trends', url: '/dashboard/revenue/trends' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name}...`);
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, { headers });
      
      console.log(` ${endpoint.name} - Status: ${response.status}`);
      console.log(' Sample Data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error(`${endpoint.name} failed:`, error.response?.data || error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log(' Starting Dashboard API Tests...\n');
  
  const authenticated = await authenticate();
  if (authenticated) {
    await testDashboardAPIs();
  }
  
  console.log('\n✨ Tests completed!');
}

runTests();