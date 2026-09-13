const fs = require('fs');

let pd = fs.readFileSync('src/components/PersonaDetail.tsx', 'utf8');
pd = pd.replace('const { user, openAuthModal, loading: authLoading } = useAuth();', '');
pd = pd.replace('import { useAuth } from "../contexts/AuthContext";\n', '');
fs.writeFileSync('src/components/PersonaDetail.tsx', pd);

let cs = fs.readFileSync('src/components/CallSession.tsx', 'utf8');
cs = cs.replace('const { user, openAuthModal, loading: authLoading } = useAuth();', '');
cs = cs.replace('import { useAuth } from "../contexts/AuthContext";\n', '');
fs.writeFileSync('src/components/CallSession.tsx', cs);

let pc = fs.readFileSync('src/components/PersonaCard.tsx', 'utf8');
pc = pc.replace('const { user, openAuthModal } = useAuth();', '');
pc = pc.replace('import { useAuth } from "../contexts/AuthContext";\n', '');
fs.writeFileSync('src/components/PersonaCard.tsx', pc);

let lp = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
// LandingPage still needs openAuthModal for the header?
// Wait, let me check if openAuthModal is used elsewhere in LandingPage.
