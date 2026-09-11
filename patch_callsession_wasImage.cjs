const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

content = content.replace(
  /const aiSentCount = messages\.filter\(\(m\) => m\.role === "assistant" && \(\(m\.attachmentUrl && \(m\.attachmentType === "image" \|\| \!m\.attachmentType\)\) \|\| m\.wasImage\)\)\.length;/g,
  `const oneMinuteAgo = new Date(Date.now() - 60000);
            const aiSentCount = messages.filter((m) => m.role === "assistant" && ((m.attachmentUrl && (m.attachmentType === "image" || !m.attachmentType)) || m.wasImage) && new Date(m.timestamp) > oneMinuteAgo).length;`
);

fs.writeFileSync('src/components/CallSession.tsx', content);
