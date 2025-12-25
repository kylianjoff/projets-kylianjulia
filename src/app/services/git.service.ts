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

  // ========== RÉCUPÉRATION DES REPOS ==========

  async getAllPublicRepos(): Promise<GitRepo[]> {
    const [githubRepos, gitlabRepos, gitlabIsimaRepos, manualRepos] = await Promise.all([
      this.getGithubRepos(),
      this.getGitlabRepos(),
      this.getGitlabIsimaRepos(),
      this.getManualRepos()
    ]);

    const allRepos = [...githubRepos, ...gitlabRepos, ...gitlabIsimaRepos, ...manualRepos];
    return allRepos.sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime());
  }

  private async getGithubRepos(): Promise<GitRepo[]> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (environment.github?.token) {
      headers['Authorization'] = `Bearer ${environment.github.token}`;
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
      
      return repos.map((repo: any) => {
        let liveUrl = repo.homepage || null;
        
        if (!liveUrl && repo.has_pages) {
          liveUrl = `https://${environment.github.username}.github.io/${repo.name}`;
        }
        
        return {
          id: `github-${repo.id}`,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          gitUrl: repo.clone_url,
          liveUrl: liveUrl,
          defaultBranch: repo.default_branch,
          lastUpdate: new Date(repo.updated_at),
          createdAt: new Date(repo.created_at),
          platform: 'github' as const
        };
      });
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      return [];
    }
  }

  private async getGitlabRepos(): Promise<GitRepo[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (!environment.production && environment.gitlab?.token) {
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
      
      return repos.map((repo: any) => {
        let liveUrl = null;
        
        if (repo.pages_access_level !== 'disabled') {
          const namespace = repo.namespace?.path || environment.gitlab.username;
          liveUrl = `https://${namespace}.gitlab.io/${repo.path}`;
        }
        
        return {
          id: `gitlab-${repo.id}`,
          name: repo.name,
          description: repo.description,
          url: repo.web_url,
          gitUrl: repo.http_url_to_repo,
          liveUrl: liveUrl,
          defaultBranch: repo.default_branch,
          lastUpdate: new Date(repo.last_activity_at),
          createdAt: new Date(repo.created_at),
          platform: 'gitlab' as const
        };
      });
    } catch (error) {
      console.error('Error fetching GitLab repos:', error);
      return [];
    }
  }

  private async getGitlabIsimaRepos(): Promise<GitRepo[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (!environment.production && environment.gitlabIsima?.token) {
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
      
      return repos.map((repo: any) => {
        let liveUrl = null;
        
        if (repo.pages_access_level !== 'disabled') {
          const namespace = repo.namespace?.path || environment.gitlabIsima.username;
          liveUrl = `https://${namespace}.pages.isima.fr/${repo.path}`;
        }
        
        return {
          id: `gitlab-isima-${repo.id}`,
          name: repo.name,
          description: repo.description,
          url: repo.web_url,
          gitUrl: repo.http_url_to_repo,
          liveUrl: liveUrl,
          defaultBranch: repo.default_branch,
          lastUpdate: new Date(repo.last_activity_at),
          createdAt: new Date(repo.created_at),
          platform: 'gitlab-isima' as const
        };
      });
    } catch (error) {
      console.error('Error fetching GitLab ISIMA repos:', error);
      return [];
    }
  }

  // ========== README ET LICENSE ==========

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
    
    if (environment.github?.token) {
      headers['Authorization'] = `Bearer ${environment.github.token}`;
    }

    const match = repo.gitUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!match) return { readme: null, license: null };
    
    const [, owner, repoName] = match;

    let readme: string | null = null;
    let license: string | null = null;

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
    if (!environment.production && token) {
      headers['PRIVATE-TOKEN'] = token;
    }

    const projectId = repo.id.split('-').pop();
    
    let readme: string | null = null;
    let license: string | null = null;

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
        // Continue
      }
    }

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
        // Continue
      }
    }

    return { readme, license };
  }

  // ========== CONTRIBUTIONS ==========

  async getAllContributions(): Promise<ContributionData> {
    console.log('🚀 Starting to fetch contributions...');
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    try {
      const [githubContribs, gitlabContribs, gitlabIsimaContribs] = await Promise.all([
        this.getGithubContributions(oneYearAgo),
        this.getGitlabContributions(oneYearAgo, 'https://gitlab.com', environment.gitlab.username, environment.gitlab.token),
        this.getGitlabContributions(oneYearAgo, environment.gitlabIsima.baseUrl, environment.gitlabIsima.username, environment.gitlabIsima.token)
      ]);

      console.log('📊 GitHub contributions:', githubContribs.length);
      console.log('📊 GitLab contributions:', gitlabContribs.length);
      console.log('📊 GitLab ISIMA contributions:', gitlabIsimaContribs.length);

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

      console.log('✅ Total contributions loaded:', totalCommits);

      return {
        days,
        totalCommits,
        startDate: oneYearAgo,
        endDate: new Date()
      };
    } catch (error) {
      console.error('❌ Error loading contributions:', error);
      throw error;
    }
  }

  private async getGithubContributions(since: Date): Promise<ContributionDay[]> {
    // Pour GitHub, on utilise l'API GraphQL pour avoir toutes les contributions
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (environment.github?.token) {
      headers['Authorization'] = `Bearer ${environment.github.token}`;
    }

    const query = `
        query {
        user(login: "${environment.github.username}") {
            contributionsCollection {
            contributionCalendar {
                totalContributions
                weeks {
                contributionDays {
                    contributionCount
                    date
                }
                }
            }
            }
        }
        }
    `;

    try {
        const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
        });

        if (!response.ok) {
        console.error('GitHub GraphQL API error:', response.status);
        // Fallback sur l'API REST si GraphQL échoue
        return this.getGithubContributionsFallback(since);
        }

        const data = await response.json();
        
        if (!data.data?.user?.contributionsCollection) {
        console.error('GitHub GraphQL: No data returned');
        return this.getGithubContributionsFallback(since);
        }

        const contributions: ContributionDay[] = [];
        const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;

        weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
            const dayDate = new Date(day.date);
            if (dayDate >= since) {
            contributions.push({
                date: dayDate,
                count: day.contributionCount,
                platform: 'github'
            });
            }
        });
        });

        console.log('GitHub GraphQL contributions loaded:', contributions.length);
        return contributions;

    } catch (error) {
        console.error('Error fetching GitHub GraphQL contributions:', error);
        return this.getGithubContributionsFallback(since);
    }
    }

    private async getGithubContributionsFallback(since: Date): Promise<ContributionDay[]> {
        console.log('Using GitHub Events API fallback...');
        
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (environment.github?.token) {
          headers['Authorization'] = `Bearer ${environment.github.token}`;
        }

        try {
            const response = await fetch(
            `https://api.github.com/users/${environment.github.username}/events?per_page=100`,
            { headers }
            );

            if (!response.ok) {
            console.error('GitHub events API error:', response.status);
            return [];
            }

            const events = await response.json();
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

    private async getGitlabContributions(since: Date, baseUrl: string, username: string, token?: string): Promise<ContributionDay[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        try {
            // Récupérer tous les projets de l'utilisateur
            const projectsResp = await fetch(
            `${baseUrl}/api/v4/users/${username}/projects?per_page=100`,
            { headers }
            );

            if (!projectsResp.ok) {
            console.error(`GitLab projects API error (${baseUrl}):`, projectsResp.status);
            return [];
            }

            const projects = await projectsResp.json();
            const contributionsMap = new Map<string, number>();

            // Pour chaque projet, récupérer les commits de l'utilisateur
            for (const project of projects) {
            try {
                const commitsResp = await fetch(
                `${baseUrl}/api/v4/projects/${project.id}/repository/commits?author=${username}&since=${since.toISOString()}&per_page=100`,
                { headers }
                );

                if (commitsResp.ok) {
                const commits = await commitsResp.json();
                
                commits.forEach((commit: any) => {
                    const commitDate = new Date(commit.created_at);
                    const dateKey = commitDate.toISOString().split('T')[0];
                    contributionsMap.set(dateKey, (contributionsMap.get(dateKey) || 0) + 1);
                });
                }
            } catch (err) {
                console.error(`Error fetching commits for project ${project.name}:`, err);
            }
            }

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

    private async getManualRepos(): Promise<GitRepo[]> {
      try {
        const response = await fetch('manual-repos.json');
        if (!response.ok) {
          console.log('No manual repos file found');
          return [];
        }

        const data: { repos: (string | { url: string; id?: number })[] } = await response.json();
        
        const reposPromises = data.repos.map(repo => {
          if (typeof repo === 'string') {
            // Ancien format (juste URL)
            return this.fetchRepoFromUrl(repo);
          } else {
            // Nouveau format (URL + ID optionnel)
            return this.fetchRepoFromUrl(repo.url, repo.id);
          }
        });
        
        const repos = await Promise.all(reposPromises);
        
        return repos.filter(repo => repo !== null) as GitRepo[];
      } catch (error) {
        console.log('Could not load manual repos:', error);
        return [];
      }
    }

    private async fetchRepoFromUrl(url: string, projectId?: number): Promise<GitRepo | null> {
      try {
        if (url.includes('github.com')) {
          return this.fetchGithubRepoByUrl(url);
        } else if (url.includes('gitlab.isima.fr')) {
          return this.fetchGitlabRepoByUrl(url, environment.gitlabIsima.baseUrl, 'gitlab-isima', projectId);
        } else if (url.includes('gitlab.com')) {
          return this.fetchGitlabRepoByUrl(url, 'https://gitlab.com', 'gitlab', projectId);
        }
        
        console.warn(`Unknown platform for URL: ${url}`);
        return null;
      } catch (error) {
        console.error(`Error fetching repo from ${url}:`, error);
        return null;
      }
    }

        private async fetchGithubRepoByUrl(url: string): Promise<GitRepo | null> {
        // Extraire owner et repo de l'URL
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return null;
        
        const [, owner, repo] = match;
        
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (environment.github?.token) {
          headers['Authorization'] = `Bearer ${environment.github.token}`;
        }

        try {
            const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}`,
            { headers }
            );

            if (!response.ok) {
            console.error(`GitHub API error for ${owner}/${repo}:`, response.status);
            return null;
            }

            const repoData = await response.json();
            
            let liveUrl = repoData.homepage || null;
            if (!liveUrl && repoData.has_pages) {
            liveUrl = `https://${owner}.github.io/${repo}`;
            }
            
            return {
            id: `manual-github-${repoData.id}`,
            name: repoData.name,
            description: repoData.description,
            url: repoData.html_url,
            gitUrl: repoData.clone_url,
            liveUrl: liveUrl,
            defaultBranch: repoData.default_branch,
            lastUpdate: new Date(repoData.updated_at),
            createdAt: new Date(repoData.created_at),
            platform: 'github' as const
            };
        } catch (error) {
            console.error(`Error fetching GitHub repo ${owner}/${repo}:`, error);
            return null;
        }
        }

    private async fetchGitlabRepoByUrl(url: string, baseUrl: string, platform: 'gitlab' | 'gitlab-isima', projectId?: number): Promise<GitRepo | null> {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      const token = platform === 'gitlab-isima' ? environment.gitlabIsima.token : environment.gitlab.token;
      if (token) {
        headers['PRIVATE-TOKEN'] = token;
      }

      try {
        let apiUrl: string;
        
        if (projectId) {
          // Utiliser l'ID du projet (plus fiable pour les projets privés)
          apiUrl = `${baseUrl}/api/v4/projects/${projectId}`;
          console.log(`📡 Fetching ${platform} by ID:`, projectId);
        } else {
          // Utiliser le path (ancien comportement)
          const match = url.match(/gitlab\.[^\/]+\/(.+)/);
          if (!match) return null;
          
          let projectPath = match[1].replace(/\.git$/, '').replace(/\/$/, '');
          const encodedPath = encodeURIComponent(projectPath);
          apiUrl = `${baseUrl}/api/v4/projects/${encodedPath}`;
          console.log(`📡 Fetching ${platform} by path:`, projectPath);
        }
        
        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
          console.error(`GitLab API error for ${url}:`, response.status);
          return null;
        }

        const repoData = await response.json();
        
        let liveUrl = null;
        if (repoData.pages_access_level !== 'disabled') {
          const namespace = repoData.namespace?.path || repoData.namespace?.name;
          liveUrl = `https://${namespace}.${platform === 'gitlab-isima' ? 'pages.isima.fr' : 'gitlab.io'}/${repoData.path}`;
        }
        
        return {
          id: `manual-${platform}-${repoData.id}`,
          name: repoData.name,
          description: repoData.description,
          url: repoData.web_url,
          gitUrl: repoData.http_url_to_repo,
          liveUrl: liveUrl,
          defaultBranch: repoData.default_branch,
          lastUpdate: new Date(repoData.last_activity_at),
          createdAt: new Date(repoData.created_at),
          platform: platform
        };
      } catch (error) {
        console.error(`Error fetching GitLab repo ${url}:`, error);
        return null;
      }
    }
}