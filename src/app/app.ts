import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjetService } from './services/projects.service';
import { ContributionChart } from './contribution-chart/contribution-chart';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ContributionChart],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('projets-kylianjulia');

  constructor(
    public projetService: ProjetService,
    private router: Router
  ) {}

  openProjet(id:number) {
    this.router.navigate(['/project', id]);
  }

  getEtatLabel(etat: number): string {
    return this.projetService.nomEtat[etat];
  }
}
