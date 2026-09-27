export type RepositoryProvider = | 'github' | 'gitlab' | 'gitlab-isima' | 'other';

export type ProjectVisibility = | 'public' | 'private';

export type ProjectStatus = | 'active' | 'development' | 'maintenance' | 'paused' | 'archived';

export type ProjectType = | 'mono-repo' | 'multi-repo' | 'redirect' | 'semi-automated' | 'website' | 'library' | 'application' | 'service' | 'other';

export type ReleaseType = | 'stable' | 'beta' | 'alpha' | 'rc' | 'nightly' | 'dev' | 'other';

export type TechnologyCategory = | 'language' | 'framework' | 'library' | 'database' | 'devops' | 'tool' | 'other';

export interface Repository {
  id: string;
  provider: RepositoryProvider;
  url: string;
  name?: string;
  description?: string;
  owned?: boolean;
  primary?: boolean;
  archived?: boolean;
  defaultBranch?: string;
  stats?: RepositoryStats;
  sync?: RepositorySyncConfig;
}

export interface RepositorySyncConfig {
  enabled: boolean;
  tokenEnv?: string;
  fetch?: {
    lastCommit?: boolean;
    releases?: boolean;
    tags?: boolean;
    branches?: boolean;
    stars?: boolean;
    forks?: boolean;
    openIssues?: boolean;
    lastCommitAuthor?: boolean;
  };
}

export interface RepositoryStats {
  lastModifiedAt?: string;
  lastCommitAt?: string;
  lastCommitSha?: string;
  lastCommitAuthor?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  releases?: ProjectRelease[];
  fetchedAt?: string;
  syncError?: string;
}

export interface Technology {
  name: string;
  icon?: string;
  category?: TechnologyCategory;
  version?: string;
}

export interface ProjectRelease {
  version: string;
  name?: string;
  type?: ReleaseType;
  publishedAt?: string;
  url?: string;
  latest?: boolean;
  prerelease?: boolean;
  repositoryId?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
  icon?: string;
  external?: boolean;
}

export interface ProjectSyncConfig {
  enabled: boolean;
  interval?: number;
  fetch?: {
    repositories?: boolean;
    releases?: boolean;
    lastActivity?: boolean;
    statistics?: boolean;
  };
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription?: string;
  icon?: string;
  image?: string;
  visibility: ProjectVisibility;
  status?: ProjectStatus;
  type: ProjectType;
  technologies?: Technology[];
  repositories?: Repository[];
  releases?: ProjectRelease[];
  links?: ProjectLink[];
  license?: string;
  startedAt?: string;
  endedAt?: string;
  featured?: boolean;
  tags?: string[];
  sync?: ProjectSyncConfig;
}

export const technologies: Technology[] = [
  {
    name: 'C',
    icon: 'c',
    category: 'language',
  },
  {
    name: 'C#',
    icon: 'csharp',
    category: 'language',
  },
  {
    name: '.NET',
    icon: 'dotnet',
    category: 'framework',
  },
  {
    name: 'TypeScript',
    icon: 'typescript',
    category: 'language',
  },
  {
    name: 'JavaScript',
    icon: 'javascript',
    category: 'language',
  },
  {
    name: 'React',
    icon: 'react',
    category: 'framework',
  },
  {
    name: 'Angular',
    icon: 'angular',
    category: 'framework',
  },
  {
    name: 'Colyseus',
    icon: 'colyseus',
    category: 'framework',
  },
  {
    name: 'Bash',
    icon: 'bash',
    category: 'language',
  },
  {
    name: 'PowerShell',
    icon: 'powershell',
    category: 'language',
  }
];


export const projects: Project[] = [
  {
    id: 'kylianjulia',
    title: 'Site personnel',
    subtitle: 'Mon site web personnel',
    description: 'Mon site web personnel présentant mes projets, mon parcours, mes compétences ainsi qu\'un blog.',
    visibility: 'public',
    status: 'active',
    type: 'website',
    technologies: [
      {
        name: 'TypeScript',
        icon: 'typescript',
        category: 'language',
      },
      {
        name: 'React',
        icon: 'react',
        category: 'framework',
      }
    ],
    repositories: [
      {
        id: 'kylianjulia-github',
        name: 'kylianjulia',
        provider: 'github',
        url: 'https://github.com/kylianjoff/kylianjulia',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    links: [
      {
        label: 'Site',
        url: 'https://kylianjulia.fr',
        icon: 'globe',
        external: true,
      },
    ],
    tags: [
      'web',
      'typescript',
      'react',
      'personal',
      'blog',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'projet-kylianjulia',
    title: 'Page projet',
    subtitle: 'Page présentant mes projets',
    description: 'Page additionnelle de mon site personnel présentant tous mes projets (ce site actuel).',
    visibility: 'public',
    status: 'active',
    type: 'website',
    technologies: [
      {
        name: 'TypeScript',
        icon: 'typescript',
        category: 'language',
      },
      {
        name: 'React',
        icon: 'react',
        category: 'framework',
      }
    ],
    repositories: [
      {
        id: 'projets-kylianjulia-github',
        name: 'projets-kylianjulia',
        provider: 'github',
        url: 'https://github.com/kylianjoff/projets-kylianjulia',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    links: [
      {
        label: 'Site',
        url: 'https://projets.kylianjulia.fr',
        icon: 'globe',
        external: true,
      },
    ],
    tags: [
      'web',
      'typescript',
      'react',
      'personal',
      'project',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'spotlight-for-windows',
    title: 'Spotlight for Windows',
    subtitle: 'Barre de recherche moderne pour Windows',
    description: 'Recréation d\'une barre de recherche moderne pour Windows inspiré de la spotlight de macOS.',
    visibility: 'public',
    status: 'development',
    type: 'application',
    technologies: [
      {
        name: 'JavaScript',
        icon: 'javascript',
        category: 'language',
      }
    ],
    repositories: [
      {
        id: 'spotlight-for-windows-github',
        name: 'spotlight-for-windows',
        provider: 'github',
        url: 'https://github.com/kylianjoff/spotlight-for-windows',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    links: [
      {
        label: 'Site',
        url: 'https://spotlight.kylianjulia.fr',
        icon: 'globe',
        external: true,
      },
    ],
    tags: [
      'windows',
      'javascript',
      'desktop',
      'spotlight',
      'search',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'KlientHTTP',
    title: 'KlientHTTP',
    subtitle: 'Client socket HTTP',
    description: 'Un client HTTP moderne en C avec interface console interactive et support complet de toutes les méthodes HTTP.',
    visibility: 'public',
    status: 'development',
    type: 'application',
    technologies: [
      {
        name: 'C',
        icon: 'c',
        category: 'language',
      }
    ],
    repositories: [
      {
        id: 'klienthttp-github',
        name: 'KlientHTTP',
        provider: 'github',
        url: 'https://github.com/kylianjoff/KlientHTTP',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    tags: [
      'c',
      'http',
      'socket',
      'console',
      'client',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'projet-reseaux',
    title: 'Projet Réseaux',
    subtitle: 'Déploiement automatique de machine virtuelle',
    description: 'Ce dépôt permet de créer et installer automatiquement des VM (clients, serveurs, pare‑feu) dans VirtualBox. Le script crée les VM, configure le réseau NAT + DMZ/LAN, lance l’installation Debian sans interaction, injecte les scripts Bash pendant l’installation et configure automatiquement le clavier en français.',
    visibility: 'public',
    status: 'archived',
    type: 'other',
    technologies: [
      {
        name: 'Bash',
        icon: 'bash',
        category: 'language',
      },
      {
        name: 'PowerShell',
        icon: 'powershell',
        category: 'language',
      }
    ],
    repositories: [
      {
        id: 'projet-reseaux-github',
        name: 'Projet Réseaux',
        provider: 'github',
        url: 'https://github.com/kylianjoff/projet-reseaux',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    links: [
      {
        label: 'Documentation',
        url: 'https://kylianjoff.github.io/projet-reseaux/',
        icon: 'book',
        external: true
      }
    ],
    tags: [
      'bash',
      'powershell',
      'virtualbox',
      'vm',
      'network',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'defissport',
    title: 'Défis Sport',
    subtitle: 'Suivi des défis sportifs',
    description: 'Page web pour suivre mes défis sportifs sur une carte intéractive.',
    visibility: 'private',
    status: 'active',
    type: 'website',
    technologies: [
      {
        name: 'TypeScript',
        icon: 'typescript',
        category: 'language',
      },
      {
        name: 'React',
        icon: 'react',
        category: 'framework',
      }
    ],
    repositories: [
      {
        id: 'defissport-github',
        name: 'defissport',
        provider: 'github',
        url: 'https://github.com/kylianjoff/defissport',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    links: [
      {
        label: 'Site',
        url: 'https://defissport.kylianjulia.fr',
        icon: 'globe',
        external: true,
      },
    ],
    tags: [
      'web',
      'typescript',
      'react',
      'personal',
      'sports',
      'tracking',
      'interactive',
      'map',
      'challenges',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'ssdl2',
    title: 'SSDL2',
    subtitle: 'Librairie SSDL2 pour C',
    description: 'SSDL2 – Simplified SDL2, so you can focus on building games, not boilerplate.',
    visibility: 'public',
    status: 'development',
    type: 'library',
    technologies: [
      {
        name: 'C',
        icon: 'c',
        category: 'language',
      }
    ],
    repositories: [
      {
        id: 'ssdl2-github',
        name: 'ssdl2',
        provider: 'github',
        url: 'https://github.com/kylianjoff/ssdl2',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITHUB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    links: [
      {
        label: 'Site',
        url: 'https://kylianjoff.github.io/SSDL2',
        icon: 'globe',
        external: true,
      },
    ],
    tags: [
      'c',
      'library',
      'game',
      'development',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'trio',
    title: 'Trio',
    subtitle: 'Jeu de carte Trio sur le web',
    description: 'Recréation du jeu de carte Trio sur le web, projet académique avec intégration continue.',
    visibility: 'private',
    status: 'archived',
    type: 'website',
    technologies: [
      {
        name: 'TypeScript',
        icon: 'typescript',
        category: 'language',
      },
      {
        name: 'Angular',
        icon: 'angular',
        category: 'framework',
      },
      {
        name: 'Colyseus',
        icon: 'colyseus',
        category: 'framework',
      }
    ],
    repositories: [
      {
        id: 'triofrontend-gitlab',
        name: 'trio-frontend',
        provider: 'gitlab',
        url: 'https://gitlab.com/kj8001838/angular20-starter',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITLAB_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      },
      {
        id: 'triobackend-gitlab',
        name: 'trio-backend',
        provider: 'gitlab',
        url: 'https://gitlab.com/kj8001838/colyseusstarter',
        owned: true,
        primary: true,
        defaultBranch: 'main',
        sync: {
          enabled: true,

          tokenEnv: 'GITLAB_TOKEN',
          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          }
        }
      }
    ],
    tags: [
      'typescript',
      'angular',
      'colyseus',
      'website',
      'game',
      'continuous-integration',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'cookie-clicker',
    title: 'Cookie Clicker',
    subtitle: 'Backend d\'un jeu Cookie Clicker',
    description: 'Backend d\'un jeu Cookie Clicker développé en C# avec le framework .NET.',
    visibility: 'public',
    status: 'archived',
    type: 'other',
    technologies: [
      {
        name: 'C#',
        icon: 'csharp',
        category: 'language',
      },
      {
        name: '.NET',
        icon: 'dotnet',
        category: 'framework',
      }
    ],
    repositories: [
      {
        id: 'cookie-clicker-gitlab-isima',
        name: 'projet-clicker-cs',
        provider: 'gitlab-isima',
        url: 'https://gitlab.isima.fr/emdufrenne/projet_clicker_cs',
        owned: true,
        primary: true,
        defaultBranch: 'master',
        sync: {
          enabled: true,

          tokenEnv: 'GITLAB_ISIMA_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    tags: [
      'c#',
      '.net',
      'game',
      'backend',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
  {
    id: 'projet-zz1',
    title: 'Jeu de labyrinthe',
    subtitle: 'Jeu de labyrinthe en C avec SDL2 (projet ZZ1)',
    description: 'Jeu de labyrinthe en C avec SDL2 développé dans le cadre du projet de ZZ1.',
    visibility: 'public',
    status: 'archived',
    type: 'application',
    technologies: [
      {
        name: 'C',
        icon: 'c',
        category: 'language',
      },
      {
        name: 'SDL2',
        icon: 'sdl2',
        category: 'library',
      }
    ],
    repositories: [
      {
        id: 'projet-zz1-groupe-10-gitlab-isima',
        name: 'projet-zz1-groupe-10',
        provider: 'gitlab-isima',
        url: 'https://gitlab.isima.fr/adibnouzah/projet-zz1-groupe-10',
        owned: false,
        primary: true,
        defaultBranch: 'master',
        sync: {
          enabled: true,

          tokenEnv: 'GITLAB_ISIMA_TOKEN',

          fetch: {
            lastCommit: true,
            lastCommitAuthor: true,
            releases: true,
            tags: true,
            branches: true,
            stars: true,
            forks: true,
            openIssues: true,
          },
        },
      }
    ],
    tags: [
      'c',
      'sdl2',
      'game',
      'academic',
      'zz1',
    ],
    sync: {
      enabled: true,
      interval: 3600,
      fetch: {
        repositories: true,
        releases: true,
        lastActivity: true,
        statistics: true,
      },
    },
  },
];