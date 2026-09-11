const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

if (!content.includes('wasImage?: boolean;')) {
  content = content.replace(
    'reactions?: { emoji: string; by: "user" | "assistant" }[];',
    'reactions?: { emoji: string; by: "user" | "assistant" }[];\n  wasImage?: boolean;'
  );
  fs.writeFileSync('src/types.ts', content);
}
