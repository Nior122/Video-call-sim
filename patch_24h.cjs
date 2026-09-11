const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

// Replace the oneMinuteAgo logic with 24 hours ago
content = content.replace(
  /const oneMinuteAgo = new Date\(Date\.now\(\) - 60000\);/g,
  'const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);'
);

content = content.replace(
  /new Date\(m\.timestamp\) > oneMinuteAgo/g,
  'new Date(m.timestamp) > oneDayAgo'
);

// Update UI text
content = content.replace(
  /Max \{MAX_PHOTOS_PER_CHAT\} photos per minute/g,
  'Max {MAX_PHOTOS_PER_CHAT} photos per 24 hours'
);

fs.writeFileSync('src/components/CallSession.tsx', content);
