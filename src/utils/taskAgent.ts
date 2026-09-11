import { isMediaOrImageRequest, isSocialMediaOrContactRequest } from "./mediaRequest";

export type MiniTaskType = "CALL_USER" | "MEDIA_REQUEST" | "SOCIAL_REDIRECT" | "CHAT";

export interface MiniTaskResult {
  isTask: boolean;
  taskType: MiniTaskType;
  callReason?: "prove_not_bot" | "call_request";
  suggestedReply?: string;
  delayBeforeCallMs?: number;
}

/**
 * Checks if the user is challenging the persona to prove she is not a bot or is real.
 */
export function isProveNotBotRequest(text: string): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();

  // "prove you're not a bot", "prove you are not a bot", "prove your not a bot", "prove you aren't a bot"
  if (/prove\s+(that\s+)?(you('?re?|r)?|u)\s+(are\s+|r\s+)?(not|aren'?t)\s+(a\s+)?(bot|ai|robot|machine|program|fake)/i.test(t)) {
    return true;
  }

  // "prove you're real", "prove you are real", "prove that you are real", "prove you are a real person"
  if (/prove\s+(that\s+)?(you('?re?|r)?|u)\s+(are\s+|r\s+)?(a\s+)?real(\s+person|\s+girl|\s+human)?/i.test(t)) {
    return true;
  }

  // "prove it", "prove it to me", "prove it then", "prove it now"
  if (/^prove\s+it(\s+to\s+me|\s+then|\s+now|\s+babe|\s+girl)?$/i.test(t) || /can\s+you\s+prove\s+it/i.test(t)) {
    return true;
  }

  // "are you a bot? prove it", "are you real? prove it", "how do you prove you're real"
  if (/(are\s+you\s+(a\s+)?(bot|ai|real)|you('?re?|\s+are)\s+(a\s+)?(bot|ai|fake)).*(prove|show\s+me)/i.test(t)) {
    return true;
  }

  // "how do i know you're real", "how do i know you are not a bot"
  if (/how\s+(do|can)\s+i\s+know\s+(that\s+)?(you('?re?|r)?|u)\s+(are\s+|r\s+)?(real|not\s+a\s+bot|human)/i.test(t)) {
    return true;
  }

  // "if you're real, call me", "if you are not a bot call me"
  if (/if\s+(you('?re?|r)?|u)\s+(are\s+)?(real|not\s+a\s+bot|human).*call(\s+me)?/i.test(t)) {
    return true;
  }

  // "show me you're real", "show me you're not a bot"
  if (/show\s+me\s+(that\s+)?(you('?re?|r)?|u)\s+(are\s+)?(real|not\s+a\s+bot|human)/i.test(t)) {
    return true;
  }

  return false;
}

/**
 * Checks if the user is asking the persona to call them, video call, or FaceTime them.
 */
export function isDirectCallRequest(text: string): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();

  // "call me", "call me now", "give me a call", "can you call me", "call me babe"
  if (/\b(call\s+me|give\s+me\s+a\s+call|ring\s+me|dial\s+me|can\s+you\s+call(\s+me)?|can\s+we\s+call|could\s+you\s+call(\s+me)?|i\s+want\s+a\s+call|pick\s+up\s+the\s+call|let'?s\s+(do\s+a\s+)?call)\b/i.test(t)) {
    return true;
  }

  // "video call me", "video call", "facetime me", "face time me", "facetime", "cam to cam"
  if (/\b(video\s*call(\s+me)?|facetime(\s+me)?|face\s*time(\s+me)?|video\s*chat(\s+me)?|cam\s*to\s*cam)\b/i.test(t)) {
    return true;
  }

  // "call me to prove it", "call me if you're real"
  if (/call\s+me\s+(to\s+prove|if\s+you|right\s+now|now|babe|please|pls)/i.test(t)) {
    return true;
  }

  // Direct standalone request "call", "video call", "call now"
  if (/^(call|call\s+now|video\s+call|video\s+call\s+now|facetime|ring\s+me)$/i.test(t)) {
    return true;
  }

  return false;
}

export const PROVE_NOT_BOT_CALL_REPLIES = [
  "Oh you think I'm a bot? Say less! Calling you right now, pick up and see for yourself! 📞😏",
  "Haha a bot?! Watch your screen babe... calling you this second so you know I'm 100% real! 💋📞",
  "Think I'm an AI? Bet. Calling your phone right now, don't you dare ignore me! 😉📞",
  "Haha you need proof? Picking up the phone right now babe, answer me! 📞🔥",
  "Calling you right now! Let's see if you still think I'm a bot when you see my face 😉📞",
  "No bot has this much attitude! Calling you right now, pick up handsome! 📞💋",
  "You dared me to prove it? Calling you this very second, answer your phone! 📞✨",
  "Haha I love a challenge! Calling you right now so you can see I'm completely real 😏📞",
];

export const DIRECT_CALL_REPLIES = [
  "Say less babe! Calling you right now, pick up! 📞💋",
  "You want to see my face? Done! Calling your screen this second 😉📞",
  "Aww you want a call? Calling you right now babe, answer me! 📞✨",
  "Can't say no to you 😉 Calling you right now! 📞",
  "Calling you right now babe, make sure you look good! 📞💖",
  "Picking up the line right now babe, answer me! 📞🔥",
  "Calling you this second! Don't keep a girl waiting 😉📞",
  "You asked for it! Dialing you right now babe 💋📞",
];

export const MISSED_OR_REJECTED_CALL_MESSAGES = [
  "Hey, you asked me to call and then didn't answer? 😂 Don't be shy babe!",
  "Hey, you asked me to call and then didn't answer? 😂 Don't be shy babe! Talk to me here 💕",
  "Wait, you literally asked me to call and then stared at your ringing phone?! 😭😂 Don't be shy babe, I don't bite!",
  "I let it ring for 20 whole seconds and you got camera shy! 😂 Don't be shy babe, talk to me here 😉",
  "Hey! You asked me to call and then didn't answer? 🙈 I was all ready for you! Don't be shy babe, what happened?",
  "You dared me to call and then ran away when the phone rang?! 😂 Caught you being shy babe!",
  "Ring ring... 20 seconds later and no answer! 📞😂 You asked for this call babe, don't be shy now!",
  "Hey, you asked me to call and then left me ringing?! 😂 You must be blushing on the other side of that screen! Don't be shy babe 💕",
  "Did you really challenge me to call and then freeze when my video popped up? 😂 Don't be shy babe, I promise I'm friendly!",
  "Hey, you asked me to call and then didn't answer? 😂 Who's the real one hiding behind their screen now? Don't be shy babe 😉",
];

export function getRandomMissedOrRejectedCallMessage(): string {
  return MISSED_OR_REJECTED_CALL_MESSAGES[
    Math.floor(Math.random() * MISSED_OR_REJECTED_CALL_MESSAGES.length)
  ];
}

/**
 * Evaluates a user message through the Mini Task Agent.
 * Determines if an automated task (such as calling the user) should be triggered.
 */
export function evaluateMiniTaskAgent(message: string, personaName?: string): MiniTaskResult {
  if (!message) {
    return { isTask: false, taskType: "CHAT" };
  }

  // 1. Task: Prove not bot -> Trigger incoming call to user
  if (isProveNotBotRequest(message)) {
    const reply = PROVE_NOT_BOT_CALL_REPLIES[
      Math.floor(Math.random() * PROVE_NOT_BOT_CALL_REPLIES.length)
    ];
    return {
      isTask: true,
      taskType: "CALL_USER",
      callReason: "prove_not_bot",
      suggestedReply: personaName && Math.random() > 0.5 ? `${reply} You're about to talk to ${personaName}!` : reply,
      delayBeforeCallMs: 1400,
    };
  }

  // 2. Task: Direct call request -> Trigger incoming call to user
  if (isDirectCallRequest(message)) {
    const reply = DIRECT_CALL_REPLIES[
      Math.floor(Math.random() * DIRECT_CALL_REPLIES.length)
    ];
    return {
      isTask: true,
      taskType: "CALL_USER",
      callReason: "call_request",
      suggestedReply: personaName && Math.random() > 0.5 ? `${reply}` : reply,
      delayBeforeCallMs: 1400,
    };
  }

  // 3. Task: Social media redirect
  if (isSocialMediaOrContactRequest(message)) {
    return {
      isTask: true,
      taskType: "SOCIAL_REDIRECT",
    };
  }

  // 4. Task: Media request
  if (isMediaOrImageRequest(message)) {
    return {
      isTask: true,
      taskType: "MEDIA_REQUEST",
    };
  }

  return {
    isTask: false,
    taskType: "CHAT",
  };
}
