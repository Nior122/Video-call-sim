const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

// Replace isTyping boolean with enum string state
content = content.replace(
  'const [isTyping, setIsTyping] = useState<false | "typing" | "sending_image">(false);',
  'const [isTyping, setIsTyping] = useState<false | "typing" | "sending_image">(false);'
);

// We might have missed the first replace since we ran sed before. Let's make sure it's correct.
if (!content.includes('const [isTyping, setIsTyping] = useState<false | "typing" | "sending_image">(false);')) {
  content = content.replace(
    'const [isTyping, setIsTyping] = useState(false);',
    'const [isTyping, setIsTyping] = useState<false | "typing" | "sending_image">(false);'
  );
}

// Update first setIsTyping(true) to setIsTyping("typing")
content = content.replace(
  'missedCallTypingTimeoutRef.current = setTimeout(() => {\n      setIsTyping(true);',
  'missedCallTypingTimeoutRef.current = setTimeout(() => {\n      setIsTyping("typing");'
);

// We need to make sure isMediaReq, etc. are evaluated earlier before the setTimeout
content = content.replace(
  /const taskResult = evaluateMiniTaskAgent\(newMsg\.content, persona\?\.name\);\n      const isCallTask = taskResult\.taskType === "CALL_USER";\n\n      \/\/ If it's a call task challenge/,
  `const taskResult = evaluateMiniTaskAgent(newMsg.content, persona?.name);
      const isCallTask = taskResult.taskType === "CALL_USER";
      const isDateReqEarly = isMeetUpOrDateRequest(newMsg.content);
      const isManagerReqEarly = isManagerRequest(newMsg.content);
      const isSocialReqEarly = isSocialMediaOrContactRequest(newMsg.content) || isDateReqEarly || isManagerReqEarly;
      const isAdultPicReqEarly = isAdultPictureRequest(newMsg.content);
      const hasOtherMeaningEarly = hasSubstantialNonAdultMeaning(newMsg.content);
      const isAdultReqEarly = !isAdultPicReqEarly && isAdultWordMentioned(newMsg.content) && !hasOtherMeaningEarly;
      const isVideoReqEarly = isVideoRequest(newMsg.content);
      const isMediaReqEarly = !isSocialReqEarly && !isCallTask && !isAdultReqEarly && !isAdultPicReqEarly && isMediaOrImageRequest(newMsg.content);
      const aiSentPhotosEarly = messages.filter((m) => m.role === "assistant" && m.attachmentUrl && (m.attachmentType === "image" || !m.attachmentType));
      const hasReachedPhotoLimitEarly = isMediaReqEarly && aiSentPhotosEarly.length >= MAX_PHOTOS_PER_CHAT;
      // If it's a call task challenge`
);

// Update the second setIsTyping(true)
content = content.replace(
  /const typingTimer = window\.setTimeout\(\(\) => \{\n        setIsTyping\(true\);\n      \}, typingDelay\);/,
  'const typingTimer = window.setTimeout(() => {\n        setIsTyping(((isMediaReqEarly && !hasReachedPhotoLimitEarly) || isAdultPicReqEarly) ? "sending_image" : "typing");\n      }, typingDelay);'
);

// Change rendering string
content = content.replace(
  /\{persona\?\.name \|\| "She"\} is typing/,
  '{isTyping === "sending_image" ? `Sending image...` : `${persona?.name || "She"} is typing`}'
);

fs.writeFileSync('src/components/CallSession.tsx', content);
