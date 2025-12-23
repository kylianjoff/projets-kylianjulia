import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface GitRepo {
    id: string;
    name: string;
    description: string | null;
    url: string;
    gitUrl: string;
    liveUrl: string | null;
    defaultBranch: string;
    lastUpdate: Date;
    createdAt: Date;
    platform: 'github' | 'gitlab' | 'gitlab-isima';
    readme?: string | null;
    license?: string | null;
    readmeLoading?: boolean;
    licenseLoading?: boolean;
}

export interface ContributionDay {
    date: Date;
    count: number;
    platform: 'github' | 'gitlab' | 'gitlab-isima';
}

export interface ContributionData {
    days: ContributionDay[];
    totalCommits: number;
    startDate: Date;
    endDate: Date;
}

@Injectable({
    providedIn: 'root'
})
export class GitService {

    async getAllPublicRepos(): Promise<GitRepo[]> {
        const [githubRepos, gitlabRepos, gitlabIsimaRepos] = await Promise.all([
        this.getGithubRepos(),
        this.getGitlabRepos(),
        this.getGitlabIsimaRepos()
        ]);

        const allRepos = [...githubRepos, ...gitlabRepos, ...gitlabIsimaRepos];
        
        // Tri par date de dernière modification (plus récent d'abord)
        return allRepos.sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime());
    }

    private async getGithubRepos(): Promise<GitRepo[]> {
        const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
        };
        
        if (environment.github.token) {
        headers['Authorization'] = `token ${environment.github.token}`;
        }

        try {
        const response = await fetch(
            `https://api.github.com/users/${environment.github.username}/repos?per_page=100&type=public`,
            { headers }
        );

        if (!response.ok) {
            console.error('GitHub API error:', response.status);
            return [];
        }

        const repos = await response.json();
        
        return repos.map((repo: any) => ({
            id: `github-${repo.id}`,
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            gitUrl: repo.clone_url,
            liveUrl: repo.homepage || null,
            defaultBranch: repo.default_branch,
            lastUpdate: new Date(repo.updated_at),
            createdAt: new Date(repo.created_at),
            platform: 'github' as const
        }));
        } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
        }
    }

    private async getGitlabRepos(): Promise<GitRepo[]> {
        const headers: HeadersInit = {
        'Content-Type': 'application/json'
        };

        if (environment.gitlab.token) {
        headers['PRIVATE-TOKEN'] = environment.gitlab.token;
        }

        try {
        const response = await fetch(
            `https://gitlab.com/api/v4/users/${environment.gitlab.username}/projects?per_page=100&visibility=public`,
            { headers }
        );

        if (!response.ok) {
            console.error('GitLab API error:', response.status);
            return [];
        }

        const repos = await response.json();
        
        return repos.map((repo: any) => ({
            id: `gitlab-${repo.id}`,
            name: repo.name,
            description: repo.description,
            url: repo.web_url,
            gitUrl: repo.http_url_to_repo,
            liveUrl: repo.pages_url || null,
            defaultBranch: repo.default_branch,
            lastUpdate: new Date(repo.last_activity_at),
            createdAt: new Date(repo.created_at),
            platform: 'gitlab' as const
        }));
        } catch (error) {
        console.error('Error fetching GitLab repos:', error);
        return [];
        }
    }

    private async getGitlabIsimaRepos(): Promise<GitRepo[]> {
        const headers: HeadersInit = {
        'Content-Type': 'application/json'
        };

        if (environment.gitlabIsima.token) {
        headers['PRIVATE-TOKEN'] = environment.gitlabIsima.token;
        }

        try {
        const response = await fetch(
            `${environment.gitlabIsima.baseUrl}/api/v4/users/${environment.gitlabIsima.username}/projects?per_page=100&visibility=public`,
            { headers }
        );

        if (!response.ok) {
            console.error('GitLab ISIMA API error:', response.status);
            return [];
        }

        const repos = await response.json();
        
        return repos.map((repo: any) => ({
            id: `gitlab-isima-${repo.id}`,
            name: repo.name,
            description: repo.description,
            url: repo.web_url,
            gitUrl: repo.http_url_to_repo,
            liveUrl: null,
            defaultBranch: repo.default_branch,
            lastUpdate: new Date(repo.last_activity_at),
            createdAt: new Date(repo.created_at),
            platform: 'gitlab-isima' as const
        }));
        } catch (error) {
        console.error('Error fetching GitLab ISIMA repos:', error);
        return [];
        }
    }

    // Fonction pour décoder base64 avec support UTF-8
    private decodeBase64(str: string): string {
        try {
        const binaryString = atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
        } catch (error) {
        console.error('Error decoding base64:', error);
        return str;
        }
    }

    async fetchReadmeAndLicense(repo: GitRepo): Promise<{ readme: string | null, license: string | null }> {
        switch(repo.platform) {
        case 'github':
            return this.fetchGithubReadmeAndLicense(repo);
        case 'gitlab':
            return this.fetchGitlabReadmeAndLicense(repo, 'https://gitlab.com');
        case 'gitlab-isima':
            return this.fetchGitlabReadmeAndLicense(repo, environment.gitlabIsima.baseUrl);
        default:
            return { readme: null, license: null };
        }
    }

    private async fetchGithubReadmeAndLicense(repo: GitRepo): Promise<{ readme: string | null, license: string | null }> {
        const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
        };
        
        if (environment.github.token) {
        headers['Authorization'] = `token ${environment.github.token}`;
        }

        const match = repo.gitUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
        if (!match) return { readme: null, license: null };
        
        const [, owner, repoName] = match;

        let readme: string | null = null;
        let license: string | null = null;

        // Fetch README
        try {
        const readmeResp = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/readme`,
            { headers }
        );
        
        if (readmeResp.ok) {
            const data = await readmeResp.json();
            if (data.content) {
            readme = this.decodeBase64(data.content);
            }
        }
        } catch (error) {
        console.error(`Error fetching README for ${repo.name}:`, error);
        }

        // Fetch LICENSE
        try {
        const licenseResp = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/license`,
            { headers }
        );
        
        if (licenseResp.ok) {
            const data = await licenseResp.json();
            if (data.content) {
            license = this.decodeBase64(data.content);
            }
        }
        } catch (error) {
        console.error(`Error fetching LICENSE for ${repo.name}:`, error);
        }

        return { readme, license };
    }

    private async fetchGitlabReadmeAndLicense(repo: GitRepo, baseUrl: string): Promise<{ readme: string | null, license: string | null }> {
        const headers: HeadersInit = {
        'Content-Type': 'application/json'
        };

        const token = baseUrl.includes('isima') ? environment.gitlabIsima.token : environment.gitlab.token;
        if (token) {
        headers['PRIVATE-TOKEN'] = token;
        }

        const projectId = repo.id.split('-').pop();
        
        let readme: string | null = null;
        let license: string | null = null;

        // Fetch README (plusieurs noms possibles)
        const readmeNames = ['README.md', 'README.MD', 'readme.md', 'README', 'Readme.md'];
        
        for (const readmeName of readmeNames) {
        try {
            const readmeResp = await fetch(
            `${baseUrl}/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(readmeName)}/raw?ref=${repo.defaultBranch}`,
            { headers }
            );
            
            if (readmeResp.ok) {
            readme = await readmeResp.text();
            break;
            }
        } catch (error) {
            // Continue avec le prochain nom
        }
        }

        // Fetch LICENSE (plusieurs noms possibles)
        const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'License', 'license'];
        
        for (const licenseName of licenseNames) {
        try {
            const licenseResp = await fetch(
            `${baseUrl}/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(licenseName)}/raw?ref=${repo.defaultBranch}`,
            { headers }
            );
            
            if (licenseResp.ok) {
            license = await licenseResp.text();
            break;
            }
        } catch (error) {
            // Continue avec le prochain nom
        }
        }

        return { readme, license };
    }

    async getAllContributions(username?: string): Promise<ContributionData> {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const [githubContribs, gitlabContribs, gitlabIsimaContribs] = await Promise.all([
            this.getGithubContributions(username || environment.github.username, oneYearAgo),
            this.getGitlabContributions(username || environment.gitlab.username, oneYearAgo, 'https://gitlab.com'),
            this.getGitlabContributions(username || environment.gitlabIsima.username, oneYearAgo, environment.gitlabIsima.baseUrl)
        ]);

        // Fusionner les contributions par date
        const contributionsMap = new Map<string, ContributionDay>();

        const addContributions = (contribs: ContributionDay[]) => {
            contribs.forEach(contrib => {
            const dateKey = contrib.date.toISOString().split('T')[0];
            const existing = contributionsMap.get(dateKey);
            
            if (existing) {
                existing.count += contrib.count;
            } else {
                contributionsMap.set(dateKey, { ...contrib });
            }
            });
        };

        addContributions(githubContribs);
        addContributions(gitlabContribs);
        addContributions(gitlabIsimaContribs);

        const days = Array.from(contributionsMap.values()).sort((a, b) => 
            a.date.getTime() - b.date.getTime()
        );

        const totalCommits = days.reduce((sum, day) => sum + day.count, 0);

        return {
            days,
            totalCommits,
            startDate: oneYearAgo,
            endDate: new Date()
        };
        }

        private async getGithubContributions(username: string, since: Date): Promise<ContributionDay[]> {
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (environment.github.token) {
            headers['Authorization'] = `token ${environment.github.token}`;
        }

        try {
            // Récupérer tous les events de l'utilisateur
            const response = await fetch(
            `https://api.github.com/users/${username}/events?per_page=100`,
            { headers }
            );

            if (!response.ok) {
            console.error('GitHub events API error:', response.status);
            return [];
            }

            const events = await response.json();
            
            // Filtrer les PushEvents et compter par jour
            const contributionsMap = new Map<string, number>();

            events.forEach((event: any) => {
            if (event.type === 'PushEvent') {
                const eventDate = new Date(event.created_at);
                if (eventDate >= since) {
                const dateKey = eventDate.toISOString().split('T')[0];
                const commits = event.payload?.commits?.length || 1;
                contributionsMap.set(dateKey, (contributionsMap.get(dateKey) || 0) + commits);
                }
            }
            });

            return Array.from(contributionsMap.entries()).map(([dateStr, count]) => ({
            date: new Date(dateStr),
            count,
            platform: 'github' as const
            }));
        } catch (error) {
            console.error('Error fetching GitHub contributions:', error);
            return [];
        }
        }

        private async getGitlabContributions(username: string, since: Date, baseUrl: string): Promise<ContributionDay[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        const token = baseUrl.includes('isima') ? environment.gitlabIsima.token : environment.gitlab.token;
        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        try {
            // Récupérer l'ID de l'utilisateur
            const userResp = await fetch(
            `${baseUrl}/api/v4/users?username=${username}`,
            { headers }
            );

            if (!userResp.ok) {
            console.error('GitLab user API error:', userResp.status);
            return [];
            }

            const users = await userResp.json();
            if (!users || users.length === 0) return [];

            const userId = users[0].id;

            // Récupérer les events de l'utilisateur
            const eventsResp = await fetch(
            `${baseUrl}/api/v4/users/${userId}/events?per_page=100&after=${since.toISOString().split('T')[0]}`,
            { headers }
            );

            if (!eventsResp.ok) {
            console.error('GitLab events API error:', eventsResp.status);
            return [];
            }

            const events = await eventsResp.json();
            
            // Filtrer les pushed actions et compter par jour
            const contributionsMap = new Map<string, number>();

            events.forEach((event: any) => {
            if (event.action_name === 'pushed to' || event.action_name === 'pushed new') {
                const eventDate = new Date(event.created_at);
                if (eventDate >= since) {
                const dateKey = eventDate.toISOString().split('T')[0];
                const commits = event.push_data?.commit_count || 1;
                contributionsMap.set(dateKey, (contributionsMap.get(dateKey) || 0) + commits);
                }
            }
            });

            const platform = baseUrl.includes('isima') ? 'gitlab-isima' : 'gitlab';

            return Array.from(contributionsMap.entries()).map(([dateStr, count]) => ({
            date: new Date(dateStr),
            count,
            platform: platform as any
            }));
        } catch (error) {
            console.error(`Error fetching ${baseUrl} contributions:`, error);
            return [];
        }
    }
}