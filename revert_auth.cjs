const fs = require('fs');

// 1. Revert PersonaDetail.tsx
let pd = fs.readFileSync('src/components/PersonaDetail.tsx', 'utf8');
pd = pd.replace(
  /  useEffect\(\(\) => \{\n    if \(\!authLoading && \!user\) \{\n      openAuthModal\("signin"\);\n      navigate\("\/"\);\n    \}\n  \}, \[user, authLoading, navigate, openAuthModal\]\);\n\n/g,
  ''
);
pd = pd.replace(
  /onClick=\{\(\) => user \? navigate\(\`\/call\/\$\{persona\.slug\}\`\) : openAuthModal\("signin"\)\}/g,
  'onClick={() => navigate(`/call/${persona.slug}`)}'
);
pd = pd.replace(
  /onClick=\{\(\) => user \? navigate\(\`\/call\/\$\{persona\.slug\}\?chat=true\`\) : openAuthModal\("signin"\)\}/g,
  'onClick={() => navigate(`/call/${persona.slug}?chat=true`)}'
);
pd = pd.replace(
  /if \(user\) \{ navigate\(\`\/call\/\$\{persona\.slug\}\?chat=true\`\); \} else \{ openAuthModal\("signin"\); \}/g,
  'navigate(`/call/${persona.slug}?chat=true`);'
);
fs.writeFileSync('src/components/PersonaDetail.tsx', pd);

// 2. Revert CallSession.tsx
let cs = fs.readFileSync('src/components/CallSession.tsx', 'utf8');
cs = cs.replace(
  /  useEffect\(\(\) => \{\n    if \(\!authLoading && \!user\) \{\n      openAuthModal\("signin"\);\n      navigate\(\`\/dreamgirl\/\$\{slug\}\`\);\n    \}\n  \}, \[user, authLoading, navigate, openAuthModal, slug\]\);\n\n/g,
  ''
);
fs.writeFileSync('src/components/CallSession.tsx', cs);

// 3. Revert PersonaCard.tsx
let pc = fs.readFileSync('src/components/PersonaCard.tsx', 'utf8');
pc = pc.replace(
  /onClick=\{\(\) => user \? navigate\(\`\/dreamgirl\/\$\{persona\.slug\}\`\) : openAuthModal\("signin"\)\}/g,
  'onClick={() => navigate(`/dreamgirl/${persona.slug}`)}'
);
pc = pc.replace(
  /onClick=\{\(\) => user \? navigate\(\`\/call\/\$\{persona\.slug\}\`\) : openAuthModal\("signin"\)\}/g,
  'onClick={() => navigate(`/call/${persona.slug}`)}'
);
pc = pc.replace(
  /<button\n            type="button"\n            onClick=\{\(\) => user \? navigate\(\`\/dreamgirl\/\$\{persona\.slug\}\`\) : openAuthModal\("signin"\)\}\n/g,
  '<Link\n            to={`/dreamgirl/${persona.slug}`}\n'
);
pc = pc.replace(
  /            View Profile\n          <\/button>/g,
  '            View Profile\n          </Link>'
);
fs.writeFileSync('src/components/PersonaCard.tsx', pc);

// 4. Revert LandingPage.tsx
let lp = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
lp = lp.replace(
  /onClick=\{\(\) => user \? navigate\(\`\/dreamgirl\/\$\{p\.slug\}\`\) : openAuthModal\("signin"\)\}/g,
  'onClick={() => navigate(`/dreamgirl/${p.slug}`)}'
);
fs.writeFileSync('src/components/LandingPage.tsx', lp);

console.log("Auth requirements removed.");
