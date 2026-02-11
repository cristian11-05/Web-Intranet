/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'aquanqa-dark': '#141C26',
                'aquanqa-blue': '#1C71A6',
                'aquanqa-green': '#6F8C30',
                'aquanqa-orange': '#BF612A',
                'aquanqa-bg': '#F2F2F2',
            }
        },
    },
    plugins: [],
}
