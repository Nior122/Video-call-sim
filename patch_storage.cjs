const fs = require('fs');
let code = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

// 1. Initialize messages from localStorage
code = code.replace(
  'const [messages, setMessages] = useState<ChatMessage[]>([]);',
  `const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem("chat_" + slug);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.savedAt < 20 * 60 * 1000) {
          // Valid within 20 mins
          return parsed.messages.map((m: any) => ({
             ...m,
             timestamp: new Date(m.timestamp)
          }));
        } else {
          // Expired, delete it
          localStorage.removeItem("chat_" + slug);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  
  // Save to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      const msgsToSave = messages.map(m => {
        // Strip media url
        const { attachmentUrl, ...rest } = m;
        // if it had an image, keep track of it so count works
        if (attachmentUrl || m.wasImage) {
           (rest as any).wasImage = true;
        }
        return rest;
      });
      localStorage.setItem("chat_" + slug, JSON.stringify({
        savedAt: Date.now(),
        messages: msgsToSave
      }));
    }
  }, [messages, slug]);`
);

// 2. Fix the filters that check for image count to use wasImage
code = code.replace(/m\.attachmentUrl && \(m\.attachmentType === "image" \|\| !m\.attachmentType\)/g, '((m.attachmentUrl && (m.attachmentType === "image" || !m.attachmentType)) || m.wasImage)');

fs.writeFileSync('src/components/CallSession.tsx', code);
console.log("Patched storage");
