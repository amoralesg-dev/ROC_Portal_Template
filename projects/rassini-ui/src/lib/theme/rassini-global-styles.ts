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

/* --- Shared Dialog & Form Utility Classes (Identical across Employee Portal & CxP) --- */
.flex {
    display: flex !important;
}

.flex-col {
    display: flex !important;
    flex-direction: column !important;
}

.items-center {
    align-items: center !important;
}

.justify-center {
    justify-content: center !important;
}

.justify-end {
    justify-content: flex-end !important;
}

.gap-1 { gap: 0.25rem !important; }
.gap-2 { gap: 0.5rem !important; }
.gap-3 { gap: 0.75rem !important; }
.gap-4 { gap: 1rem !important; }

.w-full {
    width: 100% !important;
    box-sizing: border-box !important;
}

.p-dialog .p-password {
    width: 100% !important;
    display: block !important;
}

.p-dialog .p-password input {
    width: 100% !important;
    box-sizing: border-box !important;
}

.p-dialog .p-inputtext {
    width: 100% !important;
    box-sizing: border-box !important;
}

.p-dialog form {
    width: 100% !important;
    box-sizing: border-box !important;
}

.p-dialog code {
    white-space: pre-wrap !important;
    word-break: break-all !important;
}

.relative { position: relative !important; }
.absolute { position: absolute !important; }
.inline-block { display: inline-block !important; }
.block { display: block !important; }

.text-center { text-align: center !important; }
.text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
.text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
.text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
.text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }

.font-semibold { font-weight: 600 !important; }
.font-bold { font-weight: 700 !important; }
.font-mono { font-family: monospace, monospace !important; }

.text-gray-500 { color: #6b7280 !important; }
.text-gray-600 { color: #4b5563 !important; }
.text-gray-700 { color: #374151 !important; }
.text-gray-800 { color: #1f2937 !important; }
.text-red-500 { color: #ef4444 !important; }
.text-red-700 { color: #b91c1c !important; }
.text-green-700 { color: #15803d !important; }
.text-purple-600 { color: #9333ea !important; }
.text-blue-800 { color: #1e40af !important; }

.bg-white { background-color: #ffffff !important; }
.bg-gray-100 { background-color: #f3f4f6 !important; }
.bg-green-100 { background-color: #dcfce7 !important; }
.bg-red-100 { background-color: #fee2e2 !important; }
.bg-blue-50 { background-color: #eff6ff !important; }

.border { border: 1px solid #e5e7eb !important; }
.border-b { border-bottom: 1px solid #e5e7eb !important; }
.border-gray-200 { border-color: #e5e7eb !important; }
.border-green-200 { border-color: #bbf7d0 !important; }
.border-red-200 { border-color: #fecaca !important; }
.border-blue-400 { border-color: #60a5fa !important; }
.border-l-4 { border-left-width: 4px !important; }

.rounded { border-radius: 0.375rem !important; }

.p-0 { padding: 0 !important; }
.p-2 { padding: 0.5rem !important; }
.p-3 { padding: 0.75rem !important; }
.m-0 { margin: 0 !important; }
.mt-1 { margin-top: 0.25rem !important; }
.mt-2 { margin-top: 0.5rem !important; }
.mt-4 { margin-top: 1rem !important; }
.mb-1 { margin-bottom: 0.25rem !important; }
.mb-2 { margin-bottom: 0.5rem !important; }
.mb-3 { margin-bottom: 0.75rem !important; }
.mr-1 { margin-right: 0.25rem !important; }
.mr-2 { margin-right: 0.5rem !important; }
.my-2 { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }

.list-none { list-style-type: none !important; }
.tracking-widest { letter-spacing: 0.1em !important; }
.break-all { word-break: break-all !important; }
.select-all { user-select: all !important; }
`;