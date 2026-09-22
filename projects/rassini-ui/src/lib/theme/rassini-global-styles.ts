export const RASSINI_GLOBAL_STYLES = `

:root {

    --surface-ground: #f4f6f9;

    --surface-card: #ffffff;

    --surface-border: #e2e8f0;

    --text-color: #334155;

    --text-color-secondary: #64748b;

    --primary-color: #f26522;

    --card-shadow: 0 4px 20px rgba(0, 0, 0, .06);

}

html {

    height: 100%;

    font-size: 14px;

    line-height: 1.2;

}

body {

    font-family: 'Trebuchet MS', sans-serif;

    color: var(--text-color);

    background-color: var(--surface-ground);

    margin: 0;

    padding: 0;

    min-height: 100%;

    -webkit-font-smoothing: antialiased;

    -moz-osx-font-smoothing: grayscale;

}

a {

    text-decoration: none;

}

.layout-wrapper {

    min-height: 100vh;

}

.layout-main {

    flex: 1 1 auto;

    padding-bottom: 2rem;

}

`;