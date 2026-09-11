const fs = require('fs');
let content = fs.readFileSync('src/components/CallSession.tsx', 'utf8');

if (!content.includes('import { useAuth } from "../contexts/AuthContext";')) {
  content = content.replace(
    /import \{ useParams, useNavigate, useSearchParams \} from "react-router-dom";/,
    'import { useParams, useNavigate, useSearchParams } from "react-router-dom";\nimport { useAuth } from "../contexts/AuthContext";'
  );
}

if (!content.includes('const { user, openAuthModal, loading: authLoading } = useAuth();')) {
  content = content.replace(
    /const \[chatImageLightbox, setChatImageLightbox\] = useState<string \| null>\(null\);/,
    'const [chatImageLightbox, setChatImageLightbox] = useState<string | null>(null);\n  const { user, openAuthModal, loading: authLoading } = useAuth();'
  );
}

if (!content.includes('useEffect(() => {\n    if (!authLoading && !user) {')) {
  content = content.replace(
    /useEffect\(\(\) => \{\n    if \(slug\) \{/,
    'useEffect(() => {\n    if (!authLoading && !user) {\n      openAuthModal("signin");\n      navigate(`/dreamgirl/${slug}`);\n    }\n  }, [user, authLoading, navigate, openAuthModal, slug]);\n\n  useEffect(() => {\n    if (slug) {'
  );
}

fs.writeFileSync('src/components/CallSession.tsx', content);
