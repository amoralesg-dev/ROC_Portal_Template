import {
    RASSINI_FAVICON
} from '../assets/rassini-assets';

export function loadFavicon(): void {

    let link =
        document.querySelector(
            "link[rel='icon']"
        ) as HTMLLinkElement;

    if (!link) {

        link = document.createElement('link');

        link.rel = 'icon';

        document.head.appendChild(link);

    }

    link.href = RASSINI_FAVICON;

}