import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetService } from './services/projects.service';
import { ContributionChart } from './contribution-chart/contribution-chart';
import { Project } from './project/project';
import { Projet } from './models/projet.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ContributionChart, Project],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('projets-kylianjulia');
  selectedProjet = signal<Projet | null>(null);

  constructor(public projetService: ProjetService) {}

  openProjet(projet: Projet) {
    this.selectedProjet.set(projet);
  }

  closeProjet() {
    this.selectedProjet.set(null);
  }

  getEtatLabel(etat: number): string {
    return this.projetService.nomEtat[etat];
  }
}
