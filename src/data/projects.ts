export type RepositoryProvider = | 'github' | 'gitlab' | 'gitlab-isima' | 'other';

export type ProjectVisibility = | 'public' | 'private' | 'internal';

export type ProjectStatus = | 'active' | 'development' | 'maintenance' | 'archived' | 'paused';

export type ProjectType = | 'mono-repo' | 'multi-repo' | 'redirect' | 'semi-automated' | 'website' | 'library' | 'application' | 'service' | 'other';

export type ReleaseType = | 'stable' | 'beta' | 'alpha' | 'rc' | 'nightly' | 'dev' | 'other';

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
  sync?: RepositorySyncConfig;
}

export interface RepositorySyncConfig {
  enabled: boolean;
  fetch?: {
    lastCommit?: boolean;
    releases?: boolean;
    tags?: boolean;
    branches?: boolean;
    stars?: boolean;
    forks?: boolean;
    openIssues?: boolean;
  };
  tokenEnv?: string;
}

export interface Technology {
  name: string;
  icon?: string;
  category?: | 'language' | 'framework' | 'library' | 'database' | 'devops' | 'tool' | 'other';
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

export const technologies: Technology[] = [
  {
    name: 'TypeScript',
    icon: 'typescript',
    category: 'language',
  },
  {
    name: 'React',
    icon: 'react',
    category: 'framework',
  },
  {
    name: 'Node.js',
    icon: 'nodejs',
    category: 'framework',
  },
  {
    name: 'Docker',
    icon: 'docker',
    category: 'devops',
  },
  {
    name: 'Python',
    icon: 'python',
    category: 'language',
  },
];


export const projects: Project[] = [
  {
    id: 'my-project',

    title: 'Mon projet',
    subtitle: 'Application web personnelle',

    description:
      'Application permettant de gérer et centraliser différents services.',

    visibility: 'public',

    status: 'active',

    type: 'application',

    icon: 'my-project',

    featured: true,

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
      },
    ],

    repositories: [
      {
        id: 'my-project-github',
        name: 'Application',
        provider: 'github',
        url: 'https://github.com/example/my-project',
        owned: true,
        primary: true,

        sync: {
          enabled: true,

          fetch: {
            lastCommit: true,
            releases: true,
            tags: true,
            stars: true,
            forks: true,
          },

          tokenEnv: 'GITHUB_TOKEN',
        },
      },
    ],

    links: [
      {
        label: 'Site',
        url: 'https://example.com',
        icon: 'globe',
        external: true,
      },

      {
        label: 'Documentation',
        url: 'https://docs.example.com',
        icon: 'book',
        external: true,
      },
    ],

    tags: [
      'web',
      'typescript',
      'react',
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


  /* ---------------------------------------------------------------------- */
  /* Projet multi-repo                                                      */
  /* ---------------------------------------------------------------------- */

  {
    id: 'my-platform',

    title: 'My Platform',
    subtitle: 'Plateforme composée de plusieurs services',

    description:
      'Projet composé d’un frontend, d’une API et de plusieurs services.',

    visibility: 'public',

    status: 'development',

    type: 'multi-repo',

    icon: 'layers',

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
      },
      {
        name: 'Docker',
        icon: 'docker',
        category: 'devops',
      },
    ],

    repositories: [
      {
        id: 'platform-frontend',
        name: 'Frontend',
        provider: 'github',
        url: 'https://github.com/example/platform-frontend',
        owned: true,
        primary: true,

        sync: {
          enabled: true,

          fetch: {
            lastCommit: true,
            releases: true,
          },

          tokenEnv: 'GITHUB_TOKEN',
        },
      },

      {
        id: 'platform-api',
        name: 'API',
        provider: 'gitlab',
        url: 'https://gitlab.com/example/platform-api',
        owned: true,

        sync: {
          enabled: true,

          fetch: {
            lastCommit: true,
            releases: true,
          },

          tokenEnv: 'GITLAB_TOKEN',
        },
      },

      {
        id: 'external-service',
        name: 'Service externe',
        provider: 'github',
        url: 'https://github.com/other-user/external-service',
        owned: false,

        sync: {
          enabled: true,

          fetch: {
            lastCommit: true,
            releases: true,
          },

          tokenEnv: 'GITHUB_TOKEN',
        },
      },
    ],
  },


  /* ---------------------------------------------------------------------- */
  /* Projet privé                                                           */
  /* ---------------------------------------------------------------------- */

  {
    id: 'private-project',

    title: 'Private Project',
    subtitle: 'Projet privé',

    description:
      'Projet non accessible publiquement.',

    visibility: 'private',

    status: 'active',

    type: 'service',

    icon: 'lock',

    repositories: [
      {
        id: 'private-project-gitlab',
        name: 'Repository',
        provider: 'gitlab-isima',
        url: 'https://gitlab.example.com/group/private-project',
        owned: true,

        sync: {
          enabled: true,

          fetch: {
            lastCommit: true,
            releases: true,
          },

          tokenEnv: 'GITLAB_ISIMA_TOKEN',
        },
      },
    ],
  },


  /* ---------------------------------------------------------------------- */
  /* Projet avec redirection                                                */
  /* ---------------------------------------------------------------------- */

  {
    id: 'external-project',

    title: 'External Project',
    subtitle: 'Projet externe',

    description:
      'Projet présenté ici mais dont le développement est hébergé sur une plateforme externe.',

    visibility: 'public',

    status: 'active',

    type: 'redirect',

    icon: 'external-link',

    repositories: [
      {
        id: 'external-repository',
        name: 'Repository',
        provider: 'github',
        url: 'https://github.com/other-user/project',
        owned: false,

        sync: {
          enabled: true,

          fetch: {
            lastCommit: true,
            releases: true,
          },

          tokenEnv: 'GITHUB_TOKEN',
        },
      },
    ],

    links: [
      {
        label: 'Voir le projet',
        url: 'https://github.com/other-user/project',
        icon: 'github',
        external: true,
      },
    ],
  },
];