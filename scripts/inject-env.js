const fs = require('fs');

const envContent = `
export const environment = {
    production: true,
    github: {
        username: 'kylianjoff',
        token: '${process.env.GITHUB_TOKEN || ''}'
    },
    gitlab: {
        username: 'kylianju382',
        token: '${process.env.GITLAB_TOKEN || ''}'
    },
    gitlabIsima: {
        baseUrl: 'https://gitlab.isima.fr',
        username: 'kyjulia',
        token: '${process.env.GITLAB_ISIMA_TOKEN || ''}'
    }
};
`;

fs.writeFileSync('src/environments/environment.prod.ts', envContent);
console.log('✅ Environment variables injected');