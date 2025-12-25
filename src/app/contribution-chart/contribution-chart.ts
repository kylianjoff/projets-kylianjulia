import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { GitService, ContributionData } from '../services/git.service';

Chart.register(...registerables);

@Component({
  selector: 'app-contribution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contribution-chart.html',
  styleUrl: './contribution-chart.css'
})
export class ContributionChart implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  chart?: Chart;
  loading = true;
  error = false;
  contributionData?: ContributionData;

  constructor(private gitService: GitService) {}

  async ngAfterViewInit() {
    await this.loadContributions();
  }

  public async loadContributions() {
    this.loading = true;
    this.error = false;

    try {
      this.contributionData = await this.gitService.getAllContributions();
      
      if (this.contributionData && this.chartCanvas) {
        // Petit délai pour s'assurer que le canvas est bien rendu
        setTimeout(() => this.createChart(), 100);
      }
    } catch (err) {
      console.error('Error loading contributions:', err);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  private createChart() {
    if (!this.contributionData || !this.chartCanvas?.nativeElement) {
      console.error('Cannot create chart: missing data or canvas');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Cannot get canvas context');
      return;
    }

    // Préparer les données pour le graphique
    const labels = this.contributionData.days.map(day => 
      day.date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    );
    const data = this.contributionData.days.map(day => day.count);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Commits',
          data,
          backgroundColor: 'rgba(159, 0, 177, 0.6)',
          borderColor: 'rgba(159, 0, 177, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Contributions des 12 derniers mois (${this.contributionData.totalCommits} commits)`,
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#272727'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              color: '#666',
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}