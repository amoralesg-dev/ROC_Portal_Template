export function loadPrimeIcons(): void {

    const id = 'rassini-primeicons';

    if (document.getElementById(id)) {

        return;

    }

    const link = document.createElement('link');

    link.id = id;

    link.rel = 'stylesheet';

    link.href =
        'https://unpkg.com/primeicons@7.0.0/primeicons.css';

    document.head.appendChild(link);

}