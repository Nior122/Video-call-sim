const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
code = code.replace(/onClick=\{\(\) => user \? navigate\("\/dreamgirls"\) : openAuthModal\("signin"\)\}/g, 'onClick={() => navigate("/dreamgirls")}');
fs.writeFileSync('src/components/LandingPage.tsx', code);
