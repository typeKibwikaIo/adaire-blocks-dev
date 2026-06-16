export const iconOptions = [
    { label: 'None', value: 'none' },
    { label: 'Arrow Right', value: 'arrow-right' },
    { label: 'User', value: 'user' },
    { label: 'User Plus', value: 'user-plus' },
    { label: 'Login', value: 'login' },
    { label: 'Home', value: 'home' },
    { label: 'Info', value: 'info' },
    { label: 'Grid', value: 'grid' },
    { label: 'Mail', value: 'mail' },
    { label: 'Search', value: 'search' },
];

export default function HeaderIcon({ name }) {
    if (!name || name === 'none') {
        return null;
    }

    const common = { stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
    const paths = {
        'arrow-right': <><path {...common} d="M5 12h14" /><path {...common} d="m12 5 7 7-7 7" /></>,
        user: <><path {...common} d="M20 21a8 8 0 0 0-16 0" /><circle {...common} cx="12" cy="7" r="4" /></>,
        'user-plus': <><path {...common} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle {...common} cx="9" cy="7" r="4" /><path {...common} d="M19 8v6" /><path {...common} d="M22 11h-6" /></>,
        login: <><path {...common} d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path {...common} d="m10 17 5-5-5-5" /><path {...common} d="M15 12H3" /></>,
        home: <><path {...common} d="m3 11 9-8 9 8" /><path {...common} d="M5 10v10h14V10" /></>,
        info: <><circle {...common} cx="12" cy="12" r="10" /><path {...common} d="M12 16v-4" /><path {...common} d="M12 8h.01" /></>,
        grid: <><rect {...common} x="3" y="3" width="7" height="7" /><rect {...common} x="14" y="3" width="7" height="7" /><rect {...common} x="14" y="14" width="7" height="7" /><rect {...common} x="3" y="14" width="7" height="7" /></>,
        mail: <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="m3 7 9 6 9-6" /></>,
        search: <><circle {...common} cx="11" cy="11" r="8" /><path {...common} d="m21 21-4.3-4.3" /></>,
    };

    return <svg className="adaire-header-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">{paths[name] || paths['arrow-right']}</svg>;
}
