import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetService } from '../services/projects.service';
import { Projet } from '../models/projet.model';
import { marked, Tokens } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';

@Component({
  selector: 'app-project',
  imports: [CommonModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project implements OnInit {
  @Input() projet: Projet | undefined;
  @Output() close = new EventEmitter<void>();

  activeTab = signal<'readme' | 'license'>('readme');
  readmeHtml: SafeHtml = '';
  licenseHtml: SafeHtml = '';
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);

  constructor(
    public projetService: ProjetService,
    private sanitizer: DomSanitizer
  ) {
    // Fonction pour échapper le HTML
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Configuration de marked pour GitHub Flavored Markdown
    marked.use(gfmHeadingId());
    marked.use({
      breaks: true,
      gfm: true,
    });

    // Personnaliser le renderer
    const renderer = new marked.Renderer();
    
    // Override pour les checkboxes
    renderer.listitem = function(item: Tokens.ListItem): string {
      const text = this.parser.parse(item.tokens || []);
      
      if (item.task) {
        const checkbox = item.checked 
          ? '<input type="checkbox" disabled checked /> ' 
          : '<input type="checkbox" disabled /> ';
        return `<li class="task-list-item">${checkbox}${text}</li>\n`;
      }
      return `<li>${text}</li>\n`;
    };

    // Override pour la coloration syntaxique
    renderer.code = function(code: Tokens.Code): string {
      const language = code.lang || '';
      
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code.text, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>\n`;
        } catch (err) {
          console.error('Highlight error:', err);
        }
      }
      
      // Auto-détection du langage si non spécifié
      try {
        const highlighted = hljs.highlightAuto(code.text).value;
        return `<pre><code class="hljs">${highlighted}</code></pre>\n`;
      } catch (err) {
        // Fallback sans coloration
        return `<pre><code>${escapeHtml(code.text)}</code></pre>\n`;
      }
    };

    // Override pour le code inline
    renderer.codespan = function(code: Tokens.Codespan): string {
      return `<code>${escapeHtml(code.text)}</code>`;
    };

    marked.use({ renderer });
  }

  async ngOnInit() {
    if (!this.projet) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    await this.projetService.loadReadmeAndLicense(this.projet.id);
    this.projet = this.projetService.getProjetById(this.projet.id);

    if (this.projet?.readme) {
      const html = await marked.parse(this.projet.readme);
      this.readmeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
      
    if (this.projet?.license) {
      const html = await marked.parse(this.projet.license);
      this.licenseHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }

    this.loading.set(false);
  }

  closeModal() {
    this.close.emit();
  }

  setActiveTab(tab: 'readme' | 'license') {
    this.activeTab.set(tab);
  }
}