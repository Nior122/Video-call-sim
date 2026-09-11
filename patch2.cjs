const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

// Fix rendering string
content = content.replace(
  'isTyping === "sending_image" ? `Sending image...` : `${isTyping === "sending_image" ? `Sending image...` : `${persona?.name || "She"} is typing`}`',
  'isTyping === "sending_image" ? `Sending image...` : `${persona?.name || "She"} is typing`'
);

fs.writeFileSync('src/components/CallSession.tsx', content);
