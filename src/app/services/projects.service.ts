import { Injectable, signal } from '@angular/core';
import { Projet, Etat } from '../models/projet.model';
import { GitService, GitRepo } from './git.service';

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private projetsSignal = signal<Projet[]>([]);

    readonly nomEtat: string[] = [
        "En développement",
        "En ligne",
        "Projet non publié",
        "Projet actuellement en pause",
        "Développement annulé"
    ];

    readonly projets = this.projetsSignal.asReadonly();

    constructor(private gitService: GitService) {
        this.initializeProjects();
    }

    private async initializeProjects(): Promise<void> {
        const gitRepos = await this.gitService.getAllPublicRepos();
        
        const projets: Projet[] = gitRepos.map((repo, index) => ({
            id: index + 1,
            logo: this.getPlatformLogo(repo.platform),
            titre: repo.name,
            description: repo.description || 'Pas de description',
            etat: this.determineEtat(repo),
            dateCreation: repo.createdAt,
            dateMAJ: repo.lastUpdate,
            gitUrl: repo.url,
            liveUrl: repo.liveUrl,
            readme: repo.readme,
            license: repo.license,
            readmeLoading: repo.readmeLoading,
            licenseLoading: repo.licenseLoading
        }));

        this.projetsSignal.set(projets);
    }

    private getPlatformLogo(platform: string): string {
        switch(platform) {
            case 'github': return 'logos/github.png';
            case 'gitlab': return 'logos/gitlab.png';
            case 'gitlab-isima': return 'logos/gitlabisima.png';
            default: return 'image';
        }
    }

    private determineEtat(repo: GitRepo): Etat {
        // Logique pour déterminer l'état
        // Par exemple, si liveUrl existe = EN_LIGNE, sinon EN_DEV
        if (repo.liveUrl) {
            return Etat.EN_LIGNE;
        }
        
        // Si pas d'update depuis 6 mois = EN_PAUSE
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (repo.lastUpdate < sixMonthsAgo) {
            return Etat.EN_PAUSE;
        }
        
        return Etat.EN_DEV;
    }

    getProjetById(id: number): Projet | undefined {
        return this.projetsSignal().find(p => p.id === id);
    }
}