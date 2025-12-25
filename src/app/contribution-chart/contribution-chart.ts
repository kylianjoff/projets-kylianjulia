import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class ContributionChart implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  chart?: Chart;
  loading = true;
  error = false;
  contributionData?: ContributionData;

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
      
      // Forcer la détection des changements
      this.loading = false;
      this.cdr.detectChanges();
      
      if (this.contributionData) {
        console.log('📈 ContributionChart: Waiting for canvas...');
        // Attendre que le canvas soit rendu
        setTimeout(() => {
          console.log('📈 ContributionChart: Canvas check:', {
            hasCanvas: !!this.chartCanvas,
            hasNativeElement: !!this.chartCanvas?.nativeElement
          });
          this.createChart();
        }, 500);  // Augmenté à 500ms
      }
    } catch (err) {
      console.error('📈 ContributionChart: Error loading contributions:', err);
      this.error = true;
      this.loading = false;
    }
  }

  private createChart() {
    if (!this.contributionData) {
      console.error('📈 ContributionChart: No contribution data');
      return;
    }

    if (!this.chartCanvas?.nativeElement) {
      console.error('📈 ContributionChart: Canvas element not found');
      console.log('📈 ContributionChart: chartCanvas:', this.chartCanvas);
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('📈 ContributionChart: Cannot get canvas context');
      return;
    }

    console.log('📈 ContributionChart: Creating chart with', this.contributionData.days.length, 'days');

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

    try {
      this.chart = new Chart(ctx, config);
      console.log('📈 ContributionChart: Chart created successfully!');
    } catch (err) {
      console.error('📈 ContributionChart: Error creating chart:', err);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}