export enum Etat {
    EN_DEV,
    EN_LIGNE,
    NON_PUBLIE,
    EN_PAUSE,
    ANNULE
}

export interface Projet {
    id: number;
    logo: string;
    titre: string;
    description: string;
    etat: Etat;
    dateCreation: Date;
    dateMAJ: Date;
    git?: string;
    result?: string;
    gitUrl?: string | null;
    liveUrl?: string | null;
    readme?: string | null;
    license?: string | null;
    readmeLoading?: boolean;
    licenseLoading?: boolean;
}