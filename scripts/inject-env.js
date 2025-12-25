const fs = require('fs');
const path = require('path');

const envProdPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

let content = fs.readFileSync(envProdPath, 'utf8');

// Remplacer les placeholders par les vraies variables d'environnement
content = content.replace('GITHUB_TOKEN_PLACEHOLDER', process.env.GITHUB_TOKEN || '');
content = content.replace('GITLAB_TOKEN_PLACEHOLDER', process.env.GITLAB_TOKEN || '');
content = content.replace('GITLAB_ISIMA_TOKEN_PLACEHOLDER', process.env.GITLAB_ISIMA_TOKEN || '');

fs.writeFileSync(envProdPath, content);

console.log('✅ Tokens injected successfully');
console.log('GitHub token:', process.env.GITHUB_TOKEN ? '✓ présent' : '✗ manquant');
console.log('GitLab token:', process.env.GITLAB_TOKEN ? '✓ présent' : '✗ manquant');
console.log('GitLab ISIMA token:', process.env.GITLAB_ISIMA_TOKEN ? '✓ présent' : '✗ manquant');