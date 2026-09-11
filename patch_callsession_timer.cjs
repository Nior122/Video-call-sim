const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

// Update localStorage logic to handle auto-delete after 20 mins and max image rule resetting after 1 minute

content = content.replace(
  /const hasReachedPhotoLimitEarly = isMediaReqEarly && aiSentPhotosEarly\.length >= MAX_PHOTOS_PER_CHAT;/g,
  `const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentPhotos = aiSentPhotosEarly.filter(m => new Date(m.timestamp) > oneMinuteAgo);
      const hasReachedPhotoLimitEarly = isMediaReqEarly && recentPhotos.length >= MAX_PHOTOS_PER_CHAT;`
);

content = content.replace(
  /const hasReachedPhotoLimit = isMediaReq && aiPhotoCount >= MAX_PHOTOS_PER_CHAT;/g,
  `const oneMinuteAgo = new Date(Date.now() - 60000);
        const recentPhotos = aiSentPhotos.filter(m => new Date(m.timestamp) > oneMinuteAgo);
        const hasReachedPhotoLimit = isMediaReq && recentPhotos.length >= MAX_PHOTOS_PER_CHAT;`
);

// We need to also fix the "Max N photos in chat" text
content = content.replace(
  /<span className="text-\[10px\] text-pink-300\/80">Max \{MAX_PHOTOS_PER_CHAT\} photos in chat<\/span>/g,
  '<span className="text-[10px] text-pink-300/80">Max {MAX_PHOTOS_PER_CHAT} photos per minute</span>'
);

// We need to implement the auto-delete of the chat every 20 minutes while the chat is open
// Add an interval to check for expiration
if (!content.includes('useEffect(() => {\n    const checkExpiry = setInterval(() => {')) {
    content = content.replace(
      '// Chat state',
      `// Chat state
  useEffect(() => {
    const checkExpiry = setInterval(() => {
      const stored = localStorage.getItem("chat_" + slug);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.savedAt >= 20 * 60 * 1000) {
            localStorage.removeItem("chat_" + slug);
            setMessages([]);
          }
        } catch (e) {}
      }
    }, 60000); // check every minute
    return () => clearInterval(checkExpiry);
  }, [slug]);`
    );
}


fs.writeFileSync('src/components/CallSession.tsx', content);
