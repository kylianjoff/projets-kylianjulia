import { Injectable, signal } from '@angular/core';
import { Projet, Etat } from '../models/projet.model';
import { GitService, GitRepo } from './git.service';

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private projetsSignal = signal<Projet[]>([]);
    private gitReposMap = new Map<number, GitRepo>(); // Pour garder la référence aux GitRepo

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
        
        const projets: Projet[] = gitRepos.map((repo, index) => {
            const id = index + 1;
            this.gitReposMap.set(id, repo); // Sauvegarde la référence
            
            return {
                id,
                logo: this.getPlatformLogo(repo.platform),
                titre: repo.name,
                description: repo.description || 'Pas de description',
                etat: this.determineEtat(repo),
                dateCreation: repo.createdAt,
                dateMAJ: repo.lastUpdate,
                gitUrl: repo.url,
                liveUrl: repo.liveUrl,
                readme: null,
                license: null,
                readmeLoading: false,
                licenseLoading: false
            };
        });

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
        if (repo.liveUrl) {
            return Etat.EN_LIGNE;
        }
        
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

    async loadReadmeAndLicense(projetId: number): Promise<void> {
        const projet = this.getProjetById(projetId);
        const gitRepo = this.gitReposMap.get(projetId);
        
        if (!projet || !gitRepo) return;

        // Si déjà chargé, ne rien faire
        if (projet.readme !== null || projet.license !== null) return;

        // Marquer comme en cours de chargement
        this.updateProjet(projetId, { readmeLoading: true, licenseLoading: true });

        // Charger README et LICENSE
        const { readme, license } = await this.gitService.fetchReadmeAndLicense(gitRepo);

        // Mettre à jour le projet
        this.updateProjet(projetId, {
            readme,
            license,
            readmeLoading: false,
            licenseLoading: false
        });
    }

    private updateProjet(id: number, updates: Partial<Projet>): void {
        const projets = this.projetsSignal();
        const index = projets.findIndex(p => p.id === id);
        
        if (index !== -1) {
            const updatedProjets = [...projets];
            updatedProjets[index] = { ...updatedProjets[index], ...updates };
            this.projetsSignal.set(updatedProjets);
        }
    }
}