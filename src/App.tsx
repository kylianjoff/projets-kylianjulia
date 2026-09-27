import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Box,
  Check,
  CircleDashedCheck,
  Code2,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Package,
  Pause,
  Search,
  Settings2,
  Tag,
  Wrench,
  X,
} from "lucide-react";

import { Footer } from "./components/Footer";
import { DataTable } from "./components/data-table";
import type { DataTableFeatures } from "./components/data-table-features";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { ButtonGroup } from "./components/ui/button-group";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import {
  projects,
  technologies,
  type Project,
  type ProjectType,
} from "./data/projects";

type VisibilityFilter = "all" | Project["visibility"];
type ReleaseFilter =
  | "all"
  | "stable"
  | "beta"
  | "alpha"
  | "rc"
  | "none";
type SortMode =
  | "lastActivity"
  | "title"
  | "repositories"
  | "releases";

function getRepositories(project: Project) {
  return project.repositories ?? [];
}

function getLastActivity(project: Project): string | undefined {
  const dates = getRepositories(project)
    .flatMap((repository) => [
      repository.stats?.lastModifiedAt,
      repository.stats?.lastCommitAt,
    ])
    .filter((date): date is string => Boolean(date));

  if (dates.length === 0) return undefined;

  return dates.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )[0];
}

function getReleases(project: Project) {
  const projectReleases = project.releases ?? [];

  const repositoryReleases = getRepositories(project).flatMap(
    (repository) => repository.stats?.releases ?? [],
  );

  return [...projectReleases, ...repositoryReleases];
}

function getLatestRelease(project: Project) {
  const releases = getReleases(project);

  if (releases.length === 0) return undefined;

  const latestExplicit = releases.find((release) => release.latest);

  if (latestExplicit) return latestExplicit;

  return [...releases].sort((a, b) => {
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;

    return (
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
    );
  })[0];
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(parsed);
}

function formatRelativeDate(date?: string) {
  if (!date) return "Aucune activité";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date inconnue";

  const diff = Date.now() - parsed.getTime();

  if (diff < 0) return formatDate(date);

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days < 30) return `Il y a ${days} j`;

  return formatDate(date);
}

function ProjectTypeIcon({ type }: { type: ProjectType }) {
  switch (type) {
    case "website":
      return <Globe className="h-4 w-4" />;
    case "library":
      return <Package className="h-4 w-4" />;
    case "application":
      return <Box className="h-4 w-4" />;
    case "mono-repo":
      return <GitBranch className="h-4 w-4" />;
    case "multi-repo":
      return <Layers className="h-4 w-4" />;
    case "semi-automated":
      return <Settings2 className="h-4 w-4" />;
    default:
      return <Code2 className="h-4 w-4" />;
  }
}

function VisibilityBadge({
  visibility,
}: {
  visibility: Project["visibility"];
}) {
  if (visibility === "public") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-500/30 text-emerald-500"
      >
        <CircleDashedCheck className="h-3 w-3" />
        Public
      </Badge>
    );
  }

  if (visibility === "private") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-red-500/30 text-red-500"
      >
        <KeyRound className="h-3 w-3" />
        Privé
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 border-yellow-500/30 text-yellow-500"
    >
      <Lock className="h-3 w-3" />
      Interne
    </Badge>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  if (!status) return null;

  const config = {
    active: {
      label: "Actif",
      icon: Check,
      className: "text-emerald-500 border-emerald-500/30",
    },
    development: {
      label: "Développement",
      icon: Wrench,
      className: "text-blue-500 border-blue-500/30",
    },
    maintenance: {
      label: "Maintenance",
      icon: Settings2,
      className: "text-yellow-500 border-yellow-500/30",
    },
    paused: {
      label: "En pause",
      icon: Pause,
      className: "text-orange-500 border-orange-500/30",
    },
    archived: {
      label: "Archivé",
      icon: Archive,
      className: "text-muted-foreground",
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1 ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

const projectTypeLabels: Record<ProjectType, string> = {
  "mono-repo": "Mono-repo",
  "multi-repo": "Multi-repo",
  redirect: "Redirection",
  "semi-automated": "Semi-automatisé",
  website: "Site web",
  library: "Librairie",
  application: "Application",
  service: "Service",
  other: "Autre",
};

export default function App() {
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] =
    useState<VisibilityFilter>("all");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [releaseFilter, setReleaseFilter] =
    useState<ReleaseFilter>("all");
  const [technology, setTechnology] = useState("all");
  const [sort, setSort] = useState<SortMode>("lastActivity");

  const technologyOptions = useMemo(() => {
    const values = new Set<string>();

    projects.forEach((project) => {
      project.technologies?.forEach((item) => {
        values.add(item.name);
      });
    });

    return [...values].sort((a, b) => a.localeCompare(b));
  }, []);

  const counts = useMemo(
    () => ({
      all: projects.length,
      public: projects.filter((project) => project.visibility === "public")
        .length,
      private: projects.filter((project) => project.visibility === "private")
        .length,
      multiRepo: projects.filter(
        (project) => project.type === "multi-repo",
      ).length,
      releases: projects.filter(
        (project) => getReleases(project).length > 0,
      ).length,
      active: projects.filter((project) => project.status === "active")
        .length,
    }),
    [],
  );

  const releaseCounts = useMemo(() => {
    const values: Exclude<ReleaseFilter, "all">[] = [
      "stable",
      "beta",
      "alpha",
      "rc",
      "none",
    ];

    return Object.fromEntries(
      values.map((value) => {
        const count = projects.filter((project) => {
          const releases = getReleases(project);

          if (value === "none") return releases.length === 0;

          return releases.some((release) => release.type === value);
        }).length;

        return [value, count];
      }),
    ) as Record<Exclude<ReleaseFilter, "all">, number>;
  }, []);

  const technologyCounts = useMemo(() => {
    return Object.fromEntries(
      technologyOptions.map((name) => [
        name,
        projects.filter((project) =>
          project.technologies?.some((item) => item.name === name),
        ).length,
      ]),
    ) as Record<string, number>;
  }, [technologyOptions]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = projects.filter((project) => {
      if (normalizedSearch) {
        const repositoryNames = getRepositories(project)
          .map((repository) => repository.name ?? "")
          .join(" ");

        const projectText = [
          project.title,
          project.subtitle,
          project.description,
          project.longDescription,
          project.tags?.join(" "),
          project.technologies?.map((item) => item.name).join(" "),
          repositoryNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!projectText.includes(normalizedSearch)) return false;
      }

      if (
        visibility !== "all" &&
        project.visibility !== visibility
      ) {
        return false;
      }

      if (type !== "all" && project.type !== type) return false;

      if (technology !== "all") {
        const hasTechnology = project.technologies?.some(
          (item) => item.name === technology,
        );

        if (!hasTechnology) return false;
      }

      if (releaseFilter !== "all") {
        const releases = getReleases(project);

        if (releaseFilter === "none") {
          if (releases.length > 0) return false;
        } else if (
          !releases.some((release) => release.type === releaseFilter)
        ) {
          return false;
        }
      }

      return true;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.localeCompare(b.title);

        case "repositories":
          return (
            getRepositories(b).length - getRepositories(a).length
          );

        case "releases":
          return getReleases(b).length - getReleases(a).length;

        case "lastActivity":
        default: {
          const dateA = getLastActivity(a);
          const dateB = getLastActivity(b);

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return (
            new Date(dateB).getTime() -
            new Date(dateA).getTime()
          );
        }
      }
    });
  }, [
    search,
    visibility,
    type,
    releaseFilter,
    technology,
    sort,
  ]);

  const columns: ColumnDef<DataTableFeatures, Project>[] = [
    {
      id: "project",
      accessorKey: "title",
      header: "Projet",
      cell: ({ row }) => {
        const project = row.original;
        const projectTechnologies = project.technologies ?? [];

        return (
          <div className="flex min-w-[320px] items-center gap-4 py-1">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {project.icon ? (
                <img
                  src={project.icon}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold">
                  {project.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">
                {project.title}
              </h3>

              <p className="truncate text-sm text-muted-foreground">
                {project.subtitle}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <VisibilityBadge visibility={project.visibility} />
                <StatusBadge status={project.status} />

                <Badge variant="outline" className="gap-1">
                  <ProjectTypeIcon type={project.type} />
                  {projectTypeLabels[project.type]}
                </Badge>

                {project.featured && (
                  <Badge variant="secondary">Mis en avant</Badge>
                )}
              </div>

              {projectTechnologies.length > 0 && (
                <div className="mt-2 flex max-w-[260px] flex-wrap gap-1">
                  {projectTechnologies.slice(0, 4).map((item) => (
                    <Badge
                      key={item.name}
                      variant="outline"
                      className="text-xs"
                    >
                      {item.name}
                    </Badge>
                  ))}

                  {projectTechnologies.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{projectTechnologies.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "repositories",
      accessorKey: "repositories",
      header: "Dépôts",
      cell: ({ row }) => {
        const repositories = getRepositories(row.original);

        if (repositories.length === 0) {
          return (
            <span className="text-muted-foreground">Aucun</span>
          );
        }

        return (
          <div className="flex min-w-[120px] flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{repositories.length}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "lastActivity",
      header: "Dernière activité",
      cell: ({ row }) => {
        const activity = getLastActivity(row.original);

        return (
          <div className="flex min-w-[140px] flex-col">
            <span className="text-sm font-medium">
              {formatRelativeDate(activity)}
            </span>

            {activity && (
              <span className="text-xs text-muted-foreground">
                {formatDate(activity)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "releases",
      header: "Releases",
      cell: ({ row }) => {
        const project = row.original;
        const releases = getReleases(project);
        const latest = getLatestRelease(project);

        if (releases.length === 0) {
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Aucune</span>
            </div>
          );
        }

        return (
          <div className="flex min-w-[130px] flex-col gap-1">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{releases.length}</span>
              <span className="text-xs text-muted-foreground">
                release{releases.length > 1 ? "s" : ""}
              </span>
            </div>

            {latest && (
              <Badge variant="secondary" className="w-fit">
                {latest.version}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  const hasFilters =
    search ||
    visibility !== "all" ||
    type !== "all" ||
    releaseFilter !== "all" ||
    technology !== "all";

  const resetFilters = () => {
    setSearch("");
    setVisibility("all");
    setType("all");
    setReleaseFilter("all");
    setTechnology("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-[80vh] w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted">
                <Layers className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Mes projets
                </h1>

                <p className="text-sm text-muted-foreground">
                  Tous mes projets, dépôts et releases au même endroit.
                </p>
              </div>
            </div>

            <div className="ml-auto rounded-xl border border-red-800 p-3">
              <h2 className="text-sm font-semibold">
                Cette page est en cours de refonte.
              </h2>
              <span className="text-xs text-muted-foreground">
                Certaines fonctionnalités ne sont pas disponibles pour
                le moment.
              </span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border bg-card p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <ButtonGroup className="w-full xl:max-w-md">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un projet..."
              />

              <Button variant="secondary" type="button">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </ButtonGroup>

            <Separator
              orientation="vertical"
              className="hidden h-8 xl:block"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={visibility === "all" ? "default" : "outline"}
                onClick={() => setVisibility("all")}
              >
                Tous
                <span className="ml-2 opacity-60">{counts.all}</span>
              </Button>

              <Button
                variant={visibility === "public" ? "default" : "outline"}
                onClick={() => setVisibility("public")}
              >
                Public
                <span className="ml-2 opacity-60">{counts.public}</span>
              </Button>

              <Button
                variant={visibility === "private" ? "default" : "outline"}
                onClick={() => setVisibility("private")}
              >
                Privé
                <span className="ml-2 opacity-60">{counts.private}</span>
              </Button>
            </div>

            <div className="flex-1" />

            <Select
              value={sort}
              onValueChange={(value) => {
                if (value) setSort(value as SortMode);
              }}
            >
              <SelectTrigger className="w-full xl:w-[210px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="lastActivity">
                  Trier : Dernière activité
                </SelectItem>
                <SelectItem value="title">Trier : Nom</SelectItem>
                <SelectItem value="repositories">
                  Trier : Nombre de dépôts
                </SelectItem>
                <SelectItem value="releases">
                  Trier : Nombre de releases
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Badge variant="outline" className="gap-1">
              <Settings2 className="h-3 w-3" />
              Filtres
            </Badge>

            <Select
              value={type}
              onValueChange={(value) => {
                setType((value ?? "all") as "all" | ProjectType);
              }}
            >
              <SelectTrigger className="h-8 w-[190px]">
                <SelectValue placeholder="Type de projet" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>

                {(Object.keys(projectTypeLabels) as ProjectType[]).map(
                  (projectType) => (
                    <SelectItem key={projectType} value={projectType}>
                      {projectTypeLabels[projectType]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={releaseFilter}
              onValueChange={(value) => {
                setReleaseFilter((value ?? "all") as ReleaseFilter);
              }}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Releases" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Toutes les releases</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="rc">RC</SelectItem>
                <SelectItem value="none">Sans release</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={technology}
              onValueChange={(value) => setTechnology(value ?? "all")}
            >
              <SelectTrigger className="h-8 w-[190px]">
                <SelectValue placeholder="Technologie" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Toutes les technologies
                </SelectItem>

                {technologyOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-[230px]">
            <Card className="flex flex-col gap-5 p-4">
              <div>
                <Label className="mb-3 block font-semibold">
                  Visibilité
                </Label>

                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted"
                    onClick={() => setVisibility("public")}
                  >
                    <span className="flex items-center gap-2">
                      <CircleDashedCheck className="h-4 w-4 text-emerald-500" />
                      Public
                    </span>
                    <span className="text-muted-foreground">
                      {counts.public}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted"
                    onClick={() => setVisibility("private")}
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-red-500" />
                      Privé
                    </span>
                    <span className="text-muted-foreground">
                      {counts.private}
                    </span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block font-semibold">
                  Statut des releases
                </Label>

                <div className="flex flex-col gap-1">
                  {(
                    [
                      ["stable", "Stable"],
                      ["beta", "Beta"],
                      ["alpha", "Alpha"],
                      ["rc", "RC"],
                      ["none", "Aucune"],
                    ] as const
                  ).map(([value, label]) => (
                    <Button
                      key={value}
                      variant="ghost"
                      className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted"
                      onClick={() => setReleaseFilter(value)}
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {label}
                      </span>

                      <span className="text-muted-foreground">
                        {releaseCounts[value]}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block font-semibold">
                  Technologies
                </Label>

                <div className="flex flex-col gap-2 overflow-y-auto text-sm">
                  {technologies.map((tech) => (
                    <button
                      key={tech.name}
                      type="button"
                      className="flex items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
                      onClick={() => setTechnology(tech.name)}
                    >
                      <span className="truncate text-muted-foreground">
                        {tech.name}
                      </span>

                      <span className="ml-2 font-medium">
                        {technologyCounts[tech.name] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </aside>

          <Card className="w-full overflow-hidden">
            <DataTable columns={columns} data={filteredProjects} />
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
