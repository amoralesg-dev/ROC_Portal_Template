import { Component } from '@angular/core';

@Component({
    selector: 'rui-footer',
    standalone: true,
    template: `
        <footer class="rui-footer">

            <span>
                © {{ year }} Rassini
            </span>

            <span>
                Plataforma Corporativa
            </span>

        </footer>
    `,
    styles: [`
        .rui-footer {

            height: 3rem;

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 0 1rem;

            border-top: 1px solid var(--surface-border);

            background: var(--surface-card);

            color: var(--text-color-secondary);

            font-size: .875rem;

        }
    `]
})
export class RassiniFooter {

    readonly year =
        new Date().getFullYear();

}