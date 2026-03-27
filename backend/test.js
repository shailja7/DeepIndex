console.log('1. Starting test...');
require('dotenv').config();
console.log('2. Dotenv loaded');

try {
  console.log('3. Loading express...');
  const express = require('express');
  console.log('4. Loading mongoose...');
  const mongoose = require('mongoose');
  console.log('5. Loading cors and path...');
  const cors = require('cors');
  const path = require('path');
  
  console.log('6. Loading videoRoutes...');
  const videoRoutes = require('./routes/videoRoutes');
  console.log('7. Loaded videoRoutes successfully!');
} catch (e) {
  console.error('Error:', e);
}
console.log('8. Test complete.');
process.exit(0);
