import { Injectable, signal } from '@angular/core';
import { Projet, Etat } from '../models/projet.model';

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private projetsSignal = signal<Projet[]>([
        {
        id: 1,
        logo: "image",
        titre: "KlientHTTP",
        description: "projet qui sert à quelque chose",
        etat: Etat.EN_LIGNE,
        dateCreation: new Date('2025-12-11'),
        dateMAJ: new Date('2025-12-11'),
        gitUrl: 'https://github.com/kylianjoff/KlientHTTP'
        },
        {
        id: 2,
        logo: "image",
        titre: "projet2",
        description: "lui il sert à ça",
        etat: Etat.EN_DEV,
        dateCreation: new Date('2025-11-28'),
        dateMAJ: new Date('2025-12-10')
        }
    ]);

    readonly nomEtat: string[] = [
        "En développement",
        "En ligne",
        "Projet non publié",
        "Projet actuellement en pause",
        "Développement annulé"
    ];

    readonly projets = this.projetsSignal.asReadonly();

    constructor() {
        this.initializeProjects();
    }

    private async initializeProjects(): Promise<void> {
        const projets = this.projetsSignal();
        for(const p of projets) {
            if(p.gitUrl) {
                await this.fetchRepoFiles(p);
            }
        }
    }

    getProjetById(id: number): Projet | undefined {
        return this.projetsSignal().find(p => p.id === id);
    }

    private async fetchRepoFiles(p: Projet): Promise<void> {
        p.readmeLoading = true;
        p.licenseLoading = true;

        const parsed = this.parseGithubRepo(p.gitUrl || '');
        if(!parsed) {
            p.readme = null;
            p.license = null;
            p.readmeLoading = p.licenseLoading = false;
            return;
        }

        const { owner, repo } = parsed;
        const headers = { 'Accept': 'application/vnd.github.v3+json' };

        try {
            const readmeResp = await fetch('https://api.github.com/repos/${owner}/${repo}/readme', { headers });
            if(readmeResp.ok) {
                const data = await readmeResp.json();
                if(data.content) {
                    p.readme = atob(data.content);
                } else if (data.download_url) {
                    const raw = await fetch(data.download_url);
                    if(raw.ok) p.readme = await raw.text();
                }
            } else {
                p.readme = null;
            }
        } catch {
            p.readme = null;
        } finally {
            p.readmeLoading = false;
        }

        try {
            const licenseResp = await fetch('https://api.github.com/repos/${owner}/${repo}/license', { headers });
            if(licenseResp.ok) {
                const data = await licenseResp.json();
                if(data.content) {
                    p.license = atob(data.content);
                } else if (data.download_url) {
                    const raw = await fetch(data.download_url);
                    if(raw.ok) p.license = await raw.text();
                }
            } else {
                p.license = null;
            }
        } catch {
            p.license = null;
        } finally {
            p.licenseLoading = false;
        }

        this.projetsSignal.set([...this.projetsSignal()]);
    }

    private parseGithubRepo(url: string): { owner: string; repo: string } | null {
        try {
            const u = url.trim().replace(/\.git$/, '').replace(/\/$/, '');
            const m = u.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
            if(m) {
                return { owner: m[1], repo: m[2] };
            }
            return null;
        } catch {
            return null;
        }
    }
}