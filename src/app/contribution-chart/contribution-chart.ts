import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitService, ContributionData } from '../services/git.service';

@Component({
  selector: 'app-contribution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contribution-chart.html',
  styleUrl: './contribution-chart.css'
})
export class ContributionChart implements AfterViewInit, OnDestroy {
  @ViewChild('heatmapContainer') heatmapContainer!: ElementRef<HTMLDivElement>;
  
  loading = true;
  error = false;
  contributionData?: ContributionData;
  months: { name: string; days: { date: Date; count: number; dayOfWeek: number }[] }[] = [];

  constructor(
    private gitService: GitService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngAfterViewInit() {
    console.log('📈 ContributionChart: ngAfterViewInit called');
    await this.loadContributions();
  }

  async loadContributions() {
    this.loading = true;
    this.error = false;

    try {
      console.log('📈 ContributionChart: Loading contributions...');
      this.contributionData = await this.gitService.getAllContributions();
      console.log('📈 ContributionChart: Data loaded:', this.contributionData);
      
      if (this.contributionData) {
        this.prepareHeatmapData();
      }
      
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('📈 ContributionChart: Error loading contributions:', err);
      this.error = true;
      this.loading = false;
    }
  }

  private prepareHeatmapData() {
    if (!this.contributionData) return;

    // Créer une map pour un accès rapide aux contributions par date
    const contributionsMap = new Map<string, number>();
    this.contributionData.days.forEach(day => {
      const dateKey = day.date.toISOString().split('T')[0];
      contributionsMap.set(dateKey, day.count);
    });

    // Générer tous les jours des 12 derniers mois
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const allDays: { date: Date; count: number; dayOfWeek: number }[] = [];
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d).toISOString().split('T')[0];
      const count = contributionsMap.get(dateKey) || 0;
      const dayOfWeek = new Date(d).getDay(); // 0 = dimanche, 6 = samedi
      
      allDays.push({
        date: new Date(d),
        count,
        dayOfWeek
      });
    }

    // Grouper par mois
    const monthsMap = new Map<string, { date: Date; count: number; dayOfWeek: number }[]>();
    
    allDays.forEach(day => {
      const monthKey = day.date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, []);
      }
      monthsMap.get(monthKey)!.push(day);
    });

    // Convertir en tableau
    this.months = Array.from(monthsMap.entries()).map(([name, days]) => ({
      name,
      days
    }));
  }

  getContributionColor(count: number): string {
    if (count === 0) return '#ebedf0';
    if (count < 5) return '#c084fc';      // Violet clair
    if (count < 10) return '#a855f7';     // Violet
    if (count < 20) return '#9333ea';     // Violet foncé
    return '#7e22ce';                     // Violet très foncé
  }

  getContributionLevel(count: number): string {
    if (count === 0) return 'Aucune contribution';
    if (count < 5) return '1-4 contributions';
    if (count < 10) return '5-9 contributions';
    if (count < 20) return '10-19 contributions';
    return '20+ contributions';
  }

  ngOnDestroy() {
    // Cleanup si nécessaire
  }
}