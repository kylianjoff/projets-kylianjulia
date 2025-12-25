import { Injectable, signal } from '@angular/core';
import { Projet, Etat } from '../models/projet.model';
import { GitService, GitRepo } from './git.service';

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private projetsSignal = signal<Projet[]>([]);
    private gitReposMap = new Map<number, GitRepo>();
    private customLiveUrls: { [key: string]: string } = {};
    
    // Signal pour indiquer si les projets sont chargés
    public isLoading = signal<boolean>(true);

    readonly nomEtat: string[] = [
        "En développement",
        "En ligne",
        "Projet non publié",
        "Projet actuellement en pause",
        "Développement annulé"
    ];

    readonly projets = this.projetsSignal.asReadonly();

    constructor(private gitService: GitService) {
        this.loadCustomUrls();
    }

    private async loadCustomUrls() {
        try {
            const response = await fetch('custom-live-urls.json');
            if (response.ok) {
                this.customLiveUrls = await response.json();
            } else {
                console.log('No custom URLs file found, using defaults');
                this.customLiveUrls = {};
            }
        } catch (error) {
            console.log('Could not load custom URLs, using defaults');
            this.customLiveUrls = {};
        }
        
        await this.initializeProjects();
    }

    private async initializeProjects(): Promise<void> {
        this.isLoading.set(true);
        
        try {
            const gitRepos = await this.gitService.getAllPublicRepos();
            
            const projets: Projet[] = gitRepos.map((repo, index) => {
                const id = index + 1;
                this.gitReposMap.set(id, repo);
                
                // Priorité : custom URL > homepage API > GitHub Pages
                let finalLiveUrl = this.customLiveUrls[repo.name] || repo.liveUrl;
                
                return {
                    id,
                    logo: this.getPlatformLogo(repo.platform),
                    titre: repo.name,
                    description: repo.description || 'Pas de description',
                    etat: this.determineEtat({ ...repo, liveUrl: finalLiveUrl }),
                    dateCreation: repo.createdAt,
                    dateMAJ: repo.lastUpdate,
                    gitUrl: repo.url,
                    liveUrl: finalLiveUrl,
                    readme: null,
                    license: null,
                    readmeLoading: false,
                    licenseLoading: false
                };
            });

            this.projetsSignal.set(projets);
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projetsSignal.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }

    private getPlatformLogo(platform: string): string {
        switch(platform) {
            case 'github': 
                return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
            case 'gitlab': 
                return 'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png';
            case 'gitlab-isima': 
                return 'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png';
            default: 
                return 'https://via.placeholder.com/50';
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

    getProjetByName(name: string): Projet | undefined {
        // Normalise le nom de l'URL (pour gérer les espaces, majuscules, etc.)
        const normalizedName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
        
        return this.projetsSignal().find(p => 
            p.titre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') === normalizedName
        );
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

        try {
            // Charger README et LICENSE
            const { readme, license } = await this.gitService.fetchReadmeAndLicense(gitRepo);

            // Mettre à jour le projet
            this.updateProjet(projetId, {
                readme,
                license,
                readmeLoading: false,
                licenseLoading: false
            });
        } catch (error) {
            console.error('Error loading README/LICENSE:', error);
            this.updateProjet(projetId, {
                readme: null,
                license: null,
                readmeLoading: false,
                licenseLoading: false
            });
        }
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