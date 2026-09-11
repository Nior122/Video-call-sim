const fs = require('fs');
let code = fs.readFileSync('src/components/PersonaCard.tsx', 'utf8');
code = code.replace('const { user, openAuthModal } = useAuth();\n  const { user, openAuthModal } = useAuth();', 'const { user, openAuthModal } = useAuth();');
fs.writeFileSync('src/components/PersonaCard.tsx', code);
