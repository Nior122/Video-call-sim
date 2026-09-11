const fs = require('fs');
let code = fs.readFileSync('src/components/PersonaDetail.tsx', 'utf8');

if (!code.includes('useAuth')) {
    code = code.replace('import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";', 'import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";\nimport { useAuth } from "../contexts/AuthContext";');
    code = code.replace('export default function PersonaDetail() {', 'export default function PersonaDetail() {\n  const { user, openAuthModal, loading: authLoading } = useAuth();');
    
    // Add effect to redirect or show modal if not signed in
    code = code.replace('useEffect(() => {', 'useEffect(() => {\n    if (!authLoading && !user) {\n      openAuthModal("signin");\n      navigate("/");\n    }\n  }, [user, authLoading, navigate, openAuthModal]);\n\n  useEffect(() => {');
    
    fs.writeFileSync('src/components/PersonaDetail.tsx', code);
    console.log("Patched PersonaDetail");
}

let callCode = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

if (!callCode.includes('useAuth')) {
    callCode = callCode.replace('import { useParams, useNavigate, useSearchParams } from "react-router-dom";', 'import { useParams, useNavigate, useSearchParams } from "react-router-dom";\nimport { useAuth } from "../contexts/AuthContext";');
    callCode = callCode.replace('export default function CallSession() {', 'export default function CallSession() {\n  const { user, openAuthModal, loading: authLoading } = useAuth();');
    
    callCode = callCode.replace('useEffect(() => {', 'useEffect(() => {\n    if (!authLoading && !user) {\n      openAuthModal("signin");\n      navigate("/");\n    }\n  }, [user, authLoading, navigate, openAuthModal]);\n\n  useEffect(() => {');
    
    fs.writeFileSync('src/components/CallSession.tsx', callCode);
    console.log("Patched CallSession");
}
