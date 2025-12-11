import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
  imports: [RouterOutlet],
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
}
