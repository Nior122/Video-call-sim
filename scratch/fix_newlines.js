import fs from 'fs';
import path from 'path';

const file = path.resolve('src/data/defaultPersonas.ts');
let content = fs.readFileSync(file, 'utf8');

// The previous command accidentally put a literal \n instead of a newline. 
// We will replace `\n` (slash+n) with a real newline.
content = content.split("'',\\n    videos: [").join("' ',\n    videos: [");

fs.writeFileSync(file, content);
console.log("Fixed literal \\n in defaultPersonas.ts");
