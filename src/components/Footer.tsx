export function Footer() {
    return (
        <footer className="border-t border-border bg-card/30 px-5 py-12 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-5xl">
                <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mb-12 lg:grid-cols-4 lg:gap-8">

                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                        <p className="mb-3 text-base font-bold">
                            Kylian JULIA
                        </p>

                        <p className="max-w-xs text-sm leading-relaxed text-muted">
                            Étudiant ingénieur informatique spécialisé en
                            réseaux et sécurité informatique.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                            Navigation
                        </h3>

                        <ul className="space-y-2.5 text-center sm:text-left">
                            <li>
                                <a
                                    href="/about"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    À propos
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/blog"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    Blog
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/cheatsheets"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    Cheat Sheets
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Liens utiles */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                            Liens utiles
                        </h3>

                        <ul className="space-y-2.5 text-center sm:text-left">
                            <li>
                                <a
                                    href="https://kylianjulia.fr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    Site personnel
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://github.com/kylianjoff/kylianjulia/issues/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    Signaler un bug
                                </a>
                            </li>

                            <li>
                                <animate
                                    href="/data-and-cookies"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    Données personnelles &amp; Cookies
                                </animate>
                            </li>
                        </ul>
                    </div>

                    {/* Réseaux */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                            Réseaux
                        </h3>

                        <ul className="space-y-2.5 text-center sm:text-left">
                            <li>
                                <a
                                    href="https://github.com/kylianjoff"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    GitHub
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://www.linkedin.com/in/kylian-julia/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    LinkedIn
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://www.instagram.com/kylian_julia/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-sm text-muted transition-colors hover:text-primary"
                                >
                                    Instagram
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border pt-6">
                    <p className="text-center text-xs text-muted sm:text-left">
                        &copy; {new Date().getFullYear()} Kylian JULIA.
                        Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}