import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjetService } from './services/projects.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
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
