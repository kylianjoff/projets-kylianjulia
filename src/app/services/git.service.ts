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
}