import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetService } from '../services/projects.service';
import { Projet } from '../models/projet.model';

@Component({
  selector: 'app-project',
  imports: [CommonModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project {
  projet: Projet | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public projetService: ProjetService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projet = this.projetService.getProjetById(id);
  }

  closeModal() {
    this.router.navigate(['/']);
  }
}
