import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

export enum Etat {
  EN_DEV,
  EN_LIGNE,
  NON_PUBLIE,
  EN_PAUSE,
  ANNULE
}

export interface Projet {
  logo: string;
  titre: string;
  description: string;
  etat: Etat;
  dateCreation: Date;
  dateMAJ: Date;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('projets-kylianjulia');

  nomEtat: string[] = [
    "En développement",
    "En ligne",
    "Projet non publié",
    "Projet actuellement en pause",
    "Développement annulé"
  ];

  projets: Projet[] = [
    {
      logo: "image",
      titre: "projet1",
      description: "projet qui sert à quelque chose",
      etat: Etat.EN_LIGNE,
      dateCreation: new Date('2025-12-11'),
      dateMAJ: new Date('2025-12-11')
    },
    {
      logo: "image",
      titre: "projet2",
      description: "lui il sert à ça",
      etat: Etat.EN_DEV,
      dateCreation: new Date('2025-11-28'),
      dateMAJ: new Date('2025-12-10')
    }
  ]
}
