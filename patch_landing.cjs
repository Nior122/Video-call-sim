const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

if (!code.includes('useAuth')) {
    code = code.replace('import { useNavigate } from "react-router-dom";', 'import { useNavigate } from "react-router-dom";\nimport { useAuth } from "../contexts/AuthContext";');
    code = code.replace('const navigate = useNavigate();', 'const navigate = useNavigate();\n  const { user, openAuthModal } = useAuth();');
    
    // Replace all navigate("/dreamgirls")
    code = code.replace(/onClick=\{\(\) => navigate\("\/dreamgirls"\)\}/g, 'onClick={() => user ? navigate("/dreamgirls") : openAuthModal("signin")}');
    
    // Replace navigate(`/dreamgirl/${p.slug}`)
    code = code.replace(/onClick=\{\(\) => navigate\(`\/dreamgirl\/\$\{p.slug\}`\)\}/g, 'onClick={() => user ? navigate(`/dreamgirl/${p.slug}`) : openAuthModal("signin")}');
    
    fs.writeFileSync('src/components/LandingPage.tsx', code);
    console.log("Patched LandingPage");
}
