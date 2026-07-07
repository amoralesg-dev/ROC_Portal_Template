export function loadPrimeFlex(): void {

    const id = 'rassini-primeflex';

    if (document.getElementById(id)) {

        return;

    }

    const link =
        document.createElement('link');

    link.id = id;

    link.rel = 'stylesheet';

    link.href =
        'https://unpkg.com/primeflex@4.0.0/primeflex.css';

    document.head.appendChild(link);

}