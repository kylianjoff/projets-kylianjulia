import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
export class ContributionChart implements OnInit {
    @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
    
    chart?: Chart;
    loading = true;
    contributionData?: ContributionData;

    constructor(private gitService: GitService) {}

    async ngOnInit() {
        this.loading = true;
        this.contributionData = await this.gitService.getAllContributions();
        this.loading = false;
        
        if (this.contributionData) {
        this.createChart();
        }
    }

    private createChart() {
        if (!this.contributionData) return;

        const ctx = this.chartCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

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
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
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
                size: 16
                }
            }
            },
            scales: {
            y: {
                beginAtZero: true,
                ticks: {
                stepSize: 1
                }
            },
            x: {
                ticks: {
                maxRotation: 45,
                minRotation: 45
                }
            }
            }
        }
        };

        this.chart = new Chart(ctx, config);
    }
}