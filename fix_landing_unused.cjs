const fs = require('fs');
let lp = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
lp = lp.replace('const { user, openAuthModal } = useAuth();', '');
lp = lp.replace('import { useAuth } from "../contexts/AuthContext";\n', '');
fs.writeFileSync('src/components/LandingPage.tsx', lp);
