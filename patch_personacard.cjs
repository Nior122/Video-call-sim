const fs = require('fs');
let content = fs.readFileSync('src/components/PersonaCard.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) => navigate\(\`\/dreamgirl\/\$\{persona\.slug\}\`\)\}/g,
  'onClick={() => user ? navigate(`/dreamgirl/${persona.slug}`) : openAuthModal("signin")}'
);

content = content.replace(
  /onClick=\{\(\) => navigate\(\`\/call\/\$\{persona\.slug\}\`\)\}/g,
  'onClick={() => user ? navigate(`/call/${persona.slug}`) : openAuthModal("signin")}'
);

content = content.replace(
  /<Link\n            to=\{\`\/dreamgirl\/\$\{persona\.slug\}\`\}\n/g,
  '<button\n            type="button"\n            onClick={() => user ? navigate(`/dreamgirl/${persona.slug}`) : openAuthModal("signin")}\n'
);

content = content.replace(
  /            View Profile\n          <\/Link>/g,
  '            View Profile\n          </button>'
);

fs.writeFileSync('src/components/PersonaCard.tsx', content);
