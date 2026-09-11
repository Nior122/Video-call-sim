const fs = require('fs');
let content = fs.readFileSync('src/components/PersonaDetail.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) => navigate\(\`\/call\/\$\{persona\.slug\}\`\)\}/g,
  'onClick={() => user ? navigate(`/call/${persona.slug}`) : openAuthModal("signin")}'
);

content = content.replace(
  /onClick=\{\(\) => navigate\(\`\/call\/\$\{persona\.slug\}\?chat=true\`\)\}/g,
  'onClick={() => user ? navigate(`/call/${persona.slug}?chat=true`) : openAuthModal("signin")}'
);

content = content.replace(
  /navigate\(\`\/call\/\$\{persona\.slug\}\?chat=true\`\);/g,
  'if (user) { navigate(`/call/${persona.slug}?chat=true`); } else { openAuthModal("signin"); }'
);

fs.writeFileSync('src/components/PersonaDetail.tsx', content);
