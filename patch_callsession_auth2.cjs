const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

content = content.replace(
  /  useEffect\(\(\) => \{\n    if \(\!authLoading && \!user\) \{\n      openAuthModal\("signin"\);\n      navigate\("\/"\);\n    \}\n  \}, \[user, authLoading, navigate, openAuthModal\]\);\n/,
  ''
);

if (!content.includes('useEffect(() => {\n    if (!authLoading && !user) {')) {
  content = content.replace(
    /useEffect\(\(\) => \{\n    if \(slug\) \{/,
    'useEffect(() => {\n    if (!authLoading && !user) {\n      openAuthModal("signin");\n      navigate(`/dreamgirl/${slug}`);\n    }\n  }, [user, authLoading, navigate, openAuthModal, slug]);\n\n  useEffect(() => {\n    if (slug) {'
  );
}

fs.writeFileSync('src/components/CallSession.tsx', content);
