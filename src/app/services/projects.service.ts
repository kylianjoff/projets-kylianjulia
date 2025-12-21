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
            description: "Un client HTTP moderne en C avec interface console intéractive et support complet de toutes les méthodes HTTP.",
            etat: Etat.EN_DEV,
            dateCreation: new Date('2025-12-07'),
            dateMAJ: new Date('2025-12-21'),
            gitUrl: 'https://github.com/kylianjoff/KlientHTTP'
        },
        {
            id: 2,
            logo: "image",
            titre: "kylianjulia.fr",
            description: "Site personnel de Kylian JULIA.",
            etat: Etat.EN_LIGNE,
            dateCreation: new Date('2025-11-28'),
            dateMAJ: new Date('2025-12-10'),
            gitUrl: 'https://github.com/kylianjoff/kylianjulia',
            liveUrl: 'https://kylianjulia.fr/'
        },
        {
            id: 3,
            logo: "image",
            titre: "projets.kylianjulia.fr",
            description: "Regroupement de tous les projets de Kylian JULIA.",
            etat: Etat.EN_DEV,
            dateCreation: new Date('2025-12-11'),
            dateMAJ: new Date('2025-12-21'),
            gitUrl: 'https://github.com/kylianjoff/projets-kylianjulia',
        },
        {
            id: 4,
            logo: "image",
            titre: "Template mail IsiMalt",
            description: "Template HTML pour les mails du club de bière IsiMalt de l'ISIMA.",
            etat: Etat.EN_LIGNE,
            dateCreation: new Date(''),
            dateMAJ: new Date(''),
            gitUrl: 'https://github.com/kylianjoff/template_mail_isimalt',
            liveUrl: 'https://kylianjoff.github.io/template_mail_isimalt/Template_mail_Isimalt.html'
        },
        {
            id: 5,
            logo: "image",
            titre: "Template mail Shared",
            description: "Template HTML pour les mails du club caritatif Shared de l'ISIMA.",
            etat: Etat.EN_LIGNE,
            dateCreation: new Date(''),
            dateMAJ: new Date(''),
            gitUrl: 'https://github.com/kylianjoff/template_mail_shared',
            liveUrl: 'https://kylianjoff.github.io/template_mail_shared/Template_mail_Shared.html'
        },
        {
            id: 6,
            logo: "image",
            titre: "Coockie ClickerZZ",
            description: "Implementation des routes pour un backend d'un jeu de coockie clicker. Les retours sont conditionnés par un front",
            etat: Etat.EN_DEV,
            dateCreation: new Date('2025-11-14'),
            dateMAJ: new Date('2025-12-20'),
            gitUrl: 'https://gitlab.isima.fr/emdufrenne/projet_clicker_cs'  
        },
        {
            id: 7,
            logo: "",
            titre: "",
            description: "",
            etat: Etat.EN_LIGNE,
            dateCreation: new Date(''),
            dateMAJ: new Date('2025-12-01')
        },
        {
            id: 8,
            logo: "",
            titre: "",
            description: "",
            etat: Etat.EN_LIGNE,
            dateCreation: new Date(''),
            dateMAJ: new Date('2025-11-30')
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