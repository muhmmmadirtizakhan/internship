// ========================================
// SCRIPT.JS — Complete Application Logic (UPDATED)
// ========================================

// --- React + ReactDOM from CDN ---
const { useState, useEffect, useRef, createContext, useContext } = React;

// ========================================
// 1. TOKENS & CONFIG
// ========================================

const OC = {
    orange: '#F97316',
    orangeHover: '#EA6C0A',
    orangeSubtle: '#FED7AA',
    orangeMuted: '#FFF7ED',
    charcoal: '#1C1C1E',
    success: '#22C55E',
    warning: '#F59E0B',
    urgent: '#EF4444',
    info: '#3B82F6',
    neutral: '#6B7280',
};

const THEMES = {
    light: {
        bg: { page: '#FFFFFF', card: '#F9FAFB', subtle: '#F3F4F6', overlay: '#FFFFFF' },
        text: { primary: '#111827', secondary: '#6B7280', disabled: '#9CA3AF', onAccent: '#FFFFFF' },
        border: { base: '#E5E7EB', strong: '#D1D5DB' },
        shadow: { sm: '0 1px 2px rgba(17,24,39,.06)', md: '0 4px 12px rgba(17,24,39,.08)', lg: '0 12px 28px rgba(17,24,39,.10)' },
    },
    dark: {
        bg: { page: '#1C1C1E', card: '#2C2C2E', subtle: '#3A3A3C', overlay: '#1C1C1E' },
        text: { primary: '#F9FAFB', secondary: '#A1A1AA', disabled: '#71717A', onAccent: '#FFFFFF' },
        border: { base: '#3F3F46', strong: '#52525B' },
        shadow: { sm: '0 1px 2px rgba(0,0,0,.5)', md: '0 4px 16px rgba(0,0,0,.4)', lg: '0 18px 40px rgba(0,0,0,.5)' },
    },
};

const CATEGORY = {
    jobs: { label: 'Jobs', color: '#3B82F6', soft: 'rgba(59,130,246,.14)', icon: 'briefcase' },
    internships: { label: 'Internships', color: '#8B5CF6', soft: 'rgba(139,92,246,.14)', icon: 'cap' },
    scholarships: { label: 'Scholarships', color: '#22C55E', soft: 'rgba(34,197,94,.14)', icon: 'award' },
    admissions: { label: 'Admissions', color: '#14B8A6', soft: 'rgba(20,184,166,.14)', icon: 'building' },
    events: { label: 'Events', color: '#F97316', soft: 'rgba(249,115,22,.14)', icon: 'spark' },
};

const FONT = {
    display: '"Plus Jakarta Sans", system-ui, sans-serif',
    body: '"DM Sans", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
};

const CAT_KEYS = ['jobs', 'internships', 'scholarships', 'admissions', 'events'];

const JOB_CATEGORIES = ['Engineering', 'Marketing', 'Design', 'Finance', 'Sales', 'HR', 'Operations', 'Product', 'Data Science'];

const LOCATIONS = ['Karachi', 'Lahore', 'Islamabad', 'Dubai', 'Remote'];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'On-site'];

const STATUS_STEPS = ['applied', 'interview', 'offer'];

const STATUS_META = {
    applied: { label: 'Applied', color: '#3B82F6' },
    interview: { label: 'Interview', color: '#F59E0B' },
    offer: { label: 'Offer', color: '#22C55E' },
    rejected: { label: 'Closed', color: '#6B7280' },
};

const DEFAULT_SETTINGS = {
    emailDigest: true,
    deadlineAlerts: true,
    whatsapp: false,
    telegram: true,
    newMatches: true,
    communityReplies: false,
    quietHours: true,
    compactCards: false,
};

const DEFAULT_INTERESTS = ['jobs', 'scholarships'];

const OC_LS_KEY = 'oc-proto-state-v1';

function useTheme(theme) {
    return THEMES[theme] || THEMES.light;
}

function urgency(daysLeft) {
    if (daysLeft == null || daysLeft < 0) {
        return { color: '#71717A', label: 'Closed', icon: '', tier: 'expired' };
    }
    if (daysLeft === 0) {
        return { color: OC.urgent, label: 'Closes today', icon: '🔴', tier: 'critical' };
    }
    if (daysLeft <= 3) {
        return { color: OC.urgent, label: `${daysLeft} days left — apply today`, icon: '🔴', tier: 'critical' };
    }
    if (daysLeft <= 7) {
        return { color: OC.orange, label: `${daysLeft} days left`, icon: '⚡', tier: 'urgent' };
    }
    if (daysLeft <= 14) {
        return { color: OC.warning, label: `${daysLeft} days left`, icon: '', tier: 'warning' };
    }
    return { color: 'secondary', label: `${daysLeft} days left`, icon: '', tier: 'normal' };
}

function iconBtn(t) {
    return {
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'transparent',
        color: t.text.secondary,
        border: `1px solid ${t.border.base}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    };
}

function ocLoad() {
    try {
        const data = localStorage.getItem(OC_LS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function matchQuery(op, q) {
    if (!q) return true;
    const hay = `${op.title} ${op.org} ${op.location} ${op.category} ${op.summary || ''}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
}

// ========================================
// 2. DATA
// ========================================

const OPPORTUNITIES = [
    {
        id: 'OC-JOB-2026-00421',
        category: 'jobs',
        title: 'Senior Frontend Engineer — Design Systems',
        org: 'Linear',
        location: 'Remote · EU/US',
        salary: '$140k–$190k',
        daysLeft: 12,
        posted: '2 days ago',
        source: 'Greenhouse',
        type: 'Full-time',
        level: 'Senior',
        skills: ['React', 'TypeScript', 'Figma', 'Design tokens'],
        summary: 'Help build Linear\'s next-generation design system.',
    },
    {
        id: 'OC-JOB-2026-00420',
        category: 'jobs',
        title: 'Staff Product Designer · AI Surfaces',
        org: 'Notion',
        location: 'NYC · Hybrid',
        salary: '$180k–$240k',
        daysLeft: 18,
        posted: '4 days ago',
        source: 'Greenhouse',
        type: 'Full-time',
        level: 'Staff',
        summary: 'Lead design across Notion AI surfaces.',
    },
];

// ========================================
// 3. STORE CONTEXT
// ========================================

const StoreContext = createContext(null);

function useStore() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}

function StoreProvider({ children }) {
    const saved0 = ocLoad();
    const [theme, setThemeState] = useState(saved0.theme || 'light');
    const [route, setRoute] = useState(saved0.route || { name: 'home' });
    const [saved, setSaved] = useState(saved0.saved || []);
    const [applied, setApplied] = useState(saved0.applied || []);
    const [interests, setInterests] = useState(saved0.interests || DEFAULT_INTERESTS);
    const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...(saved0.settings || {}) });
    const [authed, setAuthed] = useState(saved0.authed || false);
    const [user, setUser] = useState(saved0.user || { name: 'Aisha Khan', email: 'aisha@example.com' });
    const [query, setQuery] = useState('');
    const [toast, setToast] = useState(null);
    const [apply, setApply] = useState(null);
    const [isEmployerMode, setEmployerMode] = useState(saved0.isEmployerMode || false);
    const [employerJobs, setEmployerJobs] = useState(saved0.employerJobs || []);
    
    const addEmployerJob = (job) => {
        setEmployerJobs(j => [{ ...job, id: `POST-${Date.now()}`, status: 'pending', postedAt: 'Just now' }, ...j]);
    };
    const updateEmployerJob = (id, patch) => {
        setEmployerJobs(j => j.map(job => job.id === id ? { ...job, ...patch } : job));
    };
    const removeEmployerJob = (id) => {
        setEmployerJobs(j => j.filter(job => job.id !== id));
    };
    
    useEffect(() => {
        localStorage.setItem(OC_LS_KEY, JSON.stringify({
            theme, route, saved, applied, interests, settings, authed, user, employerJobs, isEmployerMode,
        }));
    }, [theme, route, saved, applied, interests, settings, authed, user, employerJobs, isEmployerMode]);

    const toastTimer = useRef(null);
    const showToast = (message, icon) => {
        setToast({ message, icon, key: Date.now() });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
    };

    const go = (name, params = {}) => {
        setRoute({ name, ...params });
        window.scrollTo({ top: 0, behavior: 'auto' });
        if (name === 'companyProfile') {
        window.history.pushState({}, '', '/company-profile');
    }
    if (name === 'about') {
    window.history.pushState({}, '', '/about');
}
        if (name === 'home') {
            window.history.pushState({}, '', '/');
        } else if (name === 'feed') {
            window.history.pushState({}, '', '/feed');
        } else if (name === 'search') {
            window.history.pushState({}, '', '/search');
        } else if (name === 'saved') {
            window.history.pushState({}, '', '/saved');
        } else if (name === 'applications') {
            window.history.pushState({}, '', '/applications');
        } else if (name === 'login') {
            window.history.pushState({}, '', '/auth?mode=login');
        } else if (name === 'signup') {
            window.history.pushState({}, '', '/auth?mode=signup');
        } else if (name === 'account') {
            window.history.pushState({}, '', '/account');
        } else if (name === 'employers') {
            window.history.pushState({}, '', '/employers');
        } else if (name === 'postJob') {
            window.history.pushState({}, '', '/post-job');
        } else if (name === 'detail') {
            window.history.pushState({}, '', `/opportunity/${params.id || ''}`);
        }
    };

    const setTheme = (v) => setThemeState(v);
    const toggleTheme = () => setThemeState(t => (t === 'light' ? 'dark' : 'light'));

    const isSaved = (id) => saved.includes(id);
    const toggleSave = (id) => {
        setSaved(s => {
            const has = s.includes(id);
            showToast(has ? 'Removed from saved' : 'Saved to your list', has ? 'bookmark' : 'bookmarkFilled');
            return has ? s.filter(x => x !== id) : [id, ...s];
        });
    };

    const hasApplied = (id) => applied.some(a => a.id === id);
    const markApplied = (id) => {
        setApplied(a => a.some(x => x.id === id) ? a : [{ id, status: 'applied', date: 'Just now' }, ...a]);
    };
    const setApplyStatus = (id, status) => {
        setApplied(a => a.map(x => x.id === id ? { ...x, status } : x));
    };

    const toggleSetting = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
    const toggleInterest = (key) => setInterests(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]);

    const startApply = (id) => setApply({ id, step: 'leaving' });
    const advanceApply = () => setApply(a => a ? { ...a, step: 'open' } : null);
    const closeApply = () => setApply(null);
    const confirmApplied = () => {
        if (apply) { markApplied(apply.id); showToast('Added to your tracker', 'check'); }
        setApply(null);
    };

    const value = {
        theme, setTheme, toggleTheme,
        route, go,
        saved, isSaved, toggleSave,
        applied, hasApplied, markApplied, setApplyStatus,
        interests, toggleInterest,
        settings, toggleSetting, setSettings,
        authed, setAuthed, user, setUser,
        query, setQuery,
        toast, showToast,
        apply, startApply, advanceApply, closeApply, confirmApplied,
        employerJobs, addEmployerJob, updateEmployerJob, removeEmployerJob,
        isEmployerMode, setEmployerMode,
    };

    return React.createElement(StoreContext.Provider, { value }, children);
}

// ========================================
// 4. COMPONENTS
// ========================================

// --- Logo ---
function Logo({ size = 220, variant = 'fullLight', withWordmark = true, withTagline = true }) {
    const isDark = variant === 'fullDark' || variant === 'monoDark';
    const monoOrange = variant === 'orange';
    const monoOnly = variant === 'monoLight' || variant === 'monoDark' || variant === 'orange';
    const oFill = monoOrange ? OC.orange : (variant === 'monoDark' ? '#fff' : (variant === 'monoLight' ? OC.charcoal : OC.orange));
    const cFill = monoOrange ? OC.orange : (isDark ? '#FFFFFF' : OC.charcoal);
    const wordmarkInk = monoOrange ? OC.orange : (isDark ? '#FFFFFF' : OC.charcoal);
    const wordmarkAccent = monoOnly ? wordmarkInk : OC.orange;
    const markH = size * (withWordmark ? 0.46 : 1);
    const markW = markH * (120 / 80);
    const gradId = `oc-grad-${variant}-${size}`;

    return React.createElement('div', {
        style: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: withWordmark ? size * 0.04 : 0, fontFamily: FONT.display, lineHeight: 1 }
    },
        React.createElement('svg', {
            width: markW, height: markH, viewBox: '0 0 120 80', style: { display: 'block' }, 'aria-label': 'Opportunity Circle'
        },
            React.createElement('defs', null,
                React.createElement('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '1', y2: '1' },
                    React.createElement('stop', { offset: '0%', stopColor: monoOnly ? oFill : '#FFB463' }),
                    React.createElement('stop', { offset: '55%', stopColor: monoOnly ? oFill : '#F97316' }),
                    React.createElement('stop', { offset: '100%', stopColor: monoOnly ? oFill : '#D9580B' })
                )
            ),
            React.createElement('path', {
                d: 'M 90 18 A 22 22 0 1 0 90 62',
                fill: 'none', stroke: cFill, strokeWidth: '12', strokeLinecap: 'round'
            }),
            React.createElement('circle', {
                cx: '48', cy: '40', r: '22',
                fill: 'none', stroke: `url(#${gradId})`, strokeWidth: '12'
            })
        ),
        withWordmark ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.018 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: size * 0.03, fontWeight: 800, letterSpacing: '-0.01em', fontSize: size * 0.115 } },
                React.createElement('span', { style: { color: wordmarkInk } }, 'OPPORTUNITY'),
                React.createElement('span', { style: { color: wordmarkAccent } }, 'CIRCLE')
            ),
            withTagline ? React.createElement('div', { style: { color: wordmarkInk, opacity: 0.7, fontFamily: FONT.body, fontWeight: 500, fontSize: size * 0.044, letterSpacing: '0.32em', textTransform: 'uppercase' } }, '— Sharing is Caring —') : null
        ) : null
    );
}

// --- LogoNav ---
function LogoNav({ theme = 'light', height = 28 }) {
    const isDark = theme === 'dark';
    const ink = isDark ? '#FFFFFF' : OC.charcoal;
    const orange = OC.orange;
    const markW = height * 1.5;
    const gradId = `oc-nav-grad-${theme}-${height}`;

    return React.createElement('div', {
        style: { display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: FONT.display, lineHeight: 1 }
    },
        React.createElement('svg', {
            width: markW, height: height, viewBox: '0 0 120 80', style: { display: 'block', flex: '0 0 auto' }
        },
            React.createElement('defs', null,
                React.createElement('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '1', y2: '1' },
                    React.createElement('stop', { offset: '0%', stopColor: '#FFB463' }),
                    React.createElement('stop', { offset: '55%', stopColor: '#F97316' }),
                    React.createElement('stop', { offset: '100%', stopColor: '#D9580B' })
                )
            ),
            React.createElement('path', {
                d: 'M 90 18 A 22 22 0 1 0 90 62',
                fill: 'none', stroke: ink, strokeWidth: '12', strokeLinecap: 'round'
            }),
            React.createElement('circle', {
                cx: '48', cy: '40', r: '22',
                fill: 'none', stroke: `url(#${gradId})`, strokeWidth: '12'
            })
        ),
        React.createElement('span', { style: { fontWeight: 800, fontSize: height * 0.7, letterSpacing: '-0.01em', display: 'flex', gap: 4 } },
            React.createElement('span', { style: { color: ink } }, 'Opportunity'),
            React.createElement('span', { style: { color: orange } }, 'Circle')
        )
    );
}

// --- Button ---
function Button({ kind = 'primary', children, icon, iconRight, theme = 'light', size = 'md', fullWidth = false, onClick, style = {} }) {
    const t = useTheme(theme);
    const heights = { sm: 32, md: 40, lg: 48 };
    const fontSizes = { sm: 13, md: 15, lg: 16 };
    const padX = { sm: 12, md: 18, lg: 24 };
    const h = heights[size];

    const styles = {
        primary: { background: OC.orange, color: '#fff', border: 'none', boxShadow: t.shadow.sm },
        secondary: { background: theme === 'dark' ? t.bg.subtle : '#fff', color: t.text.primary, border: `1px solid ${t.border.base}` },
        ghost: { background: 'transparent', color: t.text.primary, border: 'none' },
        destructive: { background: OC.urgent, color: '#fff', border: 'none' },
        accentSubtle: {
            background: theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted,
            color: OC.orange,
            border: theme === 'dark' ? '1px solid rgba(249,115,22,.22)' : `1px solid ${OC.orangeSubtle}`,
        },
    };

    return React.createElement('button', {
        onClick, style: { ...styles[kind], height: h, padding: `0 ${padX[size]}px`, fontFamily: FONT.body, fontWeight: 600, fontSize: fontSizes[size], borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', width: fullWidth ? '100%' : undefined, letterSpacing: '-0.005em', ...style }
    }, icon, children, iconRight);
}

// --- Badge ---
function Badge({ children, color, soft = true, theme = 'light', icon, style = {} }) {
    const t = useTheme(theme);
    const c = color || OC.orange;
    return React.createElement('span', {
        style: {
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999,
            background: soft ? (theme === 'dark' ? `${c}26` : `${c}1F`) : c,
            color: soft ? c : '#fff', fontFamily: FONT.body, fontWeight: 600, fontSize: 11.5,
            lineHeight: 1, letterSpacing: '0.01em', whiteSpace: 'nowrap', ...style
        }
    }, icon ? React.createElement('span', { style: { display: 'inline-flex' } }, icon) : null, children);
}

// --- Icon ---
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.7 }) {
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };

    const paths = {
        briefcase: React.createElement('g', null,
            React.createElement('rect', { x: '3', y: '7', width: '18', height: '13', rx: '2' }),
            React.createElement('path', { d: 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
            React.createElement('path', { d: 'M3 13h18' })
        ),
        cap: React.createElement('g', null,
            React.createElement('path', { d: 'M22 10 12 5 2 10l10 5 10-5Z' }),
            React.createElement('path', { d: 'M6 12v5c3 2 9 2 12 0v-5' })
        ),
        award: React.createElement('g', null,
            React.createElement('circle', { cx: '12', cy: '9', r: '6' }),
            React.createElement('path', { d: 'm8.21 13.89-1.7 7.11 5.49-3.4 5.49 3.4-1.7-7.11' })
        ),
        building: React.createElement('g', null,
            React.createElement('rect', { x: '4', y: '3', width: '16', height: '18', rx: '1.5' }),
            React.createElement('path', { d: 'M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01' })
        ),
        spark: React.createElement('g', null,
            React.createElement('rect', { x: '3', y: '5', width: '18', height: '16', rx: '2' }),
            React.createElement('path', { d: 'M8 3v4M16 3v4M3 11h18' }),
            React.createElement('path', { d: 'M12 14l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 16.3 11 16Z' })
        ),
        search: React.createElement('g', null,
            React.createElement('circle', { cx: '11', cy: '11', r: '7' }),
            React.createElement('path', { d: 'm20 20-3.5-3.5' })
        ),
        bookmark: React.createElement('path', { d: 'M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4Z' }),
        bookmarkFilled: React.createElement('path', { d: 'M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4Z', fill: color, stroke: 'none' }),
        share: React.createElement('g', null,
            React.createElement('circle', { cx: '18', cy: '5', r: '3' }),
            React.createElement('circle', { cx: '6', cy: '12', r: '3' }),
            React.createElement('circle', { cx: '18', cy: '19', r: '3' }),
            React.createElement('path', { d: 'm8.6 13.5 6.8 4M15.4 6.5l-6.8 4' })
        ),
        arrowRight: React.createElement('g', null,
            React.createElement('path', { d: 'M5 12h14M13 5l7 7-7 7' })
        ),
        arrowUpRight: React.createElement('g', null,
            React.createElement('path', { d: 'M7 17 17 7M8 7h9v9' })
        ),
        check: React.createElement('path', { d: 'm4 12 5 5L20 6' }),
        x: React.createElement('g', null,
            React.createElement('path', { d: 'M6 6l12 12M18 6 6 18' })
        ),
        sun: React.createElement('g', null,
            React.createElement('circle', { cx: '12', cy: '12', r: '4' }),
            React.createElement('path', { d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' })
        ),
        moon: React.createElement('path', { d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' }),
        bell: React.createElement('g', null,
            React.createElement('path', { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' }),
            React.createElement('path', { d: 'M13.7 21a2 2 0 0 1-3.4 0' })
        ),
        mapPin: React.createElement('g', null,
            React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
            React.createElement('circle', { cx: '12', cy: '10', r: '3' })
        ),
        clock: React.createElement('g', null,
            React.createElement('circle', { cx: '12', cy: '12', r: '9' }),
            React.createElement('path', { d: 'M12 7v5l3 2' })
        ),
        filter: React.createElement('g', null,
            React.createElement('path', { d: 'M3 5h18M6 12h12M10 19h4' })
        ),
        globe: React.createElement('g', null,
            React.createElement('circle', { cx: '12', cy: '12', r: '9' }),
            React.createElement('path', { d: 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18' })
        ),
        sparkle: React.createElement('g', null,
            React.createElement('path', { d: 'M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2' })
        ),
        plus: React.createElement('g', null,
            React.createElement('path', { d: 'M12 5v14M5 12h14' })
        ),
        menu: React.createElement('g', null,
            React.createElement('path', { d: 'M4 6h16M4 12h16M4 18h16' })
        ),
        chevDown: React.createElement('path', { d: 'm6 9 6 6 6-6' }),
        chevRight: React.createElement('path', { d: 'm9 6 6 6-6 6' }),
        heart: React.createElement('path', { d: 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z' }),
        send: React.createElement('path', { d: 'm22 2-7 20-4-9-9-4 20-7Z' }),
        mail: React.createElement('g', null,
            React.createElement('rect', { x: '3', y: '5', width: '18', height: '14', rx: '2' }),
            React.createElement('path', { d: 'm3 7 9 6 9-6' })
        ),
        home: React.createElement('path', { d: 'M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z' }),
        grid: React.createElement('g', null,
            React.createElement('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
            React.createElement('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
            React.createElement('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
            React.createElement('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' })
        ),
        list: React.createElement('g', null,
            React.createElement('path', { d: 'M8 6h13M8 12h13M8 18h13' }),
            React.createElement('path', { d: 'M3.5 6h.01M3.5 12h.01M3.5 18h.01' })
        ),
        user: React.createElement('g', null,
            React.createElement('circle', { cx: '12', cy: '8', r: '4' }),
            React.createElement('path', { d: 'M4 21a8 8 0 0 1 16 0' })
        ),
        lock: React.createElement('g', null,
            React.createElement('rect', { x: '4', y: '11', width: '16', height: '10', rx: '2' }),
            React.createElement('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' })
        ),
        eye: React.createElement('g', null,
            React.createElement('path', { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z' }),
            React.createElement('circle', { cx: '12', cy: '12', r: '3' })
        ),
        eyeOff: React.createElement('g', null,
            React.createElement('path', { d: 'M10.6 6.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3 3.7M6.6 6.6A18 18 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2' }),
            React.createElement('path', { d: 'm3 3 18 18' })
        ),
        phone: React.createElement('path', { d: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l2 4v3a1 1 0 0 1-1 1A17 17 0 0 1 4 5a1 1 0 0 1 1-1Z' }),
        arrowLeft: React.createElement('g', null,
            React.createElement('path', { d: 'M19 12H5M11 5l-7 7 7 7' })
        ),
        atSign: React.createElement('g', null,
            React.createElement('circle', { cx: '12', cy: '12', r: '4' }),
            React.createElement('path', { d: 'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8' })
        ),
        shieldCheck: React.createElement('g', null,
            React.createElement('path', { d: 'M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6Z' }),
            React.createElement('path', { d: 'm9 12 2 2 4-4' })
        ),
        chart: React.createElement('g', null,
            React.createElement('path', { d: 'M3 3v18h18' }),
            React.createElement('rect', { x: '7', y: '12', width: '3', height: '6', rx: '0.5' }),
            React.createElement('rect', { x: '12', y: '8', width: '3', height: '10', rx: '0.5' }),
            React.createElement('rect', { x: '17', y: '4', width: '3', height: '14', rx: '0.5' })
        ),
        flag: React.createElement('g', null,
            React.createElement('path', { d: 'M4 22V4M4 4h12l-2 4 2 4H4' })
        ),
        shield: React.createElement('path', { d: 'M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6Z' }),
    };

    const content = paths[name] || React.createElement('circle', { cx: '12', cy: '12', r: '9' });
    return React.createElement('svg', common, content);
}

// --- Avatar ---
function Avatar({ name = '', tone, size = 36, theme = 'light' }) {
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase() || 'OC';
    const tints = ['#3B82F6', '#8B5CF6', '#22C55E', '#14B8A6', '#F97316', '#EAB308', '#EF4444', '#0EA5E9'];
    const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const bg = tone || tints[h % tints.length];
    return React.createElement('div', {
        style: {
            width: size, height: size, borderRadius: size * 0.28,
            background: `${bg}22`, color: bg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT.display, fontWeight: 700, fontSize: size * 0.36,
            flex: '0 0 auto', letterSpacing: '-0.02em',
        }
    }, initials);
}

// --- CategoryIcon ---
function CategoryIcon({ category = 'jobs', size = 38, theme = 'light' }) {
    const cat = CATEGORY[category] || CATEGORY.jobs;
    return React.createElement('div', {
        style: {
            width: size, height: size, borderRadius: 12,
            background: theme === 'dark' ? `${cat.color}26` : `${cat.color}14`,
            color: cat.color,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flex: '0 0 auto',
        }
    }, React.createElement(Icon, { name: cat.icon, size: size * 0.5 }));
}

// --- Card ---          
function Card({ children, theme = 'light', padding = 20, hover = false, style = {} }) {
    const t = useTheme(theme);
    return React.createElement('div', {
        style: {
            background: t.bg.card,
            border: `1px solid ${t.border.base}`,
            borderRadius: 14,
            padding,
            ...style
        }
    }, children);
}

// --- MonoTag ---
function MonoTag({ children, theme = 'light', style = {} }) {
    const t = useTheme(theme);
    return React.createElement('span', {
        style: {
            fontFamily: FONT.mono, fontWeight: 500,
            fontSize: 11, color: t.text.secondary,
            padding: '3px 7px', borderRadius: 5,
            background: t.bg.subtle,
            border: `1px solid ${t.border.base}`,
            whiteSpace: 'nowrap',
            ...style
        }
    }, children);
}

// --- Deadline ---
function Deadline({ days, theme = 'light', size = 'sm' }) {
    const t = useTheme(theme);
    const u = urgency(days);
    const isExpired = u.tier === 'expired';
    const color = u.color === 'secondary' ? t.text.secondary : u.color;
    return React.createElement('span', {
        style: {
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: FONT.body, fontWeight: 600,
            fontSize: size === 'sm' ? 12 : 13, color,
            textDecoration: isExpired ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
        }
    }, u.icon ? React.createElement('span', { 'aria-hidden': true, style: { fontSize: 10 } }, u.icon) : null, u.label);
}

// --- MetaChip ---
function MetaChip({ icon, children, theme }) {
    const t = useTheme(theme);
    return React.createElement('span', {
        style: {
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 8px', borderRadius: 7,
            background: t.bg.subtle, color: t.text.secondary,
            fontSize: 12, fontWeight: 500,
        }
    }, React.createElement(Icon, { name: icon, size: 12 }), children);
}

// --- Toggle ---
function Toggle({ on, onChange, theme = 'light' }) {
    const t = useTheme(theme);
    return React.createElement('button', {
        onClick: onChange, role: 'switch', 'aria-checked': on,
        style: {
            width: 46, height: 27, borderRadius: 999, padding: 3,
            border: 'none', cursor: 'pointer',
            background: on ? OC.orange : (theme === 'dark' ? t.bg.subtle : '#D1D5DB'),
            display: 'inline-flex', alignItems: 'center',
            justifyContent: on ? 'flex-end' : 'flex-start',
            transition: 'background .18s ease', flex: '0 0 auto',
        }
    }, React.createElement('span', {
        style: {
            width: 21, height: 21, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,.25)',
            transition: 'all .18s ease',
        }
    }));
}

// --- Input ---
function Input({ label, value, onChange, placeholder, type = 'text', theme = 'light', icon, hint, rightSlot, as = 'input', rows = 4 }) {
    const t = useTheme(theme);
    const [focus, setFocus] = useState(false);
    const Tag = as;
    return React.createElement('label', { style: { display: 'block', fontFamily: FONT.body } },
        label ? React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, label) : null,
        React.createElement('div', {
            style: {
                display: 'flex', alignItems: as === 'textarea' ? 'flex-start' : 'center',
                gap: 9, background: t.bg.page,
                border: `1.5px solid ${focus ? OC.orange : t.border.base}`,
                borderRadius: 10, padding: as === 'textarea' ? '12px 13px' : '0 13px',
                height: as === 'textarea' ? 'auto' : 44,
                transition: 'border-color .15s ease',
            }
        },
            icon ? React.createElement('span', { style: { color: focus ? OC.orange : t.text.secondary, flex: '0 0 auto', marginTop: as === 'textarea' ? 2 : 0 } },
                React.createElement(Icon, { name: icon, size: 17 })
            ) : null,
            React.createElement(Tag, {
                type, value, rows: as === 'textarea' ? rows : undefined,
                onChange: (e) => onChange(e.target.value),
                onFocus: () => setFocus(true),
                onBlur: () => setFocus(false),
                placeholder,
                style: {
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary,
                    width: '100%', resize: as === 'textarea' ? 'vertical' : undefined,
                    lineHeight: as === 'textarea' ? 1.55 : 'normal', padding: 0,
                }
            }),
            rightSlot || null
        ),
        hint ? React.createElement('div', { style: { fontSize: 12, color: t.text.secondary, marginTop: 6 } }, hint) : null
    );
}

// --- Toast ---
function Toast() {
    const s = useStore();
    const t = useTheme(s.theme);
    if (!s.toast) return null;
    return React.createElement('div', {
        key: s.toast.key,
        style: {
            position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            background: s.theme === 'dark' ? '#fff' : OC.charcoal,
            color: s.theme === 'dark' ? OC.charcoal : '#fff',
            padding: '12px 18px', borderRadius: 12, fontFamily: FONT.body,
            fontSize: 14, fontWeight: 600, display: 'inline-flex',
            alignItems: 'center', gap: 9, zIndex: 80,
            boxShadow: '0 12px 30px rgba(0,0,0,.28)',
            animation: 'ocToastIn .25s ease',
        }
    }, s.toast.icon ? React.createElement('span', { style: { color: OC.orange } },
        React.createElement(Icon, { name: s.toast.icon, size: 16 })
    ) : null, s.toast.message);
}

// --- ApplyModal ---
function ApplyModal() {
    const s = useStore();
    const t = useTheme(s.theme);
    if (!s.apply) return null;
    const op = OPPORTUNITIES.find(o => o.id === s.apply.id) || OPPORTUNITIES[0];

    return React.createElement('div', {
        onClick: s.closeApply,
        style: {
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, animation: 'ocFade .18s ease',
        }
    },
        React.createElement('div', {
            onClick: e => e.stopPropagation(),
            style: {
                width: 440, maxWidth: '100%',
                background: t.bg.overlay,
                border: `1px solid ${t.border.base}`,
                borderRadius: 20, padding: 30,
                fontFamily: FONT.body,
                boxShadow: t.shadow.lg,
            }
        },
            React.createElement('div', { style: { width: 52, height: 52, borderRadius: 14, background: OC.orangeMuted, color: OC.orange, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 } },
                React.createElement(Icon, { name: 'arrowUpRight', size: 24 })
            ),
            React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 21, color: t.text.primary, margin: '0 0 8px', letterSpacing: '-0.01em' } },
                `You're heading to ${op.source}`
            ),
            React.createElement('p', { style: { fontSize: 14.5, color: t.text.secondary, margin: '0 0 8px', lineHeight: 1.55 } },
                `We'll open the official application in a new tab. This is a verified link for `,
                React.createElement('strong', { style: { color: t.text.primary } }, op.title), '.'
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, background: t.bg.subtle, borderRadius: 9, padding: '9px 12px', margin: '14px 0 22px', fontSize: 12.5, color: t.text.secondary } },
                React.createElement(Icon, { name: 'shieldCheck', size: 15, color: OC.success }),
                ' Reviewed by an Opportunity Circle volunteer'
            ),
            React.createElement(Button, { kind: 'primary', size: 'lg', theme: s.theme, fullWidth: true, onClick: s.closeApply, iconRight: React.createElement(Icon, { name: 'arrowUpRight', size: 16 }) }, 'Open application'),
            React.createElement(Button, { kind: 'ghost', size: 'md', theme: s.theme, fullWidth: true, onClick: s.closeApply, style: { marginTop: 6 } }, 'Cancel')
        )
    );
}

// --- ChangePasswordModal ---
function ChangePasswordModal({ onClose }) {
    const s = useStore();
    const t = useTheme(s.theme);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showCur, setShowCur] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [error, setError] = useState('');

    const valid = current.length >= 6 && next.length >= 6 && next === confirm && next !== current;

    const submit = () => {
        if (next !== confirm) { setError('New passwords do not match'); return; }
        if (next.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (next === current) { setError('New password must be different from current'); return; }
        setError('');
        s.showToast('Password updated', 'check');
        onClose();
    };

    return React.createElement('div', {
        onClick: onClose,
        style: { position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
    },
        React.createElement('div', {
            onClick: e => e.stopPropagation(),
            style: { width: 440, maxWidth: '100%', background: t.bg.overlay, border: `1px solid ${t.border.base}`, borderRadius: 20, padding: 30, fontFamily: FONT.body, boxShadow: t.shadow.lg }
        },
            React.createElement('div', { style: { width: 52, height: 52, borderRadius: 14, background: OC.orangeMuted, color: OC.orange, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 } },
                React.createElement(Icon, { name: 'lock', size: 22 })
            ),
            React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 21, color: t.text.primary, margin: '0 0 8px' } }, 'Change password'),
            React.createElement('p', { style: { fontSize: 14, color: t.text.secondary, margin: '0 0 20px' } }, "Choose a strong password you haven't used before."),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
                React.createElement(Input, {
                    theme: s.theme, label: 'Current password', value: current, onChange: setCurrent,
                    type: showCur ? 'text' : 'password', icon: 'lock',
                    rightSlot: React.createElement('button', { onClick: () => setShowCur(v => !v), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary } }, React.createElement(Icon, { name: showCur ? 'eyeOff' : 'eye', size: 16 }))
                }),
                React.createElement(Input, {
                    theme: s.theme, label: 'New password', value: next, onChange: setNext,
                    type: showNext ? 'text' : 'password', icon: 'lock', hint: 'At least 6 characters',
                    rightSlot: React.createElement('button', { onClick: () => setShowNext(v => !v), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary } }, React.createElement(Icon, { name: showNext ? 'eyeOff' : 'eye', size: 16 }))
                }),
                React.createElement(Input, { theme: s.theme, label: 'Confirm new password', value: confirm, onChange: setConfirm, type: 'password', icon: 'lock' }),
                error ? React.createElement('div', { style: { fontSize: 13, color: OC.urgent, fontWeight: 600 } }, error) : null
            ),
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 22 } },
                React.createElement(Button, { kind: 'ghost', size: 'md', theme: s.theme, onClick: onClose, style: { flex: 1 } }, 'Cancel'),
                React.createElement(Button, { kind: 'primary', size: 'md', theme: s.theme, onClick: submit, style: { flex: 1, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed', pointerEvents: valid ? 'auto' : 'none' } }, 'Update password')
            )
        )
    );
}

// --- SwitchAccountTypeModal ---
function SwitchAccountTypeModal({ onClose }) {
    const s = useStore();
    const t = useTheme(s.theme);

    const confirmSwitch = () => {
        s.setEmployerMode(true);
        s.showToast('Switched to Hiring Employer', 'briefcase');
        onClose();
        s.go('employers');
    };  
    return React.createElement('div', {
        onClick: onClose,
        style: { position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
    },
        React.createElement('div', {
            onClick: e => e.stopPropagation(),
            style: { width: 420, maxWidth: '100%', background: t.bg.overlay, border: `1px solid ${t.border.base}`, borderRadius: 20, padding: 30, fontFamily: FONT.body, boxShadow: t.shadow.lg }
        },
            React.createElement('div', { style: { width: 52, height: 52, borderRadius: 14, background: OC.orangeMuted, color: OC.orange, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 } },
                React.createElement(Icon, { name: 'briefcase', size: 22 })
            ),
            React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 20, color: t.text.primary, margin: '0 0 8px' } }, 'Switch to Hiring Employer?'),
            React.createElement('p', { style: { fontSize: 14, color: t.text.secondary, margin: '0 0 22px', lineHeight: 1.55 } },
                "You'll get access to post roles and manage applicants. Your saved opportunities and applications stay on this account — switch back anytime from Settings."
            ),
            React.createElement('div', { style: { display: 'flex', gap: 10 } },
                React.createElement(Button, { kind: 'ghost', size: 'md', theme: s.theme, onClick: onClose, style: { flex: 1 } }, 'Cancel'),
                React.createElement(Button, { kind: 'primary', size: 'md', theme: s.theme, onClick: confirmSwitch, style: { flex: 1 } }, 'Confirm switch')
            )
        )
    );
}

// --- DeleteAccountModal ---
function DeleteAccountModal({ onClose }) {
    const s = useStore();
    const t = useTheme(s.theme);
    const [confirmText, setConfirmText] = useState('');
    const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

    const deleteAccount = () => {
        s.showToast('Account deleted', 'x');
        onClose();
        s.setAuthed(false);
        s.go('home');
    };

    return React.createElement('div', {
        onClick: onClose,
        style: { position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
    },
        React.createElement('div', {
            onClick: e => e.stopPropagation(),
            style: { width: 440, maxWidth: '100%', background: t.bg.overlay, border: `1px solid ${OC.urgent}55`, borderRadius: 20, padding: 30, fontFamily: FONT.body, boxShadow: t.shadow.lg }
        },
            React.createElement('div', { style: { width: 52, height: 52, borderRadius: 14, background: `${OC.urgent}1F`, color: OC.urgent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 } },
                React.createElement(Icon, { name: 'x', size: 22 })
            ),
            React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 20, color: t.text.primary, margin: '0 0 8px' } }, 'Delete your account'),
            React.createElement('p', { style: { fontSize: 14, color: t.text.secondary, margin: '0 0 16px', lineHeight: 1.55 } },
                'This permanently deletes your profile, saved opportunities, and application history. This action cannot be undone.'
            ),
            React.createElement('div', { style: { fontSize: 13, color: t.text.primary, fontWeight: 600, marginBottom: 8 } }, 'Type DELETE to confirm'),
            React.createElement(Input, { theme: s.theme, value: confirmText, onChange: setConfirmText, placeholder: 'DELETE' }),
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 20 } },
                React.createElement(Button, { kind: 'ghost', size: 'md', theme: s.theme, onClick: onClose, style: { flex: 1 } }, 'Cancel'),
                React.createElement(Button, {
                    kind: 'destructive', size: 'md', onClick: deleteAccount,
                    style: { flex: 1, opacity: canDelete ? 1 : 0.5, cursor: canDelete ? 'pointer' : 'not-allowed', pointerEvents: canDelete ? 'auto' : 'none' }
                }, 'Delete my account')
            )
        )
    );
}

// --- AccountSettingsSection ---
function AccountSettingsSection() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [name, setName] = useState(s.user.name);
    const [showPwModal, setShowPwModal] = useState(false);
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const nameChanged = name.trim() !== s.user.name && name.trim().length > 1;

    const saveName = () => {
        s.setUser(u => ({ ...u, name: name.trim() }));
        s.showToast('Display name updated', 'check');
    };

    return React.createElement('div', { style: { width: '100%', padding: '0 40px' } },
        React.createElement('div', { style: { padding: '40px 0 80px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: t.text.secondary, marginBottom: 12 } },
                React.createElement('button', { onClick: () => s.go('home'), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, fontSize: 12.5, padding: 0 } }, 'Home'),
                React.createElement(Icon, { name: 'chevRight', size: 12 }),
                React.createElement('span', { style: { color: t.text.primary, fontWeight: 600 } }, 'Settings')
            ),
            React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 32, margin: '0 0 24px', color: t.text.primary, letterSpacing: '-0.02em' } }, 'Account settings'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 18, width: '100%' } },
                React.createElement(Card, { theme: s.theme, padding: 22 },
                    React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary, marginBottom: 4 } }, 'Display name'),
                    React.createElement('div', { style: { fontSize: 13, color: t.text.secondary, marginBottom: 14 } }, 'This is the name shown on your profile and applications.'),
                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-end' } },
                        React.createElement('div', { style: { flex: 1 } },
                            React.createElement(Input, { theme: s.theme, value: name, onChange: setName, placeholder: 'Your name', icon: 'user' })
                        ),
                        React.createElement(Button, {
                            kind: 'primary', size: 'md', theme: s.theme, onClick: saveName,
                            style: { opacity: nameChanged ? 1 : 0.5, cursor: nameChanged ? 'pointer' : 'not-allowed', pointerEvents: nameChanged ? 'auto' : 'none', height: 44 }
                        }, 'Save name')
                    )
                ),
                React.createElement(Card, { theme: s.theme, padding: 22 },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' } },
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary, marginBottom: 4 } }, 'Password'),
                            React.createElement('div', { style: { fontSize: 13, color: t.text.secondary } }, 'Keep your account secure with a strong password.')
                        ),
                        React.createElement(Button, { kind: 'secondary', size: 'md', theme: s.theme, icon: React.createElement(Icon, { name: 'lock', size: 15 }), onClick: () => setShowPwModal(true) }, 'Change password')
                    )
                ),
                React.createElement(Card, { theme: s.theme, padding: 22 },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' } },
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary, marginBottom: 4 } }, 'Switch to Hiring Employer'),
                            React.createElement('div', { style: { fontSize: 13, color: t.text.secondary } }, 'Post roles and manage applicants under an employer profile.')
                        ),
                        React.createElement(Button, { kind: 'accentSubtle', size: 'md', theme: s.theme, icon: React.createElement(Icon, { name: 'briefcase', size: 15 }), onClick: () => setShowSwitchModal(true) }, 'Switch account type')
                    )
                ),
                React.createElement(Card, { theme: s.theme, padding: 22, style: { border: `1px solid ${OC.urgent}33` } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' } },
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: OC.urgent, marginBottom: 4 } }, 'Delete account'),
                            React.createElement('div', { style: { fontSize: 13, color: t.text.secondary } }, 'Permanently remove your account and all saved data. This cannot be undone.')
                        ),
                        React.createElement(Button, { kind: 'destructive', size: 'md', onClick: () => setShowDeleteModal(true) }, 'Delete my account')
                    )
                ),
                showPwModal ? React.createElement(ChangePasswordModal, { onClose: () => setShowPwModal(false) }) : null,
                showSwitchModal ? React.createElement(SwitchAccountTypeModal, { onClose: () => setShowSwitchModal(false) }) : null,
                showDeleteModal ? React.createElement(DeleteAccountModal, { onClose: () => setShowDeleteModal(false) }) : null
            )
        )
    );
}

// ========================================
// ✅ UPDATED AccountMenu with "Back to Opportunities"
function AccountMenu() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [open, setOpen] = useState(false);

    const go = (name, params) => { setOpen(false); s.go(name, params); };

    const menuItems = s.isEmployerMode ? [
        { label: 'Dashboard', icon: 'chart', action: () => go('employers') },
        { 
            label: 'Back to Opportunities', 
            icon: 'arrowLeft', 
            action: () => { 
                setOpen(false); 
                s.setEmployerMode(false); 
                s.go('feed'); 
                s.showToast('Switched back to job seeker'); 
            } 
        },
        // ✅ FIXED: employers route ke saath tab parameter
        { 
            label: 'Company Profile', 
            icon: 'building', 
            action: () => {
                setOpen(false);
                s.go('employers', { tab: 'profile' });  // 👈 Direct dashboard ka profile tab
                s.showToast('Company Profile', 'building');
            } 
        },
        { label: 'Log out', icon: 'x', action: () => { setOpen(false); s.setAuthed(false); s.go('home'); s.showToast('Logged out'); }, danger: true },
    ] : [
        { label: 'Saved', icon: 'bookmark', action: () => go('saved') },
        { 
            label: 'Hire Employers', 
            icon: 'briefcase', 
            action: () => { 
                setOpen(false); 
                s.setEmployerMode(true); 
                s.go('employers'); 
                s.showToast('Switched to Hiring Employer', 'briefcase'); 
            } 
        },
        { label: 'Settings', icon: 'user', action: () => go('account', { tab: 'settings' }) },
        { label: 'Log out', icon: 'x', action: () => { setOpen(false); s.setAuthed(false); s.go('home'); s.showToast('Logged out'); }, danger: true },
    ];

    return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
            onClick: () => setOpen(o => !o),
            style: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999 }
        },
            React.createElement(Avatar, { name: s.user.name, size: 38, theme: s.theme }),
            React.createElement(Icon, { name: 'chevDown', size: 15, color: t.text.secondary })
        ),
        open ? [
            React.createElement('div', { key: 'overlay', onClick: () => setOpen(false), style: { position: 'fixed', inset: 0, zIndex: 50 } }),
            React.createElement('div', { key: 'menu', style: { position: 'absolute', top: 50, right: 0, width: 232, zIndex: 60, background: t.bg.page, border: `1px solid ${t.border.base}`, borderRadius: 14, boxShadow: t.shadow.lg, overflow: 'hidden', padding: 6 } },
                React.createElement('div', { style: { padding: '10px 12px 8px' } },
                    React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 14, color: t.text.primary } }, s.user.name),
                    React.createElement('div', { style: { fontSize: 12, color: t.text.secondary, marginTop: 1 } }, s.user.email)
                ),
                React.createElement('div', { style: { borderTop: `1px solid ${t.border.base}`, padding: '5px 0', marginTop: 4 } },
                    menuItems.map(item =>
                        React.createElement('button', {
                            key: item.label, onClick: item.action,
                            style: {
                                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                                padding: '9px 10px', background: 'none', border: 'none',
                                cursor: 'pointer', borderRadius: 9, textAlign: 'left',
                                fontFamily: FONT.body, fontSize: 13.5, fontWeight: 500,
                                color: item.danger ? OC.urgent : t.text.primary,
                            }
                        },
                            React.createElement(Icon, { name: item.icon, size: 16, color: item.danger ? OC.urgent : t.text.secondary }),
                            item.label
                        )
                    )
                )
            )
        ] : null
    );
}
// ========================================
// ✅ UPDATED AppNav with Employer Mode logic
// ========================================
function AppNav() {
    const s = useStore();
    const t = useTheme(s.theme);

    const navItems = s.isEmployerMode ? [
        { key: 'home', label: 'Home' },
        { key: 'postJob', label: 'Post an opportunity' },
        { key: 'employers', label: 'Dashboard' },
        { key: 'community', label: 'Community' },
        { key: 'about', label: 'About' },
        
    ] : [
        { key: 'home', label: 'Home' },
        { key: 'feed', label: 'Opportunities' },
        { key: 'community', label: 'Community' },
        { key: 'resources', label: 'Resources' },
        { key: 'about', label: 'About' },
    ];

    const iconBtnStyle = (on) => ({
        background: 'transparent',
        border: `1px solid ${t.border.base}`,
        cursor: 'pointer',
        width: 38,
        height: 38,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: on ? OC.orange : t.text.primary,
        borderRadius: 10,
        position: 'relative',
    });

    const isActive = (key) => {
        if (key === 'home') return s.route.name === 'home';
        if (key === 'feed') return s.route.name === 'feed' || s.route.name === 'detail' || s.route.name === 'search';
        if (key === 'employers') return s.route.name === 'employers';
        if (key === 'postJob') return s.route.name === 'postJob';
        return s.route.name === key;
    };

    // ✅ In employer mode OR viewing a job detail: show Dashboard, hide Search & Save
    const isEmployerView = s.isEmployerMode || s.route.name === 'detail';

    return React.createElement('nav', {
        style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', height: 68,
            borderBottom: `1px solid ${t.border.base}`,
            background: t.bg.page, position: 'sticky', top: 0, zIndex: 40,
        }
    },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 38 } },
            React.createElement('button', {
                onClick: () => s.go('home'),
                style: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 }
            }, React.createElement(LogoNav, { theme: s.theme, height: 27 })),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                navItems.map(it =>
                    React.createElement('button', {
                        key: it.key, onClick: () => s.go(it.key),
                        style: {
                            background: isActive(it.key) ? (s.theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted) : 'transparent',
                            border: 'none', cursor: 'pointer', borderRadius: 9,
                            padding: '8px 13px', fontFamily: FONT.body, fontSize: 14,
                            fontWeight: isActive(it.key) ? 700 : 500,
                            color: isActive(it.key) ? OC.orange : t.text.secondary,
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                        }
                    }, it.label)
                )
            )
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            // ✅ In Employer Mode OR viewing detail: Show Dashboard, hide Search & Save
            isEmployerView ? React.createElement('button', {
                onClick: () => s.go('employers'), title: 'Dashboard',
                style: iconBtnStyle(s.route.name === 'employers')
            }, React.createElement(Icon, { name: 'chart', size: 18 })) : [
                React.createElement('button', {
                    key: 'search',
                    onClick: () => s.go('search'), title: 'Search',
                    style: iconBtnStyle(s.route.name === 'search')
                }, React.createElement(Icon, { name: 'search', size: 18 })),
                React.createElement('button', {
                    key: 'saved',
                    onClick: () => s.go('saved'), title: 'Saved',
                    style: iconBtnStyle(s.route.name === 'saved')
                },
                    React.createElement(Icon, { name: 'bookmark', size: 18 }),
                    s.saved.length ? React.createElement('span', {
                        style: {
                            position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16,
                            padding: '0 4px', borderRadius: 8, background: OC.orange,
                            color: '#fff', fontSize: 10, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            border: `2px solid ${t.bg.page}`,
                        }
                    }, s.saved.length) : null
                ),
            ],
            React.createElement('button', {
                onClick: s.toggleTheme, title: 'Toggle light / dark',
                style: iconBtnStyle(false)
            }, React.createElement(Icon, { name: s.theme === 'dark' ? 'sun' : 'moon', size: 18 })),
            s.authed ? React.createElement('button', {
                onClick: () => s.go('notifications'), title: 'Notifications',
                style: iconBtnStyle(s.route.name === 'notifications')
            },
                React.createElement(Icon, { name: 'bell', size: 18 }),
                React.createElement('span', {
                    style: {
                        position: 'absolute', top: 8, right: 9,
                        width: 7, height: 7, borderRadius: 4,
                        background: OC.orange, border: `2px solid ${t.bg.page}`,
                    }
                })
            ) : null,
            s.authed ? React.createElement(AccountMenu, null) : [
                React.createElement('button', {
                    key: 'login',
                    onClick: () => {
                        s.go('login');
                        window.history.pushState({}, '', '/auth?mode=login');
                    },
                    style: {
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: FONT.body, fontSize: 14, fontWeight: 600,
                        color: t.text.primary, padding: '8px 12px',
                    }
                }, 'Log in'),
                React.createElement(Button, {
                    key: 'signup',
                    kind: 'primary', size: 'sm', theme: s.theme,
                    onClick: () => {
                        s.go('signup');
                        window.history.pushState({}, '', '/auth?mode=signup');
                    },
                    iconRight: React.createElement(Icon, { name: 'arrowRight', size: 14 })
                }, 'Sign up free')
            ]
        )
    );
}

// --- Footer ---
function Footer() {
    const s = useStore();
    const t = useTheme(s.theme);
    const cols = [
        { title: 'Opportunities', links: ['Jobs', 'Internships', 'Scholarships', 'Admissions', 'Events'] },
        { title: 'Community', links: ['Share an opportunity', 'WhatsApp channels', 'Telegram', 'Newsletter', 'Volunteer reviewers'] },
        { title: 'For employers', links: ['Post a role', 'Featured listings', 'Pricing', 'Employer login'] },
        { title: 'Support', links: ['Help center', 'Contact', 'Terms of service', 'Privacy', 'Community guidelines'] },
    ];

    return React.createElement('footer', {
        style: {
            background: s.theme === 'dark' ? t.bg.page : '#F9FAFB',
            borderTop: `1px solid ${t.border.base}`,
            padding: '56px 48px 28px',
            fontFamily: FONT.body,
            marginTop: 'auto'
        }
    },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 40, marginBottom: 40 } },
            React.createElement('div', null,
                React.createElement(LogoNav, { theme: s.theme, height: 30 }),
                React.createElement('p', { style: { fontSize: 13.5, color: t.text.secondary, marginTop: 14, maxWidth: 280, lineHeight: 1.5 } },
                    'Sharing is caring. We centralize life-changing opportunities so no one misses out for lack of access.'
                ),
                React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 18 } },
                    ['globe', 'send', 'mail', 'share', 'bell'].map(n =>
                        React.createElement('div', {
                            key: n,
                            style: {
                                width: 32, height: 32, borderRadius: 8,
                                background: t.bg.card, border: `1px solid ${t.border.base}`,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                color: t.text.secondary,
                            }
                        }, React.createElement(Icon, { name: n, size: 14 }))
                    )
                )
            ),
            cols.map(col =>
                React.createElement('div', { key: col.title },
                    React.createElement('div', {
                        style: {
                            fontFamily: FONT.mono, fontSize: 11, fontWeight: 600,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            color: t.text.secondary, marginBottom: 14,
                        }
                    }, col.title),
                    React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 } },
                        col.links.map(l =>
                            React.createElement('li', { key: l, style: { fontSize: 13.5, color: t.text.primary } }, l)
                        )
                    )
                )
            )
        ),
        React.createElement('div', {
            style: {
                paddingTop: 24, borderTop: `1px solid ${t.border.base}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 12.5, color: t.text.secondary,
            }
        },
            React.createElement('div', null, '© 2026 Nebulark · Opportunity Circle · Sharing is Caring'),
            React.createElement('div', { style: { display: 'flex', gap: 16 } },
                React.createElement('span', null, 'opportunitycircle.com'),
                React.createElement('span', null, 'Built by Nebulark')
            )
        )
    );
}

// ========================================
// 5. FILTER HELPERS
// ========================================

function locBucket(op) {
    const l = (op.location || '').toLowerCase();
    if (l.includes('remote')) return 'remote';
    if (l.includes('hybrid')) return 'hybrid';
    return 'onsite';
}

function dlBucket(d) {
    return d <= 7 ? 'd7' : d <= 30 ? 'd30' : 'd30plus';
}

function groupsForCat(cat) {
    const commonGroups = [
        { key: 'loc', title: 'Location', test: locBucket, opts: [['remote', 'Remote'], ['hybrid', 'Hybrid'], ['onsite', 'On-site']] },
    ];
    const catGroups = {
        all: [],
        jobs: [],
        internships: [],
        scholarships: [],
        admissions: [],
        events: [],
    };
    return [...commonGroups, ...(catGroups[cat] || catGroups.all)];
}

// ========================================
// 6. SCREENS
// ========================================

// --- HomeScreen ---
function HomeScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const latest = OPPORTUNITIES.slice(0, 6);
    const [news, setNews] = useState('');

    const textColor = s.theme === 'dark' ? '#FFFFFF' : '#111827';
    const textSecondary = s.theme === 'dark' ? '#E5E7EB' : '#6B7280';
    const textMuted = s.theme === 'dark' ? '#9CA3AF' : '#6B7280';

    return React.createElement('div', { style: { paddingBottom: 80 } },
        React.createElement('div', { 
            style: { 
                backgroundImage: 'url(first.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: s.theme === 'dark' ? OC.charcoal : '#FFFFFF',
                borderBottom: `1px solid ${t.border.base}`,
                minHeight: '450px',
                position: 'relative',
            }
        },
            React.createElement('div', {
                style: {
                    position: 'absolute', inset: 0,
                    background: s.theme === 'dark'
                        ? 'linear-gradient(90deg, rgba(17,17,18,.96) 0%, rgba(17,17,18,.88) 42%, rgba(17,17,18,.4) 70%, rgba(17,17,18,0) 90%)'
                        : 'linear-gradient(90deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,.5) 55%, rgba(255,255,255,.1) 100%)',
                }
            }),
            React.createElement('div', { 
                style: { 
                    maxWidth: 1180, 
                    margin: '0 auto', 
                    padding: '0 32px', 
                    width: '100%',
                    position: 'relative',
                }
            },
                React.createElement('div', { style: { padding: '72px 0 64px', maxWidth: 560 } },
                    React.createElement(Badge, { color: OC.orange, theme: s.theme, style: { fontSize: 12.5, padding: '6px 12px' } }, 'Sharing is caring'),
                    React.createElement('h1', { style: { 
                        fontFamily: FONT.display, 
                        fontWeight: 800, 
                        fontSize: 52, 
                        lineHeight: 1.05, 
                        letterSpacing: '-0.03em', 
                        color: textColor,
                        margin: '20px 0 16px' 
                    } },
                        'Every opportunity,', React.createElement('br', null), 'in one circle.'
                    ),
                    React.createElement('p', { style: { 
                        fontFamily: FONT.body, 
                        fontSize: 18, 
                        lineHeight: 1.55, 
                        color: textSecondary,
                        margin: '0 0 28px' 
                    } },
                        'Jobs, scholarships, internships, admissions and events — gathered, verified and shared so no one misses out for lack of access.'
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' } },
                        React.createElement(Button, { kind: 'primary', size: 'lg', theme: s.theme, onClick: () => s.go('feed'), iconRight: React.createElement(Icon, { name: 'arrowRight', size: 16 }) }, 'Browse opportunities'),
                        React.createElement(Button, { kind: 'secondary', size: 'lg', theme: s.theme, onClick: () => s.go('share'), icon: React.createElement(Icon, { name: 'plus', size: 16 }) }, 'Share one')
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: 28, marginTop: 36 } },
                        [['18k+', 'live opportunities'], ['540', 'volunteer reviewers'], ['96', 'countries reached']].map(([n, l]) =>
                            React.createElement('div', { key: l },
                                React.createElement('div', { style: { 
                                    fontFamily: FONT.display, 
                                    fontWeight: 800, 
                                    fontSize: 26, 
                                    color: textColor,
                                } }, n),
                                React.createElement('div', { style: { 
                                    fontFamily: FONT.body, 
                                    fontSize: 13, 
                                    color: textMuted,
                                } }, l)
                            )
                        )
                    )
                )
            )
        ),
        React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '0 32px', width: '100%' } },
            React.createElement('div', { style: { padding: '48px 0 8px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 } },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: OC.orange, marginBottom: 8 } }, 'Explore by type'),
                        React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 26, margin: 0, color: t.text.primary, letterSpacing: '-0.02em' } }, 'What are you looking for?')
                    )
                ),
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 } },
                    CAT_KEYS.map(key => {
                        const cat = CATEGORY[key];
                        return React.createElement('button', {
                            key: key, onClick: () => s.go('feed', { cat: key }),
                            style: {
                                background: t.bg.card, border: `1px solid ${t.border.base}`,
                                borderRadius: 16, padding: 20, cursor: 'pointer',
                                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12,
                                fontFamily: FONT.body, transition: 'transform .12s ease',
                            },
                            onMouseEnter: e => e.currentTarget.style.transform = 'translateY(-3px)',
                            onMouseLeave: e => e.currentTarget.style.transform = 'none',
                        },
                            React.createElement(CategoryIcon, { category: key, size: 42, theme: s.theme }),
                            React.createElement('div', null,
                                React.createElement('div', { style: { fontWeight: 700, fontSize: 15, color: t.text.primary } }, cat.label),
                                React.createElement('div', { style: { fontSize: 12.5, color: t.text.secondary, marginTop: 2 } }, 'Live now')
                            )
                        );
                    })
                )
            ),
            React.createElement('div', { style: { padding: '44px 0 8px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 } },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: OC.orange, marginBottom: 8 } }, 'Fresh today'),
                        React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 26, margin: 0, color: t.text.primary, letterSpacing: '-0.02em' } }, 'Latest opportunities')
                    ),
                    React.createElement('button', {
                        onClick: () => s.go('feed'),
                        style: { background: 'none', border: 'none', cursor: 'pointer', color: OC.orange, fontFamily: FONT.body, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }
                    }, 'See all', React.createElement(Icon, { name: 'arrowRight', size: 15 }))
                ),
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } },
                    latest.map(op => React.createElement(OpportunityCard, { key: op.id, op: op }))
                )
            ),
            React.createElement('div', {
                style: {
                    margin: '52px 0 0', background: OC.charcoal,
                    borderRadius: 22, padding: '44px 48px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: 32, flexWrap: 'wrap',
                }
            },
                React.createElement('div', { style: { maxWidth: 440 } },
                    React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' } },
                        'Never miss a deadline'
                    ),
                    React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 15, color: 'rgba(255,255,255,.7)', margin: 0, lineHeight: 1.5 } },
                        'One weekly digest of opportunities matched to your interests. No spam, unsubscribe anytime.'
                    )
                ),
                React.createElement('div', { style: { display: 'flex', gap: 10, flex: '1 1 320px', maxWidth: 440 } },
                    React.createElement('input', {
                        value: news,
                        onChange: e => setNews(e.target.value),
                        placeholder: 'you@email.com',
                        style: {
                            flex: 1, height: 48, borderRadius: 11, border: 'none',
                            padding: '0 16px', fontFamily: FONT.body, fontSize: 15,
                            background: 'rgba(255,255,255,.12)', color: '#fff',
                        }
                    }),
                    React.createElement(Button, {
                        kind: 'primary', size: 'lg', theme: 'dark',
                        onClick: () => { if (news) { s.showToast('Subscribed — check your inbox', 'mail'); setNews(''); } }
                    }, 'Subscribe')
                )
            )
        )
    );
}

// --- FeedScreen ---
function FeedScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [cat, setCat] = useState(s.route.cat || 'all');
    const [sort, setSort] = useState('deadline');
    const [savedOnly, setSavedOnly] = useState(false);
    const [view, setView] = useState('grid');
    const [filters, setFilters] = useState({});
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [workplaceTypes, setWorkplaceTypes] = useState([]);
    const [salaryRange, setSalaryRange] = useState(75000);
    const [datePosted, setDatePosted] = useState('30');

    const toggleEmployment = (type) => {
        setEmploymentTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };
    const toggleWorkplace = (type) => {
        setWorkplaceTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const visibleGroups = groupsForCat(cat);
    const changeCat = (next) => { setCat(next); setFilters({}); };
    const toggleFilter = (group, val) => setFilters(f => {
        const cur = f[group] || [];
        return { ...f, [group]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
    });
    const resetFilters = () => {
        setFilters({});
        setSavedOnly(false);
        setCat('all');
        setSearchQuery('');
        setSelectedLocation('all');
        setSelectedCategory('all');
        setEmploymentTypes([]);
        setWorkplaceTypes([]);
        setSalaryRange(75000);
        setDatePosted('30');
    };
    const activeCount = visibleGroups.reduce((n, g) => n + (filters[g.key] || []).length, 0) + (savedOnly ? 1 : 0) + (cat !== 'all' ? 1 : 0);
    let list = OPPORTUNITIES.filter(o => {
        if (searchQuery && !o.title.toLowerCase().includes(searchQuery.toLowerCase()) && !o.org.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (selectedCategory !== 'all' && o.category !== selectedCategory.toLowerCase()) {
            return false;
        }
        if (selectedLocation !== 'all') {
            const locMatch = o.location.toLowerCase().includes(selectedLocation.toLowerCase());
            if (!locMatch) return false;
        }
        if (employmentTypes.length > 0) {
            const empMatch = employmentTypes.some(et => o.type.toLowerCase().includes(et.toLowerCase()));
            if (!empMatch) return false;
        }
        if (workplaceTypes.length > 0) {
            const wpMatch = workplaceTypes.some(wp => o.location.toLowerCase().includes(wp.toLowerCase()));
            if (!wpMatch) return false;
        }
        if (cat !== 'all' && o.category !== cat) return false;
        if (savedOnly && !s.isSaved(o.id)) return false;
        for (const g of visibleGroups) {
            const sel = filters[g.key] || [];
            if (sel.length && !sel.includes(g.test(o))) return false;
        }
        return true;
    });
    list = [...list].sort((a, b) =>
        sort === 'deadline' ? a.daysLeft - b.daysLeft :
        sort === 'newest' ? b.daysLeft - a.daysLeft :
        a.title.localeCompare(b.title)
    );

    const tabs = [{ key: 'all', label: 'All' }, ...CAT_KEYS.map(k => ({ key: k, label: CATEGORY[k].label }))];

    const chips = [];
    if (cat !== 'all') chips.push({ label: CATEGORY[cat].label, onX: () => changeCat('all') });
    if (searchQuery) chips.push({ label: `Search: ${searchQuery}`, onX: () => setSearchQuery('') });
    if (selectedLocation !== 'all') chips.push({ label: `Location: ${selectedLocation}`, onX: () => setSelectedLocation('all') });
    if (selectedCategory !== 'all') chips.push({ label: `Category: ${selectedCategory}`, onX: () => setSelectedCategory('all') });
    employmentTypes.forEach(et => chips.push({ label: et, onX: () => toggleEmployment(et) }));
    workplaceTypes.forEach(wt => chips.push({ label: wt, onX: () => toggleWorkplace(wt) }));
    visibleGroups.forEach(g => g.opts.forEach(([v, lbl]) => {
        if ((filters[g.key] || []).includes(v)) chips.push({ label: lbl, onX: () => toggleFilter(g.key, v) });
    }));
    if (savedOnly) chips.push({ label: 'Saved only', onX: () => setSavedOnly(false) });

    return React.createElement('div', { style: { padding: '0 32px', width: '100%' } },
        React.createElement('div', { style: { padding: '36px 0 80px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: t.text.secondary, marginBottom: 12 } },
                React.createElement('button', { onClick: () => s.go('home'), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, fontSize: 12.5, padding: 0 } }, 'Home'),
                React.createElement(Icon, { name: 'chevRight', size: 12 }),
                React.createElement('span', { style: { color: t.text.primary, fontWeight: 600 } }, 'Opportunities')
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, gap: 24, flexWrap: 'wrap' } },
                React.createElement('div', null,
                    React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 36, margin: 0, color: t.text.primary, letterSpacing: '-0.025em' } },
                        'Browse all opportunities'
                    ),
                    React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 15, color: t.text.secondary, margin: '6px 0 0' } },
                        React.createElement('strong', { style: { color: t.text.primary } }, list.length),
                        ' matching · refreshed moments ago'
                    )
                ),
                React.createElement('div', { style: { display: 'flex', gap: 4, padding: 4, background: t.bg.card, border: `1px solid ${t.border.base}`, borderRadius: 12 } },
                    [['grid', 'Grid'], ['list', 'List']].map(([v, lbl]) =>
                        React.createElement('button', {
                            key: v, onClick: () => setView(v),
                            style: {
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '7px 13px', borderRadius: 9, cursor: 'pointer', border: 'none',
                                background: view === v ? OC.orange : 'transparent',
                                color: view === v ? '#fff' : t.text.secondary,
                                fontFamily: FONT.body, fontSize: 13, fontWeight: 600,
                            }
                        }, React.createElement(Icon, { name: v, size: 15 }), lbl)
                    )
                )
            ),
            React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 } },
                tabs.map(tb => {
                    const active = cat === tb.key;
                    return React.createElement('button', {
                        key: tb.key, onClick: () => changeCat(tb.key),
                        style: {
                            border: `1px solid ${active ? OC.orange : t.border.base}`,
                            background: active ? OC.orange : t.bg.card,
                            color: active ? '#fff' : t.text.secondary,
                            borderRadius: 999, padding: '9px 16px',
                            cursor: 'pointer', fontFamily: FONT.body,
                            fontWeight: 600, fontSize: 13.5,
                        }
                    }, tb.label);
                })
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28, alignItems: 'start' } },
                React.createElement('aside', {
                    style: {
                        background: t.bg.card,
                        border: `1px solid ${t.border.base}`,
                        borderRadius: 16,
                        padding: 20,
                        position: 'sticky',
                        top: 88,
                        maxHeight: 'calc(100vh - 120px)',
                        overflowY: 'auto',
                    }
                },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
                        React.createElement('span', { style: { fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: t.text.primary } }, 'Filters'),
                        (activeCount || searchQuery || selectedLocation !== 'all' || selectedCategory !== 'all' || employmentTypes.length > 0 || workplaceTypes.length > 0) ?
                            React.createElement('button', { onClick: resetFilters, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: OC.orange, fontWeight: 600 } }, 'Reset All')
                            : null
                    ),
                    
                    // Search Input
                    React.createElement('div', { style: { marginBottom: 16 } },
                        React.createElement('div', { style: { 
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: t.bg.page, border: `1px solid ${t.border.base}`,
                            borderRadius: 9, padding: '0 12px',
                        } },
                            React.createElement(Icon, { name: 'search', size: 16, color: t.text.secondary }),
                            React.createElement('input', {
                                value: searchQuery,
                                onChange: e => setSearchQuery(e.target.value),
                                placeholder: 'Search by title...',
                                style: {
                                    flex: 1, border: 'none', outline: 'none',
                                    background: 'transparent', fontFamily: FONT.body,
                                    fontSize: 13.5, color: t.text.primary,
                                    padding: '9px 0',
                                }
                            }),
                            searchQuery ? React.createElement('button', {
                                onClick: () => setSearchQuery(''),
                                style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary }
                            }, React.createElement(Icon, { name: 'x', size: 14 })) : null
                        )
                    ),

                    // Saved only
                    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 } },
                        React.createElement('label', {
                            style: { display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', cursor: 'pointer' },
                            onClick: () => setSavedOnly(v => !v)
                        },
                            React.createElement('span', {
                                style: {
                                    width: 17, height: 17, borderRadius: 5, flex: '0 0 auto',
                                    background: savedOnly ? OC.orange : 'transparent',
                                    border: `1.5px solid ${savedOnly ? OC.orange : t.border.strong}`,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }
                            }, savedOnly ? React.createElement(Icon, { name: 'check', size: 11, color: '#fff' }) : null),
                            React.createElement('span', { style: { fontSize: 13.5, color: t.text.primary, fontWeight: 500, flex: 1 } }, 'Saved only'),
                            React.createElement('span', { style: { fontSize: 11.5, color: t.text.secondary } }, s.saved.length)
                        )
                    ),

                    // Location Dropdown
                    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.text.secondary, marginBottom: 8 } }, '📍 Location'),
                        React.createElement('select', {
                            value: selectedLocation,
                            onChange: e => setSelectedLocation(e.target.value),
                            style: {
                                width: '100%', padding: '8px 12px', borderRadius: 8,
                                background: t.bg.page, border: `1px solid ${t.border.base}`,
                                fontFamily: FONT.body, fontSize: 13, color: t.text.primary,
                                outline: 'none', cursor: 'pointer',
                            }
                        },
                            React.createElement('option', { value: 'all' }, 'All Locations'),
                            LOCATIONS.map(loc => 
                                React.createElement('option', { key: loc, value: loc }, loc)
                            )
                        )
                    ),

                    // Job Category Dropdown
                    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.text.secondary, marginBottom: 8 } }, '🏷️ Job Category'),
                        React.createElement('select', {
                            value: selectedCategory,
                            onChange: e => setSelectedCategory(e.target.value),
                            style: {
                                width: '100%', padding: '8px 12px', borderRadius: 8,
                                background: t.bg.page, border: `1px solid ${t.border.base}`,
                                fontFamily: FONT.body, fontSize: 13, color: t.text.primary,
                                outline: 'none', cursor: 'pointer',
                            }
                        },
                            React.createElement('option', { value: 'all' }, 'All Categories'),
                            JOB_CATEGORIES.map(cat => 
                                React.createElement('option', { key: cat, value: cat }, cat)
                            )
                        )
                    ),

                    // Employment Type Checkboxes
                    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.text.secondary, marginBottom: 8 } }, '💼 Employment Type'),
                        EMPLOYMENT_TYPES.map(et => {
                            const count = OPPORTUNITIES.filter(o => o.type.toLowerCase().includes(et.toLowerCase())).length;
                            const on = employmentTypes.includes(et);
                            return React.createElement('label', {
                                key: et, onClick: () => toggleEmployment(et),
                                style: { display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', cursor: 'pointer' }
                            },
                                React.createElement('span', {
                                    style: {
                                        width: 17, height: 17, borderRadius: 5, flex: '0 0 auto',
                                        background: on ? OC.orange : 'transparent',
                                        border: `1.5px solid ${on ? OC.orange : t.border.strong}`,
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    }
                                }, on ? React.createElement(Icon, { name: 'check', size: 11, color: '#fff' }) : null),
                                React.createElement('span', { style: { fontSize: 13, color: t.text.primary, fontWeight: 500, flex: 1 } }, et),
                                React.createElement('span', { style: { fontSize: 11.5, color: t.text.secondary } }, count)
                            );
                        })
                    ),

                    // Workplace Type Checkboxes
                    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.text.secondary, marginBottom: 8 } }, '🏠 Workplace Type'),
                        WORKPLACE_TYPES.map(wt => {
                            const count = OPPORTUNITIES.filter(o => o.location.toLowerCase().includes(wt.toLowerCase())).length;
                            const on = workplaceTypes.includes(wt);
                            return React.createElement('label', {
                                key: wt, onClick: () => toggleWorkplace(wt),
                                style: { display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', cursor: 'pointer' }
                            },
                                React.createElement('span', {
                                    style: {
                                        width: 17, height: 17, borderRadius: 5, flex: '0 0 auto',
                                        background: on ? OC.orange : 'transparent',
                                        border: `1.5px solid ${on ? OC.orange : t.border.strong}`,
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    }
                                }, on ? React.createElement(Icon, { name: 'check', size: 11, color: '#fff' }) : null),
                                React.createElement('span', { style: { fontSize: 13, color: t.text.primary, fontWeight: 500, flex: 1 } }, wt),
                                React.createElement('span', { style: { fontSize: 11.5, color: t.text.secondary } }, count)
                            );
                        })
                    ),

                    // Salary Range
                    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.text.secondary, marginBottom: 8 } }, '💰 Salary Range'),
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                            React.createElement('span', { style: { fontSize: 12, color: t.text.secondary } }, '$20K'),
                            React.createElement('input', {
                                type: 'range',
                                min: 20000,
                                max: 150000,
                                step: 10000,
                                value: salaryRange,
                                onChange: e => setSalaryRange(parseInt(e.target.value)),
                                style: { flex: 1, accentColor: OC.orange }
                            }),
                            React.createElement('span', { style: { fontSize: 12, color: t.text.primary, fontWeight: 600 } }, 
                                salaryRange >= 150000 ? '$150K+' : `$${salaryRange/1000}K`
                            )
                        )
                    ),

                    // Date Posted
                    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                        React.createElement('div', { style: { fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.text.secondary, marginBottom: 8 } }, '📅 Date Posted'),
                        ['24', '7', '30'].map(days => {
                            const label = days === '24' ? 'Last 24 Hours' : days === '7' ? 'Last 7 Days' : 'Last 30 Days';
                            const on = datePosted === days;
                            return React.createElement('label', {
                                key: days, onClick: () => setDatePosted(days),
                                style: { display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', cursor: 'pointer' }
                            },
                                React.createElement('span', {
                                    style: {
                                        width: 17, height: 17, borderRadius: '50%', flex: '0 0 auto',
                                        background: on ? OC.orange : 'transparent',
                                        border: `1.5px solid ${on ? OC.orange : t.border.strong}`,
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    }
                                }, on ? React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: '#fff' } }) : null),
                                React.createElement('span', { style: { fontSize: 13, color: t.text.primary, fontWeight: 500 } }, label)
                            );
                        })
                    ),

                    // Category filters
                    cat !== 'all' ? React.createElement('div', {
                        style: {
                            display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, marginTop: 12, paddingTop: 12,
                            padding: '8px 10px', borderRadius: 9,
                            background: s.theme === 'dark' ? 'rgba(249,115,22,.12)' : OC.orangeMuted,
                            borderTop: `1px solid ${t.border.base}`,
                        }
                    },
                        React.createElement(CategoryIcon, { category: cat, size: 26, theme: s.theme }),
                        React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: OC.orange } }, CATEGORY[cat].label, ' filters')
                    ) : null,
                    visibleGroups.map(g =>
                        React.createElement('div', { key: g.key, style: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
                            React.createElement('div', {
                                style: {
                                    fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    color: t.text.secondary, marginBottom: 10,
                                }
                            }, g.title),
                            g.opts.map(([v, lbl]) => {
                                const count = OPPORTUNITIES.filter(o => g.test(o) === v && (cat === 'all' || o.category === cat)).length;
                                const on = (filters[g.key] || []).includes(v);
                                return React.createElement('label', {
                                    key: v, onClick: () => toggleFilter(g.key, v),
                                    style: { display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', cursor: 'pointer' }
                                },
                                    React.createElement('span', {
                                        style: {
                                            width: 17, height: 17, borderRadius: 5, flex: '0 0 auto',
                                            background: on ? OC.orange : 'transparent',
                                            border: `1.5px solid ${on ? OC.orange : t.border.strong}`,
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        }
                                    }, on ? React.createElement(Icon, { name: 'check', size: 11, color: '#fff' }) : null),
                                    React.createElement('span', { style: { fontSize: 13, color: t.text.primary, fontWeight: 500, flex: 1 } }, lbl),
                                    React.createElement('span', { style: { fontSize: 11.5, color: t.text.secondary } }, count)
                                );
                            })
                        )
                    )
                ),
                // Results
                React.createElement('div', null,
                    // Sort + active chips bar
                    React.createElement('div', {
                        style: {
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            gap: 12, padding: '12px 16px', marginBottom: 16,
                            background: t.bg.card, border: `1px solid ${t.border.base}`,
                            borderRadius: 12, flexWrap: 'wrap',
                        }
                    },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                            chips.length ? React.createElement('span', { style: { fontSize: 12.5, color: t.text.secondary, fontWeight: 500 } }, 'Active:') :
                                React.createElement('span', { style: { fontSize: 12.5, color: t.text.secondary } }, 'No filters applied'),
                            chips.map((c, i) =>
                                React.createElement('button', {
                                    key: i, onClick: c.onX,
                                    style: {
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        padding: '6px 10px', borderRadius: 8,
                                        background: s.theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted,
                                        border: `1px solid ${OC.orangeSubtle}`, color: OC.orange,
                                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                    }
                                }, c.label, React.createElement(Icon, { name: 'x', size: 12 }))
                            )
                        ),
                        React.createElement('div', {
                            style: {
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                fontFamily: FONT.body, fontSize: 13, color: t.text.secondary,
                            }
                        },
                            React.createElement(Icon, { name: 'filter', size: 14 }),
                            React.createElement('select', {
                                value: sort, onChange: e => setSort(e.target.value),
                                style: {
                                    border: 'none', background: 'transparent',
                                    fontFamily: FONT.body, fontSize: 13,
                                    fontWeight: 600,
                                    color: s.theme === 'dark' ? '#F9FAFB' : '#111827',
                                    cursor: 'pointer', outline: 'none',
                                }
                            },
                                React.createElement('option', { value: 'deadline' }, 'Closing soonest'),
                                React.createElement('option', { value: 'newest' }, 'Latest deadline'),
                                React.createElement('option', { value: 'az' }, 'A–Z')
                            )
                        )
                    ),
                    list.length ? (
                        view === 'grid' ?
                            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 } },
                                list.map(op => React.createElement(OpportunityCard, { key: op.id, op: op }))
                            ) :
                            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                                list.map(op => React.createElement(FeedRow, { key: op.id, op: op }))
                            )
                    ) : React.createElement('div', { style: { textAlign: 'center', padding: '64px 24px', border: `1px dashed ${t.border.strong}`, borderRadius: 18, background: t.bg.card } },
                        React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 19, color: t.text.primary, margin: '0 0 6px' } },
                            savedOnly ? 'Nothing saved matches' : 'No opportunities match your filters'
                        ),
                        React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 14.5, color: t.text.secondary, margin: '0 0 20px' } },
                            'Try removing a filter or widening your criteria.'
                        ),
                        React.createElement(Button, { kind: 'primary', size: 'md', theme: s.theme, onClick: resetFilters }, 'Reset filters')
                    )
                )
            )
        )
    );
}

// --- FeedRow ---
function FeedRow({ op }) {
    const s = useStore();
    const t = useTheme(s.theme);
    const cat = CATEGORY[op.category] || CATEGORY.jobs;
    const saved = s.isSaved(op.id);
    const applied = s.hasApplied(op.id);

    return React.createElement('article', {
        onClick: () => s.go('detail', { id: op.id }),
        style: {
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 18px', borderRadius: 14,
            background: t.bg.card, border: `1px solid ${t.border.base}`,
            fontFamily: FONT.body, cursor: 'pointer',
        }
    },
        React.createElement(Avatar, { name: op.org, size: 44, theme: s.theme }),
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 } },
                React.createElement(Badge, { color: cat.color, theme: s.theme, icon: React.createElement(Icon, { name: cat.icon, size: 11 }) }, cat.label),
                React.createElement('span', { style: { fontSize: 11.5, color: t.text.secondary, fontFamily: FONT.mono } }, op.source)
            ),
            React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, margin: 0, color: t.text.primary, letterSpacing: '-0.012em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, op.title),
            React.createElement('div', { style: { fontSize: 13, color: t.text.secondary, marginTop: 2 } }, op.org, ' · ', op.location)
        ),
        React.createElement(Deadline, { days: op.daysLeft, theme: s.theme }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
            React.createElement('button', {
                onClick: (e) => { e.stopPropagation(); s.toggleSave(op.id); },
                style: { ...iconBtn(t), color: saved ? OC.orange : t.text.secondary, borderColor: saved ? OC.orange : t.border.base }
            }, React.createElement(Icon, { name: saved ? 'bookmarkFilled' : 'bookmark', size: 15 })),
            React.createElement('button', {
                onClick: (e) => { e.stopPropagation(); s.startApply(op.id); },
                style: { ...iconBtn(t), background: applied ? 'transparent' : OC.orange, color: applied ? OC.success : '#fff', border: applied ? `1px solid ${OC.success}` : 'none', padding: '0 14px', width: 'auto', fontWeight: 600, fontSize: 13, gap: 4 }
            }, applied ? React.createElement(React.Fragment, null, React.createElement(Icon, { name: 'check', size: 13 }), ' Applied') : React.createElement(React.Fragment, null, 'Apply ', React.createElement(Icon, { name: 'arrowRight', size: 13 })))
        )
    );
}

// --- OpportunityCard ---
function OpportunityCard({ op }) {
    const s = useStore();
    const t = useTheme(s.theme);
    const cat = CATEGORY[op.category] || CATEGORY.jobs;
    const saved = s.isSaved(op.id);
    const applied = s.hasApplied(op.id);
    const [hover, setHover] = useState(false);

    return React.createElement('article', {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        onClick: () => s.go('detail', { id: op.id }),
        style: {
            background: t.bg.card, border: `1px solid ${hover ? t.border.strong : t.border.base}`,
            borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column',
            gap: 14, fontFamily: FONT.body, position: 'relative', cursor: 'pointer',
            boxShadow: hover ? t.shadow.md : 'none',
            transition: 'box-shadow .15s ease, border-color .15s ease',
            transform: hover ? 'translateY(-2px)' : 'none',
        }
    },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 } },
            React.createElement(Badge, { color: cat.color, theme: s.theme, icon: React.createElement(Icon, { name: cat.icon, size: 11 }) }, cat.label),
            React.createElement(Deadline, { days: op.daysLeft, theme: s.theme })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start' } },
            React.createElement(Avatar, { name: op.org, size: 40, theme: s.theme }),
            React.createElement('div', { style: { minWidth: 0, flex: 1 } },
                React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 17, lineHeight: 1.25, margin: 0, color: t.text.primary, letterSpacing: '-0.012em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, op.title),
                React.createElement('div', { style: { fontSize: 13.5, color: t.text.secondary, marginTop: 4, fontWeight: 500 } }, op.org)
            )
        ),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
            React.createElement(MetaChip, { theme: s.theme, icon: 'mapPin' }, op.location),
            op.salary && op.salary !== '—' ? React.createElement(MetaChip, { theme: s.theme, icon: 'sparkle' }, op.salary) : null
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${t.border.base}` } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: t.text.secondary } },
                React.createElement('span', { style: { fontFamily: FONT.mono } }, op.source),
                React.createElement('span', { style: { width: 3, height: 3, borderRadius: 3, background: t.text.disabled, display: 'inline-block' } }),
                React.createElement('span', null, op.posted)
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                React.createElement('button', {
                    onClick: (e) => { e.stopPropagation(); s.toggleSave(op.id); },
                    title: saved ? 'Saved' : 'Save',
                    style: { ...iconBtn(t), color: saved ? OC.orange : t.text.secondary, borderColor: saved ? OC.orange : t.border.base, background: saved ? (s.theme === 'dark' ? 'rgba(249,115,22,.12)' : OC.orangeMuted) : 'transparent' }
                }, React.createElement(Icon, { name: saved ? 'bookmarkFilled' : 'bookmark', size: 15 })),
                React.createElement('button', {
                    onClick: (e) => { e.stopPropagation(); s.startApply(op.id); },
                    style: { ...iconBtn(t), background: applied ? (s.theme === 'dark' ? t.bg.subtle : '#F0FDF4') : OC.orange, color: applied ? OC.success : '#fff', border: applied ? `1px solid ${OC.success}` : 'none', padding: '0 14px', width: 'auto', fontWeight: 600, fontSize: 13, gap: 5 }
                }, applied ? React.createElement(React.Fragment, null, React.createElement(Icon, { name: 'check', size: 13 }), ' Applied') : React.createElement(React.Fragment, null, 'Apply ', React.createElement(Icon, { name: 'arrowRight', size: 13 })))
            )
        )
    );
}

// ========================================
// ✅ NEW: DetailScreen (was missing — 'detail' route had no screen)
// ========================================
function DetailScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const id = s.route.id;
    const op = OPPORTUNITIES.find(o => o.id === id);

    if (!op) {
        return React.createElement('div', { style: { maxWidth: 920, margin: '0 auto', padding: '80px 32px', textAlign: 'center' } },
            React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: t.text.primary, margin: '0 0 10px' } }, 'Opportunity not found'),
            React.createElement('p', { style: { fontSize: 14.5, color: t.text.secondary, margin: '0 0 20px' } }, "This listing may have expired or the link is incorrect."),
            React.createElement(Button, { kind: 'primary', size: 'md', theme: s.theme, onClick: () => s.go('feed') }, 'Back to opportunities')
        );
    }

    const cat = CATEGORY[op.category] || CATEGORY.jobs;
    const saved = s.isSaved(op.id);
    const applied = s.hasApplied(op.id);

    return React.createElement('div', { style: { maxWidth: 860, margin: '0 auto', padding: '0 32px', width: '100%' } },
        React.createElement('div', { style: { padding: '36px 0 80px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: t.text.secondary, marginBottom: 20 } },
                React.createElement('button', { onClick: () => s.go('home'), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, fontSize: 12.5, padding: 0 } }, 'Home'),
                React.createElement(Icon, { name: 'chevRight', size: 12 }),
                React.createElement('button', { onClick: () => s.go('feed'), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, fontSize: 12.5, padding: 0 } }, 'Opportunities'),
                React.createElement(Icon, { name: 'chevRight', size: 12 }),
                React.createElement('span', { style: { color: t.text.primary, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 } }, op.title)
            ),
            React.createElement(Card, { theme: s.theme, padding: 28 },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18, flexWrap: 'wrap' } },
                    React.createElement(Badge, { color: cat.color, theme: s.theme, icon: React.createElement(Icon, { name: cat.icon, size: 12 }) }, cat.label),
                    React.createElement(Deadline, { days: op.daysLeft, theme: s.theme, size: 'md' })
                ),
                React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 } },
                    React.createElement(Avatar, { name: op.org, size: 52, theme: s.theme }),
                    React.createElement('div', null,
                        React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 26, margin: 0, color: t.text.primary, letterSpacing: '-0.02em' } }, op.title),
                        React.createElement('div', { style: { fontSize: 15, color: t.text.secondary, marginTop: 6, fontWeight: 500 } }, op.org)
                    )
                ),
                React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 } },
                    React.createElement(MetaChip, { theme: s.theme, icon: 'mapPin' }, op.location),
                    op.salary && op.salary !== '—' ? React.createElement(MetaChip, { theme: s.theme, icon: 'sparkle' }, op.salary) : null,
                    op.type ? React.createElement(MetaChip, { theme: s.theme, icon: 'briefcase' }, op.type) : null,
                    op.level ? React.createElement(MetaChip, { theme: s.theme, icon: 'award' }, op.level) : null
                ),
                op.summary ? React.createElement('p', { style: { fontSize: 15, lineHeight: 1.6, color: t.text.primary, margin: '0 0 20px' } }, op.summary) : null,
                op.skills && op.skills.length ? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 } },
                    op.skills.map(sk => React.createElement(MonoTag, { key: sk, theme: s.theme }, sk))
                ) : null,
                React.createElement('div', { style: { display: 'flex', gap: 10, paddingTop: 20, borderTop: `1px solid ${t.border.base}` } },
                    React.createElement(Button, {
                        kind: 'primary', size: 'lg', theme: s.theme, style: { flex: 1 },
                        onClick: () => s.startApply(op.id),
                        icon: applied ? React.createElement(Icon, { name: 'check', size: 16 }) : undefined,
                        iconRight: !applied ? React.createElement(Icon, { name: 'arrowUpRight', size: 16 }) : undefined,
                    }, applied ? 'Applied' : 'Apply now'),
                    React.createElement(Button, {
                        kind: 'secondary', size: 'lg', theme: s.theme,
                        onClick: () => s.toggleSave(op.id),
                        icon: React.createElement(Icon, { name: saved ? 'bookmarkFilled' : 'bookmark', size: 16, color: saved ? OC.orange : undefined })
                    }, saved ? 'Saved' : 'Save')
                )
            )
        )
    );
}

// --- AuthScreen ---
function AuthScreen({ mode }) {
    const s = useStore();
    const t = useTheme(s.theme);
    const isSignup = mode === 'signup';
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const valid = email.includes('@') && pw.length >= 6 && (!isSignup || name.trim().length > 1);

    const submit = () => {
        if (email) s.setUser({ name: isSignup ? name : s.user.name, email });
        if (isSignup) { s.go('verify'); return; }
        s.setAuthed(true);
        s.showToast('Welcome back', 'check');
        s.go('feed');
    };

    const switchMode = (newMode) => {
        s.go(newMode === 'signup' ? 'signup' : 'login');
        window.history.pushState({}, '', `/auth?mode=${newMode}`);
    };

    return React.createElement('div', { style: { maxWidth: 480, margin: '0 auto', padding: '0 32px', width: '100%' } },
        React.createElement('div', { style: { padding: '56px 0 80px' } },
            React.createElement('div', { style: { textAlign: 'center', marginBottom: 28 } },
                React.createElement('div', { style: { display: 'inline-flex', marginBottom: 18 } },
                    React.createElement(LogoNav, { theme: s.theme, height: 30 })
                ),
                React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 28, margin: '0 0 6px', color: t.text.primary, letterSpacing: '-0.02em' } },
                    isSignup ? 'Create your account' : 'Welcome back'
                ),
                React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 14.5, color: t.text.secondary, margin: 0 } },
                    isSignup ? 'Save opportunities, track applications, never miss a deadline.' : 'Log in to your circle.'
                )
            ),
            React.createElement('div', { style: { background: t.bg.card, border: `1px solid ${t.border.base}`, borderRadius: 18, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 } },
                isSignup ? React.createElement(Input, { theme: s.theme, label: 'Full name', value: name, onChange: setName, placeholder: 'Aisha Khan', icon: 'user' }) : null,
                React.createElement(Input, { theme: s.theme, label: 'Email', value: email, onChange: setEmail, placeholder: 'you@email.com', icon: 'mail', type: 'email' }),
                React.createElement(Input, {
                    theme: s.theme, label: 'Password', value: pw, onChange: setPw,
                    placeholder: 'At least 6 characters', icon: 'lock',
                    type: showPw ? 'text' : 'password',
                    rightSlot: React.createElement('button', {
                        onClick: () => setShowPw(v => !v),
                        style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, padding: 0 }
                    }, React.createElement(Icon, { name: showPw ? 'eyeOff' : 'eye', size: 17 }))
                }),
                !isSignup ? React.createElement('div', { style: { textAlign: 'right', marginTop: -6 } },
                    React.createElement('button', { onClick: () => s.go('reset'), style: { background: 'none', border: 'none', cursor: 'pointer', color: OC.orange, fontFamily: FONT.body, fontSize: 13, fontWeight: 600 } }, 'Forgot password?')
                ) : null,
                React.createElement(Button, { kind: 'primary', size: 'lg', theme: s.theme, fullWidth: true, onClick: submit, style: { opacity: valid ? 1 : 0.5, marginTop: 4 } },
                    isSignup ? 'Create account' : 'Log in'
                )
            ),
            React.createElement('div', { style: { textAlign: 'center', marginTop: 22, fontFamily: FONT.body, fontSize: 14, color: t.text.secondary } },
                isSignup ? 'Already have an account? ' : "Don't have an account? ",
                React.createElement('button', {
                    onClick: () => switchMode(isSignup ? 'login' : 'signup'),
                    style: { background: 'none', border: 'none', cursor: 'pointer', color: OC.orange, fontWeight: 700, fontFamily: FONT.body, fontSize: 14 }
                }, isSignup ? 'Log in' : 'Sign up free')
            )
        )
    );
}

// --- SearchScreen ---
function SearchScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const results = OPPORTUNITIES.filter(o => matchQuery(o, s.query));
    const suggestions = ['Remote', 'Scholarship', 'Internship', 'Design', 'Fully funded'];

    return React.createElement('div', { style: { maxWidth: 920, margin: '0 auto', padding: '0 32px', width: '100%' } },
        React.createElement('div', { style: { padding: '48px 0 80px' } },
            React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 30, margin: '0 0 20px', color: t.text.primary, letterSpacing: '-0.02em' } },
                'Search opportunities'
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11, background: t.bg.card, border: `1.5px solid ${t.border.strong}`, borderRadius: 13, padding: '0 16px', height: 56 } },
                React.createElement(Icon, { name: 'search', size: 20, color: t.text.secondary }),
                React.createElement('input', {
                    autoFocus: true,
                    value: s.query,
                    onChange: e => s.setQuery(e.target.value),
                    placeholder: 'Try "remote design", "fully funded", "Stripe"…',
                    style: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.body, fontSize: 16, color: t.text.primary }
                }),
                s.query ? React.createElement('button', { onClick: () => s.setQuery(''), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, padding: 8 } },
                    React.createElement(Icon, { name: 'x', size: 16 })
                ) : null
            ),
            !s.query ? React.createElement('div', { style: { marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                React.createElement('span', { style: { fontFamily: FONT.body, fontSize: 13, color: t.text.secondary } }, 'Try:'),
                suggestions.map(sug =>
                    React.createElement('button', {
                        key: sug, onClick: () => s.setQuery(sug),
                        style: { border: `1px solid ${t.border.base}`, background: t.bg.card, color: t.text.primary, borderRadius: 999, padding: '7px 13px', cursor: 'pointer', fontFamily: FONT.body, fontSize: 13, fontWeight: 500 }
                    }, sug)
                )
            ) : React.createElement('div', { style: { marginTop: 24 } },
                React.createElement('div', { style: { fontFamily: FONT.body, fontSize: 14, color: t.text.secondary, marginBottom: 16 } },
                    React.createElement('strong', { style: { color: t.text.primary } }, results.length),
                    ' ', results.length === 1 ? 'result' : 'results', ' for "', s.query, '"'
                ),
                results.length ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 } },
                    results.map(op => React.createElement(OpportunityCard, { key: op.id, op: op }))
                ) : React.createElement('div', { style: { textAlign: 'center', padding: '64px 24px' } },
                    React.createElement('h3', null, 'No results'),
                    React.createElement('p', null, 'Nothing matches "', s.query, '". Try a broader term.'),
                    React.createElement('button', { onClick: () => s.setQuery(''), style: { background: 'none', border: 'none', cursor: 'pointer', color: OC.orange, fontWeight: 600 } }, 'Clear search')
                )
            )
        )
    );
}

// --- SavedScreen ---
function SavedScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [cat, setCat] = useState('all');
    const savedOps = s.saved.map(id => OPPORTUNITIES.find(o => o.id === id)).filter(Boolean);
    const closing = savedOps.filter(o => o.daysLeft <= 7);
    const cats = [...new Set(savedOps.map(o => o.category))];
    const filtered = cat === 'all' ? savedOps : cat === 'closing' ? closing : savedOps.filter(o => o.category === cat);
    const tabs = [
        ['all', 'All', savedOps.length],
        ...(closing.length ? [['closing', 'Closing soon', closing.length]] : []),
        ...cats.map(c => [c, CATEGORY[c].label, savedOps.filter(o => o.category === c).length])
    ];

    return React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '0 32px', width: '100%' } },
        React.createElement('div', { style: { padding: '40px 0 80px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 22 } },
                React.createElement('div', null,
                    React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 34, margin: 0, color: t.text.primary, letterSpacing: '-0.025em' } },
                        'Saved opportunities'
                    ),
                    React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 15, color: t.text.secondary, margin: '6px 0 0' } },
                        React.createElement('strong', { style: { color: t.text.primary } }, savedOps.length),
                        ' saved',
                        closing.length ? React.createElement(React.Fragment, null, ' · ', React.createElement('span', { style: { color: OC.urgent, fontWeight: 600 } }, closing.length, ' closing this week')) : null
                    )
                ),
                React.createElement(Button, { kind: 'secondary', size: 'md', theme: s.theme, onClick: () => s.go('feed'), icon: React.createElement(Icon, { name: 'plus', size: 15 }) }, 'Browse more')
            ),
            savedOps.length ? [
                React.createElement('div', { key: 'tabs', style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 } },
                    tabs.map(([k, label, n]) => {
                        const active = cat === k;
                        return React.createElement('button', {
                            key: k, onClick: () => setCat(k),
                            style: {
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                border: `1px solid ${active ? OC.orange : t.border.base}`,
                                background: active ? OC.orange : t.bg.card,
                                color: active ? '#fff' : t.text.secondary,
                                borderRadius: 999, padding: '9px 15px',
                                cursor: 'pointer', fontFamily: FONT.body,
                                fontWeight: 600, fontSize: 13.5,
                            }
                        }, label,
                            React.createElement('span', {
                                style: {
                                    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
                                    background: active ? 'rgba(255,255,255,.25)' : t.bg.subtle,
                                    color: active ? '#fff' : t.text.secondary,
                                    fontSize: 11, fontWeight: 700,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }
                            }, n)
                        );
                    })
                ),
                React.createElement('div', { key: 'cards', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } },
                    filtered.map(op => React.createElement(OpportunityCard, { key: op.id, op: op }))
                )
            ] : React.createElement('div', { style: { textAlign: 'center', padding: '64px 24px', border: `1px dashed ${t.border.strong}`, borderRadius: 18, background: t.bg.card } },
                React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 19, color: t.text.primary, margin: '0 0 6px' } },
                    'No saved opportunities yet'
                ),
                React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 14.5, color: t.text.secondary, margin: '0 0 20px' } },
                    'Bookmark any opportunity to keep it here and get deadline reminders.'
                ),
                React.createElement(Button, { kind: 'primary', size: 'md', theme: s.theme, onClick: () => s.go('feed') }, 'Browse opportunities')
            )
        )
    );
}

// --- EMPLOYER_STATUS_META ---
const EMPLOYER_STATUS_META = {
    pending: { label: 'Pending review', color: OC.warning },
    live: { label: 'Live', color: OC.success },
    closed: { label: 'Closed', color: OC.neutral },
};

// --- EmployerJobRow ---
function EmployerJobRow({ job }) {
    const s = useStore();
    const t = useTheme(s.theme);
    const [menuOpen, setMenuOpen] = useState(false);
    const cat = CATEGORY[job.category] || CATEGORY.jobs;
    const meta = EMPLOYER_STATUS_META[job.status] || EMPLOYER_STATUS_META.pending;

    const nextStatus = {
        pending: 'live',
        live: 'closed',
        closed: 'live',
    };
    const nextLabel = {
        pending: 'Mark as live',
        live: 'Close listing',
        closed: 'Reopen listing',
    };

    return React.createElement(Card, { theme: s.theme, padding: 20 },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' } },
            React.createElement('div', { style: { display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 0, flex: 1 } },
                React.createElement(CategoryIcon, { category: job.category, size: 38, theme: s.theme }),
                React.createElement('div', { style: { minWidth: 0 } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' } },
                        React.createElement(Badge, { color: meta.color, theme: s.theme }, meta.label),
                        React.createElement(Badge, { color: cat.color, theme: s.theme }, cat.label),
                        React.createElement('span', { style: { fontSize: 12, color: t.text.secondary } }, job.postedAt)
                    ),
                    React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary } }, job.title),
                    React.createElement('div', { style: { fontSize: 13, color: t.text.secondary, marginTop: 2 } }, job.org, ' · ', job.location)
                )
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, position: 'relative' } },
                React.createElement('div', { style: { textAlign: 'right', marginRight: 4 } },
                    React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: t.text.primary } }, job.applicants || 0),
                    React.createElement('div', { style: { fontSize: 11.5, color: t.text.secondary } }, 'applicants')
                ),
                React.createElement(Button, {
                    kind: 'secondary', size: 'sm', theme: s.theme,
                    onClick: () => s.updateEmployerJob(job.id, { status: nextStatus[job.status] || 'live' })
                }, nextLabel[job.status] || 'Mark as live'),
                React.createElement('div', { style: { position: 'relative' } },
                    React.createElement('button', {
                        onClick: () => setMenuOpen(o => !o),
                        style: iconBtn(t)
                    }, React.createElement(Icon, { name: 'menu', size: 15 })),
                    menuOpen ? [
                        React.createElement('div', { key: 'ov', onClick: () => setMenuOpen(false), style: { position: 'fixed', inset: 0, zIndex: 50 } }),
                        React.createElement('div', {
                            key: 'menu',
                            style: { position: 'absolute', top: 38, right: 0, width: 160, zIndex: 60, background: t.bg.page, border: `1px solid ${t.border.base}`, borderRadius: 12, boxShadow: t.shadow.lg, overflow: 'hidden', padding: 5 }
                        },
                            React.createElement('button', {
                                onClick: () => { setMenuOpen(false); s.removeEmployerJob(job.id); s.showToast('Listing removed', 'x'); },
                                style: { width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, textAlign: 'left', fontFamily: FONT.body, fontSize: 13, fontWeight: 500, color: OC.urgent }
                            }, React.createElement(Icon, { name: 'x', size: 14, color: OC.urgent }), 'Delete')
                        )
                    ] : null
                )
            )
        )
    );
}
// ========================================
// ADD THIS AFTER EMPLOYER_STATUS_META
// ========================================

// --- COMPANY PROFILE DATA ---
const COMPANY_INDUSTRIES = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
    'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Transportation',
    'Hospitality', 'Retail', 'Energy', 'Telecommunications', 'Agriculture'
];

const COMPANY_SIZES = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

const VERIFICATION_STATUS = {
    pending: { label: 'Pending Review', color: OC.warning, icon: 'clock' },
    verified: { label: 'Verified', color: OC.success, icon: 'check' },
    rejected: { label: 'Rejected', color: OC.urgent, icon: 'x' },
    featured: { label: '⭐ Featured', color: OC.orange, icon: 'sparkle' }
};

// --- CompanyProfileScreen ---
function CompanyProfileScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [profile, setProfile] = useState({
        companyName: '',
        logo: null,
        industry: '',
        companySize: '',
        headquarters: '',
        foundedYear: '',
        website: '',
        email: '',
        phone: '',
        about: '',
        mission: '',
        culture: '',
        benefits: [],
        socialLinkedin: '',
        socialTwitter: '',
        socialFacebook: '',
        verificationStatus: 'pending',
        starRating: 0,
        reviewCount: 0,
        submitted: false
    });
    const [benefitInput, setBenefitInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load saved profile from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('oc-company-profile');
        if (saved) {
            try {
                setProfile(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    // Save profile to localStorage
    const saveProfile = (updates) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem('oc-company-profile', JSON.stringify(newProfile));
    };

    const setField = (key, val) => saveProfile({ [key]: val });

    const addBenefit = () => {
        if (benefitInput.trim() && !profile.benefits.includes(benefitInput.trim())) {
            setProfile(p => ({
                ...p,
                benefits: [...p.benefits, benefitInput.trim()]
            }));
            setBenefitInput('');
        }
    };
    const removeBenefit = (benefit) => {
        setProfile(p => ({
            ...p,
            benefits: p.benefits.filter(b => b !== benefit)
        }));
    };

    const submitForReview = () => {
        // Validate required fields
        const required = ['companyName', 'industry', 'companySize', 'headquarters', 'email', 'about'];
        const missing = required.filter(f => !profile[f] || profile[f].trim() === '');
        
        if (missing.length) {
            s.showToast(`Please fill in: ${missing.join(', ')}`, 'x');
            return;
        }

        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setProfile(p => ({
                ...p,
                verificationStatus: 'pending',
                submitted: true
            }));
            localStorage.setItem('oc-company-profile', JSON.stringify(profile));
            s.showToast('Company profile submitted for review!', 'check');
            setIsSubmitting(false);
        }, 1500);
    };

    // Star Rating Display
    const StarRating = ({ rating, count }) => {
        return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('div', { style: { display: 'flex', gap: 3 } },
                [1, 2, 3, 4, 5].map(star =>
                    React.createElement('span', {
                        key: star,
                        style: {
                            fontSize: 22,
                            color: star <= Math.round(rating) ? '#F59E0B' : (s.theme === 'dark' ? '#3F3F46' : '#E5E7EB'),
                            cursor: 'default'
                        }
                    }, '⭐')
                )
            ),
            React.createElement('span', { style: { fontSize: 13, color: t.text.secondary } },
                `(${count || 0} reviews)`
            )
        );
    };

    const isComplete = profile.companyName && profile.industry && profile.companySize && 
                       profile.headquarters && profile.email && profile.about;

    const verifMeta = VERIFICATION_STATUS[profile.verificationStatus] || VERIFICATION_STATUS.pending;

    return React.createElement('div', { style: { maxWidth: 920, margin: '0 auto', padding: '0 32px', width: '100%' } },
        React.createElement('div', { style: { padding: '40px 0 80px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: t.text.secondary, marginBottom: 12 } },
                React.createElement('button', { onClick: () => s.go('employers'), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, fontSize: 12.5, padding: 0 } }, 'Employer dashboard'),
                React.createElement(Icon, { name: 'chevRight', size: 12 }),
                React.createElement('span', { style: { color: t.text.primary, fontWeight: 600 } }, 'Company Profile')
            ),
            
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 24 } },
                React.createElement('div', null,
                    React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 30, margin: 0, color: t.text.primary, letterSpacing: '-0.02em' } }, 'Company Profile'),
                    React.createElement('p', { style: { fontFamily: FONT.body, fontSize: 14.5, color: t.text.secondary, margin: '6px 0 0' } }, 
                        'Complete your profile to get verified and start receiving applications.'
                    )
                ),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
                    React.createElement(Badge, { color: verifMeta.color, theme: s.theme, icon: React.createElement(Icon, { name: verifMeta.icon, size: 12 }) }, verifMeta.label),
                    profile.starRating > 0 ? React.createElement(StarRating, { rating: profile.starRating, count: profile.reviewCount }) : null
                )
            ),

            // Status Banner
            profile.submitted && profile.verificationStatus === 'pending' ? 
                React.createElement('div', {
                    style: {
                        background: s.theme === 'dark' ? 'rgba(245,158,11,.12)' : '#FEF3C7',
                        border: `1px solid ${OC.warning}`,
                        borderRadius: 12, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 24
                    }
                },
                    React.createElement(Icon, { name: 'clock', size: 20, color: OC.warning }),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontWeight: 600, color: t.text.primary } }, 'Profile Under Review'),
                        React.createElement('div', { style: { fontSize: 13, color: t.text.secondary } }, 
                            'Our team is reviewing your company profile. This usually takes 1-2 business days.'
                        )
                    )
                ) : null,

            profile.verificationStatus === 'verified' ?
                React.createElement('div', {
                    style: {
                        background: s.theme === 'dark' ? 'rgba(34,197,94,.12)' : '#D1FAE5',
                        border: `1px solid ${OC.success}`,
                        borderRadius: 12, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 24
                    }
                },
                    React.createElement(Icon, { name: 'check', size: 20, color: OC.success }),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontWeight: 600, color: t.text.primary } }, 'Profile Verified'),
                        React.createElement('div', { style: { fontSize: 13, color: t.text.secondary } }, 
                            'Your company is verified. You can now post jobs and manage applicants.'
                        )
                    )
                ) : null,

            // Profile Form
            React.createElement(Card, { theme: s.theme, padding: 28 },
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 } },
                    // Company Name
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Name *',
                            value: profile.companyName,
                            onChange: v => setField('companyName', v),
                            placeholder: 'e.g. Google, Microsoft, etc.',
                            icon: 'building'
                        })
                    ),
                    
                    // Logo Upload
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Company Logo'),
                        React.createElement('div', {
                            style: {
                                border: `2px dashed ${t.border.base}`,
                                borderRadius: 12, padding: '32px 20px',
                                textAlign: 'center', cursor: 'pointer',
                                transition: 'border-color .2s ease',
                            },
                            onMouseEnter: e => e.currentTarget.style.borderColor = OC.orange,
                            onMouseLeave: e => e.currentTarget.style.borderColor = t.border.base,
                        },
                            profile.logo ? 
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontSize: 48, marginBottom: 8 } }, '🏢'),
                                    React.createElement('div', { style: { fontSize: 13, color: t.text.secondary } }, 'Logo uploaded')
                                ) :
                                React.createElement('div', null,
                                    React.createElement(Icon, { name: 'plus', size: 32, color: t.text.secondary }),
                                    React.createElement('div', { style: { fontSize: 13, color: t.text.secondary, marginTop: 8 } }, 'Click to upload logo')
                                )
                        )
                    ),

                    // Industry
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Industry *'),
                        React.createElement('select', {
                            value: profile.industry,
                            onChange: e => setField('industry', e.target.value),
                            style: {
                                width: '100%', height: 44, padding: '0 13px', borderRadius: 10,
                                background: t.bg.page, border: `1.5px solid ${t.border.base}`,
                                fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary,
                                outline: 'none', cursor: 'pointer'
                            }
                        },
                            React.createElement('option', { value: '' }, 'Select industry...'),
                            COMPANY_INDUSTRIES.map(ind =>
                                React.createElement('option', { key: ind, value: ind }, ind)
                            )
                        )
                    ),

                    // Company Size
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Company Size *'),
                        React.createElement('select', {
                            value: profile.companySize,
                            onChange: e => setField('companySize', e.target.value),
                            style: {
                                width: '100%', height: 44, padding: '0 13px', borderRadius: 10,
                                background: t.bg.page, border: `1.5px solid ${t.border.base}`,
                                fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary,
                                outline: 'none', cursor: 'pointer'
                            }
                        },
                            React.createElement('option', { value: '' }, 'Select size...'),
                            COMPANY_SIZES.map(size =>
                                React.createElement('option', { key: size, value: size }, size, ' employees')
                            )
                        )
                    ),

                    // Headquarters
                    React.createElement('div', null,
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Headquarters *',
                            value: profile.headquarters,
                            onChange: v => setField('headquarters', v),
                            placeholder: 'City, Country',
                            icon: 'mapPin'
                        })
                    ),

                    // Founded Year
                    React.createElement('div', null,
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Founded Year',
                            value: profile.foundedYear,
                            onChange: v => setField('foundedYear', v),
                            placeholder: 'e.g. 2010',
                            type: 'number',
                            icon: 'clock'
                        })
                    ),

                    // Website
                    React.createElement('div', null,
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Website',
                            value: profile.website,
                            onChange: v => setField('website', v),
                            placeholder: 'https://example.com',
                            icon: 'globe'
                        })
                    ),

                    // Email
                    React.createElement('div', null,
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Email *',
                            value: profile.email,
                            onChange: v => setField('email', v),
                            placeholder: 'hr@company.com',
                            type: 'email',
                            icon: 'mail'
                        })
                    ),

                    // Phone
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Phone Number',
                            value: profile.phone,
                            onChange: v => setField('phone', v),
                            placeholder: '+92 300 1234567',
                            icon: 'phone'
                        })
                    ),

                    // About
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'About Company *',
                            value: profile.about,
                            onChange: v => setField('about', v),
                            as: 'textarea',
                            rows: 4,
                            placeholder: 'Tell applicants about your company...'
                        })
                    ),

                    // Mission
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Mission Statement',
                            value: profile.mission,
                            onChange: v => setField('mission', v),
                            as: 'textarea',
                            rows: 3,
                            placeholder: 'What is your company\'s mission?'
                        })
                    ),

                    // Culture
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Culture',
                            value: profile.culture,
                            onChange: v => setField('culture', v),
                            as: 'textarea',
                            rows: 3,
                            placeholder: 'Describe your work culture...'
                        })
                    ),

                    // Benefits
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Benefits & Perks'),
                        React.createElement('div', { style: { display: 'flex', gap: 10 } },
                            React.createElement('input', {
                                value: benefitInput,
                                onChange: e => setBenefitInput(e.target.value),
                                placeholder: 'e.g. Health Insurance',
                                onKeyPress: e => e.key === 'Enter' && addBenefit(),
                                style: {
                                    flex: 1, height: 44, padding: '0 13px', borderRadius: 10,
                                    background: t.bg.page, border: `1.5px solid ${t.border.base}`,
                                    fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary,
                                    outline: 'none'
                                }
                            }),
                            React.createElement(Button, { kind: 'secondary', size: 'md', theme: s.theme, onClick: addBenefit }, 'Add')
                        ),
                        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 } },
                            profile.benefits.map(b =>
                                React.createElement('span', {
                                    key: b,
                                    style: {
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 8,
                                        background: s.theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted,
                                        border: `1px solid ${OC.orangeSubtle}`,
                                        color: OC.orange, fontSize: 13, fontWeight: 500
                                    }
                                },
                                    b,
                                    React.createElement('button', {
                                        onClick: () => removeBenefit(b),
                                        style: { background: 'none', border: 'none', cursor: 'pointer', color: OC.orange, padding: 0 }
                                    }, React.createElement(Icon, { name: 'x', size: 12 }))
                                )
                            )
                        )
                    ),

                    // Social Links
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Social Media Links'),
                        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 } },
                            React.createElement(Input, {
                                theme: s.theme,
                                label: 'LinkedIn',
                                value: profile.socialLinkedin,
                                onChange: v => setField('socialLinkedin', v),
                                placeholder: 'linkedin.com/company/...'
                            }),
                            React.createElement(Input, {
                                theme: s.theme,
                                label: 'Twitter/X',
                                value: profile.socialTwitter,
                                onChange: v => setField('socialTwitter', v),
                                placeholder: 'twitter.com/company'
                            }),
                            React.createElement(Input, {
                                theme: s.theme,
                                label: 'Facebook',
                                value: profile.socialFacebook,
                                onChange: v => setField('socialFacebook', v),
                                placeholder: 'facebook.com/company'
                            })
                        )
                    )
                ),

                // Submit Button
                React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.border.base}` } },
                    React.createElement(Button, {
                        kind: 'ghost', size: 'lg', theme: s.theme,
                        onClick: () => s.go('employers'),
                        style: { flex: 1 }
                    }, 'Back to Dashboard'),
                    React.createElement(Button, {
                        kind: 'primary', size: 'lg', theme: s.theme,
                        onClick: submitForReview,
                        style: {
                            flex: 2,
                            opacity: isComplete && !isSubmitting ? 1 : 0.5,
                            cursor: isComplete && !isSubmitting ? 'pointer' : 'not-allowed',
                            pointerEvents: isComplete && !isSubmitting ? 'auto' : 'none'
                        },
                        icon: isSubmitting ? React.createElement(Icon, { name: 'clock', size: 16 }) : null
                    }, isSubmitting ? 'Submitting...' : 'Submit for Review')
                )
            )
        )
    );
}
function EmployersScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [activeTab, setActiveTab] = useState('dashboard');
 useEffect(() => {
        // Check if route has tab parameter
        if (s.route && s.route.tab) {
            const tab = s.route.tab;
            if (tab === 'profile') {
                setActiveTab('profile');
            } else if (tab === 'analytics') {
                setActiveTab('analytics');
            } else if (tab === 'applicants') {
                setActiveTab('applicants');
            } else if (tab === 'dashboard') {
                setActiveTab('dashboard');
            }
        }
    }, [s.route]); // 👈 s.route change hone par trigger ho
    const jobs = s.employerJobs;

    // Stats for 6 cards
    const stats = [
        { label: 'Total Jobs', value: jobs.filter(j => j.category === 'jobs').length, icon: 'briefcase', color: '#3B82F6' },
        { label: 'Internships', value: jobs.filter(j => j.category === 'internships').length, icon: 'cap', color: '#8B5CF6' },
        { label: 'Admissions', value: jobs.filter(j => j.category === 'admissions').length, icon: 'building', color: '#14B8A6' },
        { label: 'Scholarships', value: jobs.filter(j => j.category === 'scholarships').length, icon: 'award', color: '#22C55E' },
        { label: 'Events', value: jobs.filter(j => j.category === 'events').length, icon: 'spark', color: '#F97316' },
        { label: 'Active Posts', value: jobs.filter(j => j.status === 'live').length, icon: 'check', color: '#22C55E' },
    ];

    // Sample applicants data
    const applicants = [
        { id: 1, name: 'Ali Ahmed', email: 'ali@gmail.com', appliedFor: 'Frontend Developer', date: 'Jul 27', cv: true, status: 'pending' },
        { id: 2, name: 'Sara Khan', email: 'sara@gmail.com', appliedFor: 'UI/UX Designer', date: 'Jul 26', cv: true, status: 'reviewed' },
        { id: 3, name: 'Usman Raza', email: 'usman@gmail.com', appliedFor: 'Backend Engineer', date: 'Jul 25', cv: false, status: 'shortlisted' },
        { id: 4, name: 'Fatima Ali', email: 'fatima@gmail.com', appliedFor: 'Data Analyst', date: 'Jul 24', cv: true, status: 'interview' },
        { id: 5, name: 'Hassan Shah', email: 'hassan@gmail.com', appliedFor: 'Product Manager', date: 'Jul 23', cv: true, status: 'hired' },
    ];

    const statusColors = {
        pending: OC.warning,
        reviewed: '#3B82F6',
        shortlisted: '#8B5CF6',
        interview: '#F59E0B',
        hired: '#22C55E',
        rejected: '#6B7280'
    };
    const statusLabels = {
        pending: 'Pending',
        reviewed: 'Reviewed',
        shortlisted: 'Shortlisted',
        interview: 'Interview Scheduled',
        hired: 'Hired',
        rejected: 'Rejected'
    };

    // 👇 SIDEBAR ITEMS
    const sidebarItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
        { key: 'analytics', label: 'Analytics', icon: 'chart' },
        { key: 'applicants', label: 'Applicants', icon: 'user' },
        { key: 'profile', label: 'Company Profile', icon: 'building' },
    ];

    // ========================================
    // Hook: measure a container's real pixel width
    // ========================================
    const useMeasuredWidth = () => {
        const ref = useRef(null);
        const [width, setWidth] = useState(600);
        useEffect(() => {
            if (!ref.current) return;
            const el = ref.current;
            const ro = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const w = entry.contentRect.width;
                    if (w > 0) setWidth(w);
                }
            });
            ro.observe(el);
            setWidth(el.getBoundingClientRect().width || 600);
            return () => ro.disconnect();
        }, []);
        return [ref, width];
    };

    // ========================================
    // PROFESSIONAL LINE GRAPH — pixel-based coords
    // ========================================
    const LineGraph = ({ data, labels, color, height = 220, label, subtitle, valuePrefix = '', valueSuffix = '' }) => {
        const [containerRef, width] = useMeasuredWidth();

        const maxVal = Math.max(...data);
        const minVal = 0;
        const range = maxVal - minVal || 1;
        const padding = { top: 25, bottom: 20, left: 44, right: 20 };

        const graphWidth = Math.max(width - padding.left - padding.right, 1);
        const graphHeight = Math.max(height - padding.top - padding.bottom, 1);

        const xAt = i => padding.left + (i / (data.length - 1)) * graphWidth;
        const yAt = val => padding.top + graphHeight - ((val - minVal) / range) * graphHeight;

        const points = data.map((val, i) => `${xAt(i)},${yAt(val)}`).join(' ');

        // Y-axis labels
        const yLabels = [];
        const step = range / 5;
        for (let i = 0; i <= 5; i++) {
            yLabels.push(Math.round(minVal + step * i));
        }

        const gradId = `area-grad-${color.replace('#', '')}`;

        return React.createElement('div', { style: { width: '100%' } },
            // Header
            React.createElement('div', { style: {
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 16, alignItems: 'flex-start'
            } },
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: 16, fontWeight: 700, color: t.text.primary } }, label),
                    subtitle ? React.createElement('div', { style: { fontSize: 13, color: t.text.secondary, marginTop: 2 } }, subtitle) : null
                ),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 16 } },
                    React.createElement('div', { style: { textAlign: 'right' } },
                        React.createElement('div', { style: { fontSize: 20, fontWeight: 800, color: t.text.primary } },
                            valuePrefix + data.reduce((a, b) => a + b, 0) + valueSuffix
                        ),
                        React.createElement('div', { style: { fontSize: 11, color: t.text.secondary } }, 'Total')
                    ),
                    React.createElement('div', { style: {
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: data[data.length - 1] > data[0] ? (s.theme === 'dark' ? 'rgba(34,197,94,.15)' : '#D1FAE5') : (s.theme === 'dark' ? 'rgba(239,68,68,.15)' : '#FEE2E2'),
                        fontSize: 13,
                        fontWeight: 700,
                        color: data[data.length - 1] > data[0] ? OC.success : OC.urgent
                    } },
                        `${((data[data.length - 1] - data[0]) / (data[0] || 1) * 100).toFixed(1)}%`
                    )
                )
            ),

            // Graph
            React.createElement('div', { ref: containerRef, style: { position: 'relative', height, width: '100%' } },
                React.createElement('svg', {
                    width: '100%',
                    height: height,
                    viewBox: `0 0 ${width} ${height}`,
                    style: { display: 'block' }
                },
                    // Grid lines + Y-axis numbers
                    [0, 1, 2, 3, 4, 5].map(idx => {
                        const yPos = padding.top + (idx / 5) * graphHeight;
                        const yVal = yLabels[5 - idx];
                        return React.createElement('g', { key: idx },
                            React.createElement('line', {
                                x1: padding.left,
                                y1: yPos,
                                x2: width - padding.right,
                                y2: yPos,
                                stroke: t.border.base,
                                strokeWidth: 1,
                                strokeDasharray: '4,4'
                            }),
                            React.createElement('text', {
                                x: padding.left - 10,
                                y: yPos + 4,
                                textAnchor: 'end',
                                fontSize: 10,
                                fill: t.text.secondary,
                                fontFamily: FONT.mono,
                                fontWeight: 500
                            }, yVal)
                        );
                    }),

                    // Area under line
                    React.createElement('defs', null,
                        React.createElement('linearGradient', {
                            id: gradId,
                            x1: '0', y1: '0', x2: '0', y2: '1'
                        },
                            React.createElement('stop', { offset: '0%', stopColor: color, stopOpacity: 0.2 }),
                            React.createElement('stop', { offset: '100%', stopColor: color, stopOpacity: 0.02 })
                        )
                    ),
                    React.createElement('polygon', {
                        points: `${padding.left},${padding.top + graphHeight} ${points} ${width - padding.right},${padding.top + graphHeight}`,
                        fill: `url(#${gradId})`,
                        stroke: 'none'
                    }),

                    // Main line
                    React.createElement('polyline', {
                        points: points,
                        fill: 'none',
                        stroke: color,
                        strokeWidth: 3,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }),

                    // Data points + value labels
                    data.map((val, i) => {
                        const x = xAt(i);
                        const y = yAt(val);
                        return React.createElement('g', { key: i },
                            React.createElement('circle', { cx: x, cy: y, r: 9, fill: color, opacity: 0.08 }),
                            React.createElement('circle', { cx: x, cy: y, r: 4.5, fill: color, stroke: t.bg.page, strokeWidth: 2 }),
                            React.createElement('text', {
                                x: x,
                                y: y - 14,
                                textAnchor: 'middle',
                                fontSize: 10,
                                fill: t.text.secondary,
                                fontFamily: FONT.mono,
                                fontWeight: 600,
                                opacity: 0.9
                            }, val)
                        );
                    })
                )
            ),

            // X-axis labels
            React.createElement('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 8, padding: `0 ${padding.right}px 0 ${padding.left}px`
                }
            },
                labels.map((lbl, i) =>
                    React.createElement('span', {
                        key: i,
                        style: { fontSize: 11, color: t.text.secondary, fontWeight: 500 }
                    }, lbl)
                )
            )
        );
    };

    // ========================================
    // MULTI-LINE GRAPH (Category-wise)
    // ========================================
    const MultiLineGraph = ({ data, labels, colors, height = 260, label }) => {
        const [containerRef, width] = useMeasuredWidth();

        const allValues = Object.values(data).flat();
        const maxVal = Math.max(...allValues);
        const minVal = 0;
        const range = maxVal - minVal || 1;
        const padding = { top: 25, bottom: 20, left: 44, right: 20 };

        const graphWidth = Math.max(width - padding.left - padding.right, 1);
        const graphHeight = Math.max(height - padding.top - padding.bottom, 1);

        const yLabels = [];
        const step = range / 5;
        for (let i = 0; i <= 5; i++) {
            yLabels.push(Math.round(minVal + step * i));
        }

        const categoryLabels = {
            jobs: 'Jobs',
            internships: 'Internships',
            scholarships: 'Scholarships',
            admissions: 'Admissions',
            events: 'Events'
        };

        const xAt = (i, len) => padding.left + (i / (len - 1)) * graphWidth;
        const yAt = val => padding.top + graphHeight - ((val - minVal) / range) * graphHeight;

        const datasets = Object.keys(data).map(key => {
            const series = data[key];
            const points = series.map((val, i) => `${xAt(i, series.length)},${yAt(val)}`).join(' ');
            return { key, points, color: colors[key], label: categoryLabels[key] };
        });

        return React.createElement('div', { style: { width: '100%' } },
            // Header
            React.createElement('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 16, alignItems: 'center'
                }
            },
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: 16, fontWeight: 700, color: t.text.primary } }, label),
                    React.createElement('div', { style: { fontSize: 13, color: t.text.secondary, marginTop: 2 } }, 'Category-wise trend over time')
                ),
                React.createElement('div', { style: { display: 'flex', gap: 14, flexWrap: 'wrap' } },
                    datasets.map(ds =>
                        React.createElement('span', {
                            key: ds.key,
                            style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.text.secondary, fontWeight: 500 }
                        },
                            React.createElement('span', {
                                style: { display: 'inline-block', width: 16, height: 3, borderRadius: 2, background: ds.color }
                            }),
                            ds.label
                        )
                    )
                )
            ),

            // Graph
            React.createElement('div', { ref: containerRef, style: { position: 'relative', height, width: '100%' } },
                React.createElement('svg', {
                    width: '100%',
                    height: height,
                    viewBox: `0 0 ${width} ${height}`,
                    style: { display: 'block' }
                },
                    // Grid lines
                    [0, 1, 2, 3, 4, 5].map(idx => {
                        const yPos = padding.top + (idx / 5) * graphHeight;
                        const yVal = yLabels[5 - idx];
                        return React.createElement('g', { key: idx },
                            React.createElement('line', {
                                x1: padding.left,
                                y1: yPos,
                                x2: width - padding.right,
                                y2: yPos,
                                stroke: t.border.base,
                                strokeWidth: 1,
                                strokeDasharray: '4,4'
                            }),
                            React.createElement('text', {
                                x: padding.left - 10,
                                y: yPos + 4,
                                textAnchor: 'end',
                                fontSize: 10,
                                fill: t.text.secondary,
                                fontFamily: FONT.mono,
                                fontWeight: 500
                            }, yVal)
                        );
                    }),

                    // Lines for each category
                    datasets.map(ds =>
                        React.createElement('polyline', {
                            key: ds.key,
                            points: ds.points,
                            fill: 'none',
                            stroke: ds.color,
                            strokeWidth: 2.5,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                        })
                    ),

                    // Data points
                    datasets.map(ds =>
                        data[ds.key].map((val, i) => {
                            const x = xAt(i, data[ds.key].length);
                            const y = yAt(val);
                            return React.createElement('circle', {
                                key: `${ds.key}-${i}`,
                                cx: x,
                                cy: y,
                                r: 3.5,
                                fill: ds.color,
                                stroke: t.bg.page,
                                strokeWidth: 1.5
                            });
                        })
                    )
                )
            ),

            // X-axis labels
            React.createElement('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 8, padding: `0 ${padding.right}px 0 ${padding.left}px`
                }
            },
                labels.map((lbl, i) =>
                    React.createElement('span', {
                        key: i,
                        style: { fontSize: 11, color: t.text.secondary, fontWeight: 500 }
                    }, lbl)
                )
            )
        );
    };

    // ========================================
    // PIE CHART
    // ========================================
    const PieChart = ({ data, size = 200 }) => {
        const total = data.reduce((sum, d) => sum + d.value, 0);
        let startAngle = -90;

        return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 32 } },
            React.createElement('svg', {
                width: size, height: size,
                style: { transform: 'rotate(-90deg)' }
            },
                data.map((item, index) => {
                    const percentage = (item.value / total) * 360;
                    const endAngle = startAngle + percentage;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const x1 = size / 2 + (size / 2 - 10) * Math.cos(startRad);
                    const y1 = size / 2 + (size / 2 - 10) * Math.sin(startRad);
                    const x2 = size / 2 + (size / 2 - 10) * Math.cos(endRad);
                    const y2 = size / 2 + (size / 2 - 10) * Math.sin(endRad);
                    const largeArc = percentage > 180 ? 1 : 0;
                    const path = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${size / 2 - 10} ${size / 2 - 10} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    const result = React.createElement('path', {
                        key: index,
                        d: path,
                        fill: item.color,
                        stroke: t.bg.page,
                        strokeWidth: 2
                    });

                    startAngle = endAngle;
                    return result;
                })
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                data.map(item => {
                    const pct = ((item.value / total) * 100).toFixed(1);
                    return React.createElement('div', { key: item.label, style: { display: 'flex', alignItems: 'center', gap: 10 } },
                        React.createElement('span', {
                            style: {
                                display: 'inline-block',
                                width: 14, height: 14,
                                borderRadius: 4,
                                background: item.color
                            }
                        }),
                        React.createElement('span', { style: { fontSize: 13, color: t.text.primary, flex: 1 } }, item.label),
                        React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary } }, `${pct}%`)
                    );
                })
            )
        );
    };

    // ========================================
    // RENDER DASHBOARD
    // ========================================
    const renderDashboard = () => {
        return React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 } },
                stats.map(st =>
                    React.createElement(Card, { key: st.label, theme: s.theme, padding: 18 },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
                            React.createElement('div', {
                                style: {
                                    width: 42, height: 42, borderRadius: 10,
                                    background: s.theme === 'dark' ? `${st.color}26` : `${st.color}14`,
                                    color: st.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
                                }
                            }, React.createElement(Icon, { name: st.icon, size: 18 })),
                            React.createElement('div', null,
                                React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: t.text.primary, lineHeight: 1.1 } }, st.value),
                                React.createElement('div', { style: { fontSize: 12.5, color: t.text.secondary, marginTop: 2 } }, st.label)
                            )
                        )
                    )
                )
            ),
            React.createElement('div', { style: { textAlign: 'center', marginBottom: 24 } },
                React.createElement(Button, {
                    kind: 'primary', size: 'lg', theme: s.theme,
                    onClick: () => s.go('postJob'),
                    icon: React.createElement(Icon, { name: 'plus', size: 16 })
                }, 'Post New Opportunity')
            ),
            jobs.length > 0 ?
                React.createElement(Card, { theme: s.theme, padding: 20 },
                    React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary, marginBottom: 12 } }, 'Recent Postings'),
                    jobs.slice(0, 3).map(job =>
                        React.createElement('div', { key: job.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${t.border.base}` } },
                            React.createElement('div', null,
                                React.createElement('div', { style: { fontWeight: 600, color: t.text.primary } }, job.title),
                                React.createElement('div', { style: { fontSize: 12, color: t.text.secondary } }, job.org, ' · ', job.location)
                            ),
                            React.createElement(Badge, { color: EMPLOYER_STATUS_META[job.status]?.color || OC.neutral, theme: s.theme },
                                EMPLOYER_STATUS_META[job.status]?.label || job.status
                            )
                        )
                    )
                ) :
                React.createElement('div', { style: { textAlign: 'center', padding: '48px 24px', border: `1px dashed ${t.border.strong}`, borderRadius: 18 } },
                    React.createElement('h3', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: t.text.primary, margin: '0 0 6px' } }, 'No postings yet'),
                    React.createElement('p', { style: { fontSize: 14, color: t.text.secondary } }, 'Post your first opportunity to get started.')
                )
        );
    };

    // ========================================
    // RENDER ANALYTICS - 3 GRAPHS
    // ========================================
    const renderAnalytics = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const cvsData = [45, 62, 78, 95, 87, 110, 132, 120, 145, 168, 185, 210];
        const jobViewsData = [300, 350, 420, 480, 520, 580, 610, 650, 700, 750, 800, 850];

        const categoryData = {
            jobs: [15, 18, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45],
            internships: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
            scholarships: [5, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22, 24],
            admissions: [3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18],
            events: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]
        };

        const categoryColors = {
            jobs: '#3B82F6',
            internships: '#8B5CF6',
            scholarships: '#22C55E',
            admissions: '#14B8A6',
            events: '#F97316'
        };

        return React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } },
                React.createElement('div', null,
                    React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 22, color: t.text.primary, margin: 0 } }, 'Analytics'),
                    React.createElement('p', { style: { fontSize: 14, color: t.text.secondary, margin: '4px 0 0' } }, 'Visual insights & performance trends')
                ),
                React.createElement('span', { style: { fontSize: 13, color: t.text.secondary } }, '📅 Last 12 months')
            ),

            React.createElement(Card, { theme: s.theme, padding: 24, style: { marginBottom: 24 } },
                React.createElement(LineGraph, {
                    data: cvsData,
                    labels: months,
                    color: OC.orange,
                    height: 220,
                    label: 'Number of CVs Received',
                    subtitle: 'Internal Applications'
                })
            ),

            React.createElement(Card, { theme: s.theme, padding: 24, style: { marginBottom: 24 } },
                React.createElement(LineGraph, {
                    data: jobViewsData,
                    labels: months,
                    color: '#3B82F6',
                    height: 220,
                    label: 'Job Views',
                    subtitle: 'External views'
                })
            ),

            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 } },
                React.createElement(Card, { theme: s.theme, padding: 24 },
                    React.createElement(MultiLineGraph, {
                        data: categoryData,
                        labels: months,
                        colors: categoryColors,
                        height: 240,
                        label: 'Category-wise Distribution'
                    })
                ),
                React.createElement(Card, { theme: s.theme, padding: 24 },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary, marginBottom: 4 } }, 'Postings Distribution'),
                        React.createElement('div', { style: { fontSize: 12, color: t.text.secondary, marginBottom: 16 } }, 'By Category'),
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'center' } },
                            React.createElement(PieChart, {
                                data: [
                                    { label: 'Jobs', value: jobs.filter(j => j.category === 'jobs').length || 8, color: '#3B82F6' },
                                    { label: 'Internships', value: jobs.filter(j => j.category === 'internships').length || 5, color: '#8B5CF6' },
                                    { label: 'Scholarships', value: jobs.filter(j => j.category === 'scholarships').length || 3, color: '#22C55E' },
                                    { label: 'Admissions', value: jobs.filter(j => j.category === 'admissions').length || 2, color: '#14B8A6' },
                                    { label: 'Events', value: jobs.filter(j => j.category === 'events').length || 4, color: '#F97316' },
                                ],
                                size: 160
                            })
                        )
                    )
                )
            )
        );
    };

    // ========================================
    // RENDER APPLICANTS
    // ========================================
    const renderApplicants = () => {
        return React.createElement('div', null,
            React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 22, color: t.text.primary, marginBottom: 20 } }, 'Recent Applicants'),
            React.createElement(Card, { theme: s.theme, padding: 0, style: { overflow: 'hidden' } },
                React.createElement('div', { style: { overflowX: 'auto' } },
                    React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontFamily: FONT.body } },
                        React.createElement('thead', null,
                            React.createElement('tr', { style: { background: t.bg.subtle, borderBottom: `1px solid ${t.border.base}` } },
                                ['Name', 'Email', 'Applied For', 'Date', 'CV', 'Status'].map(h =>
                                    React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: t.text.secondary, textTransform: 'uppercase', letterSpacing: '0.04em' } }, h)
                                )
                            )
                        ),
                        React.createElement('tbody', null,
                            applicants.map(a =>
                                React.createElement('tr', { key: a.id, style: { borderBottom: `1px solid ${t.border.base}` } },
                                    React.createElement('td', { style: { padding: '12px 16px', fontWeight: 500, color: t.text.primary } }, a.name),
                                    React.createElement('td', { style: { padding: '12px 16px', color: t.text.secondary } }, a.email),
                                    React.createElement('td', { style: { padding: '12px 16px', color: t.text.primary } }, a.appliedFor),
                                    React.createElement('td', { style: { padding: '12px 16px', color: t.text.secondary } }, a.date),
                                    React.createElement('td', { style: { padding: '12px 16px' } },
                                        a.cv ?
                                            React.createElement('button', {
                                                style: { background: 'none', border: 'none', cursor: 'pointer', color: OC.orange, fontWeight: 600, fontSize: 12 }
                                            }, '👁 View CV') :
                                            React.createElement('span', { style: { color: t.text.disabled } }, '—')
                                    ),
                                    React.createElement('td', { style: { padding: '12px 16px' } },
                                        React.createElement(Badge, { color: statusColors[a.status], theme: s.theme }, statusLabels[a.status])
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    };

    // ========================================
    // COMPANY PROFILE COMPONENT (FIXED - RENDER HOGA!)
    // ========================================
    const CompanyProfileComponent = () => {
        const [companyName, setCompanyName] = useState('');
        const [industry, setIndustry] = useState('');
        const [companySize, setCompanySize] = useState('');
        const [headquarters, setHeadquarters] = useState('');
        const [website, setWebsite] = useState('');
        const [email, setEmail] = useState('');
        const [phone, setPhone] = useState('');
        const [about, setAbout] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Transportation'];
        const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

        const handleSubmit = () => {
            if (!companyName || !industry || !companySize || !headquarters || !email || !about) {
                s.showToast('Please fill in all required fields', 'x');
                return;
            }
            setIsSubmitting(true);
            setTimeout(() => {
                s.showToast('Company profile submitted for review!', 'check');
                setIsSubmitting(false);
            }, 1500);
        };

        return React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } },
                React.createElement('div', null,
                    React.createElement('h2', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 22, color: t.text.primary, margin: 0 } }, 'Company Profile'),
                    React.createElement('p', { style: { fontSize: 14, color: t.text.secondary, margin: '4px 0 0' } }, 'Complete your profile to get verified')
                ),
                React.createElement(Badge, { color: OC.warning, theme: s.theme }, '🔄 Pending Review')
            ),

            React.createElement(Card, { theme: s.theme, padding: 28 },
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 } },
                    // Company Name
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Name *',
                            value: companyName,
                            onChange: setCompanyName,
                            placeholder: 'e.g. Google, Microsoft',
                            icon: 'building'
                        })
                    ),
                    
                    // Industry
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Industry *'),
                        React.createElement('select', {
                            value: industry,
                            onChange: e => setIndustry(e.target.value),
                            style: {
                                width: '100%', height: 44, padding: '0 13px', borderRadius: 10,
                                background: t.bg.page, border: `1.5px solid ${t.border.base}`,
                                fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary,
                                outline: 'none', cursor: 'pointer'
                            }
                        },
                            React.createElement('option', { value: '' }, 'Select industry...'),
                            industries.map(ind => React.createElement('option', { key: ind, value: ind }, ind))
                        )
                    ),

                    // Company Size
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, 'Company Size *'),
                        React.createElement('select', {
                            value: companySize,
                            onChange: e => setCompanySize(e.target.value),
                            style: {
                                width: '100%', height: 44, padding: '0 13px', borderRadius: 10,
                                background: t.bg.page, border: `1.5px solid ${t.border.base}`,
                                fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary,
                                outline: 'none', cursor: 'pointer'
                            }
                        },
                            React.createElement('option', { value: '' }, 'Select size...'),
                            sizes.map(size => React.createElement('option', { key: size, value: size }, size, ' employees'))
                        )
                    ),

                    // Headquarters
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Headquarters *',
                            value: headquarters,
                            onChange: setHeadquarters,
                            placeholder: 'City, Country',
                            icon: 'mapPin'
                        })
                    ),

                    // Website
                    React.createElement('div', null,
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Website',
                            value: website,
                            onChange: setWebsite,
                            placeholder: 'https://example.com',
                            icon: 'globe'
                        })
                    ),

                    // Email
                    React.createElement('div', null,
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Company Email *',
                            value: email,
                            onChange: setEmail,
                            placeholder: 'hr@company.com',
                            type: 'email',
                            icon: 'mail'
                        })
                    ),

                    // Phone
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'Phone Number',
                            value: phone,
                            onChange: setPhone,
                            placeholder: '+92 300 1234567',
                            icon: 'phone'
                        })
                    ),

                    // About
                    React.createElement('div', { style: { gridColumn: '1 / -1' } },
                        React.createElement(Input, {
                            theme: s.theme,
                            label: 'About Company *',
                            value: about,
                            onChange: setAbout,
                            as: 'textarea',
                            rows: 4,
                            placeholder: 'Tell applicants about your company...'
                        })
                    )
                ),

                // Submit Button
                React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.border.base}` } },
                    React.createElement(Button, {
                        kind: 'ghost', size: 'lg', theme: s.theme,
                        onClick: () => setActiveTab('dashboard'),
                        style: { flex: 1 }
                    }, 'Back to Dashboard'),
                    React.createElement(Button, {
                        kind: 'primary', size: 'lg', theme: s.theme,
                        onClick: handleSubmit,
                        style: {
                            flex: 2,
                            opacity: companyName && industry && companySize && headquarters && email && about ? 1 : 0.5,
                            cursor: companyName && industry && companySize && headquarters && email && about ? 'pointer' : 'not-allowed',
                            pointerEvents: companyName && industry && companySize && headquarters && email && about ? 'auto' : 'none'
                        },
                        icon: isSubmitting ? React.createElement(Icon, { name: 'clock', size: 16 }) : null
                    }, isSubmitting ? 'Submitting...' : 'Submit for Review')
                )
            )
        );
    };

    // ========================================
    // RENDER CONTENT
    // ========================================
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'analytics':
                return renderAnalytics();
            case 'applicants':
                return renderApplicants();
            case 'profile':
                return React.createElement(CompanyProfileComponent, null);
            default:
                return renderDashboard();
        }
    };

    // ========================================
    // MAIN RENDER
    // ========================================
    return React.createElement('div', { style: { display: 'flex', minHeight: 'calc(100vh - 68px)' } },
        // SIDEBAR
        React.createElement('aside', {
            style: {
                width: 240,
                background: t.bg.card,
                borderRight: `1px solid ${t.border.base}`,
                padding: '20px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                position: 'sticky',
                top: 68,
                height: 'calc(100vh - 68px)',
                overflowY: 'auto',
                flexShrink: 0,
            }
        },
            React.createElement('div', { style: { padding: '0 8px 16px', borderBottom: `1px solid ${t.border.base}`, marginBottom: 12 } },
                React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 16, color: t.text.primary } }, '☰ Employer Panel')
            ),
            sidebarItems.map(item => {
                const active = activeTab === item.key;
                return React.createElement('button', {
                    key: item.key,
                    onClick: () => setActiveTab(item.key),
                    style: {
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10,
                        border: 'none', cursor: 'pointer', width: '100%',
                        background: active ? (s.theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted) : 'transparent',
                        color: active ? OC.orange : t.text.secondary,
                        fontFamily: FONT.body, fontWeight: active ? 600 : 500, fontSize: 14,
                        transition: 'all .15s ease',
                    },
                    onMouseEnter: e => {
                        if (!active) e.currentTarget.style.background = t.bg.subtle;
                    },
                    onMouseLeave: e => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                    }
                },
                    React.createElement(Icon, { name: item.icon, size: 18, color: active ? OC.orange : t.text.secondary }),
                    item.label
                );
            })
        ),
        // MAIN CONTENT
        React.createElement('main', { style: { flex: 1, padding: '24px 32px', overflowY: 'auto' } },
            renderContent()
        )
    );
}
// ==============
// --- CATEGORY_FIELD_CONFIG ---
const CATEGORY_FIELD_CONFIG = {
    jobs: [
        { key: 'jobCategory', label: 'Job category', type: 'select', options: JOB_CATEGORIES },
        { key: 'employmentType', label: 'Employment type', type: 'select', options: EMPLOYMENT_TYPES },
        { key: 'workplaceType', label: 'Workplace type', type: 'select', options: WORKPLACE_TYPES },
        { key: 'salaryType', label: 'Salary type', type: 'select', options: ['Fixed', 'Range', 'Negotiable'] },
        { key: 'salaryMin', label: 'Minimum salary', type: 'number' },
        { key: 'salaryMax', label: 'Maximum salary', type: 'number' },
        { key: 'currency', label: 'Currency', type: 'select', options: ['PKR', 'USD', 'AED', 'EUR'] },
        { key: 'experienceRequired', label: 'Experience required', type: 'text' },
        { key: 'educationRequired', label: 'Education required', type: 'text' },
        { key: 'requiredSkills', label: 'Required skills (comma separated)', type: 'text' },
        { key: 'responsibilities', label: 'Responsibilities', type: 'textarea' },
        { key: 'openings', label: 'Number of openings', type: 'number' },
        { key: 'applicationType', label: 'Application type', type: 'radio', options: ['Internal Apply', 'External Apply'] },
    ],
    internships: [
        { key: 'internshipCategory', label: 'Internship category', type: 'select', options: JOB_CATEGORIES },
        { key: 'internshipType', label: 'Internship type', type: 'select', options: ['Full-time', 'Part-time'] },
        { key: 'workplaceType', label: 'Workplace type', type: 'select', options: WORKPLACE_TYPES },
        { key: 'duration', label: 'Duration (e.g. 3 months)', type: 'text' },
        { key: 'stipendType', label: 'Stipend type', type: 'select', options: ['Paid', 'Unpaid'] },
        { key: 'stipendAmount', label: 'Monthly stipend', type: 'number' },
        { key: 'currency', label: 'Currency', type: 'select', options: ['PKR', 'USD', 'AED', 'EUR'] },
        { key: 'educationLevel', label: 'Education level', type: 'text' },
        { key: 'requiredSkills', label: 'Required skills (comma separated)', type: 'text' },
        { key: 'responsibilities', label: 'Responsibilities', type: 'textarea' },
        { key: 'certificate', label: 'Certificate provided', type: 'select', options: ['Yes', 'No'] },
        { key: 'ppo', label: 'PPO opportunity', type: 'select', options: ['Yes', 'No'] },
        { key: 'openings', label: 'Number of openings', type: 'number' },
        { key: 'applicationType', label: 'Application type', type: 'radio', options: ['Internal Apply', 'External Apply'] },
    ],
    scholarships: [
        { key: 'scholarshipCategory', label: 'Scholarship category', type: 'select', options: ['Merit', 'Need-Based', 'Research', 'International'] },
        { key: 'degreeLevel', label: 'Degree level', type: 'select', options: ['BS', 'MS', 'PhD'] },
        { key: 'country', label: 'Country', type: 'text' },
        { key: 'eligibility', label: 'Eligibility criteria', type: 'textarea' },
        { key: 'coverage', label: 'Scholarship coverage', type: 'select', options: ['Full funding', 'Partial funding'] },
    ],
    admissions: [
        { key: 'programName', label: 'Program name', type: 'text' },
        { key: 'institution', label: 'Institution', type: 'text' },
        { key: 'intake', label: 'Intake session', type: 'text' },
        { key: 'tuitionFee', label: 'Tuition fee', type: 'text' },
    ],
    events: [
        { key: 'eventCategory', label: 'Event category', type: 'select', options: ['Workshop', 'Seminar', 'Hackathon', 'Webinar', 'Career Fair', 'Competition'] },
        { key: 'eventType', label: 'Event type', type: 'select', options: ['Online', 'Offline', 'Hybrid'] },
        { key: 'startTime', label: 'Start time', type: 'time' },
        { key: 'endTime', label: 'End time', type: 'time' },
        { key: 'venue', label: 'Venue / meeting link', type: 'text' },
        { key: 'ticketType', label: 'Ticket type', type: 'select', options: ['Free', 'Paid'] },
        { key: 'ticketPrice', label: 'Ticket price (if paid)', type: 'number' },
        { key: 'registrationUrl', label: 'Registration URL', type: 'text' },
    ],
};

// --- PostOpportunityScreen ---
function PostOpportunityScreen() {
    const s = useStore();
    const t = useTheme(s.theme);
    const [category, setCategory] = useState(s.route.cat || 'jobs');
    const [core, setCore] = useState({ title: '', org: '', location: LOCATIONS[0], deadline: '', description: '', applyLink: '' });
    const [fields, setFields] = useState({});

    const changeCategory = (key) => { setCategory(key); setFields({}); };
    const setCoreField = (key, val) => setCore(c => ({ ...c, [key]: val }));
    const setExtraField = (key, val) => setFields(f => ({ ...f, [key]: val }));

    const needsApplyLink = category === 'scholarships' || category === 'admissions' ||
        ((category === 'jobs' || category === 'internships') && fields.applicationType === 'External Apply');
    const valid = core.title.trim().length > 2 && core.org.trim().length > 1 && core.description.trim().length > 10 && (needsApplyLink ? core.applyLink.trim().length > 4 : true);

    const submit = () => {
        if (!valid) return;
        s.addEmployerJob({ category, ...core, ...fields });
        s.showToast(`${CATEGORY[category].label.slice(0, -1)} submitted for review`, 'check');
        s.go('employers');
    };

    const selectRow = (label, value, onChange, options) =>
        React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 7 } }, label),
            React.createElement('select', {
                value: value || options[0], onChange: e => onChange(e.target.value),
                style: { width: '100%', height: 44, padding: '0 13px', borderRadius: 10, background: t.bg.page, border: `1.5px solid ${t.border.base}`, fontFamily: FONT.body, fontSize: 14.5, color: t.text.primary, outline: 'none', cursor: 'pointer' }
            }, options.map(o => React.createElement('option', { key: o, value: o }, o)))
        );

    const radioRow = (label, value, onChange, options) =>
        React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 9 } }, label),
            React.createElement('div', { style: { display: 'flex', gap: 10 } },
                options.map(o => {
                    const active = (value || options[0]) === o;
                    return React.createElement('button', {
                        key: o,
                        type: 'button',
                        onClick: () => onChange(o),
                        style: {
                            flex: 1, display: 'flex', alignItems: 'center', gap: 9,
                            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                            border: `1.5px solid ${active ? OC.orange : t.border.base}`,
                            background: active ? (s.theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted) : t.bg.page,
                            fontFamily: FONT.body, fontSize: 14, fontWeight: active ? 700 : 500,
                            color: active ? OC.orange : t.text.primary,
                        }
                    },
                        React.createElement('span', {
                            style: {
                                width: 17, height: 17, borderRadius: '50%', flex: '0 0 auto',
                                border: `1.5px solid ${active ? OC.orange : t.border.strong}`,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            }
                        }, active ? React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: OC.orange } }) : null),
                        o
                    );
                })
            )
        );

    const extraConfig = CATEGORY_FIELD_CONFIG[category] || [];
    return React.createElement('div', { style: { width: '100%', padding: '0 40px' } },
        React.createElement('div', { style: { padding: '40px 0 80px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: t.text.secondary, marginBottom: 12 } },
                React.createElement('button', { onClick: () => s.go('employers'), style: { background: 'none', border: 'none', cursor: 'pointer', color: t.text.secondary, fontSize: 12.5, padding: 0 } }, 'Employer dashboard'),
                React.createElement(Icon, { name: 'chevRight', size: 12 }),
                React.createElement('span', { style: { color: t.text.primary, fontWeight: 600 } }, 'Post an opportunity')
            ),
            React.createElement('h1', { style: { fontFamily: FONT.display, fontWeight: 800, fontSize: 30, margin: '0 0 28px', color: t.text.primary, letterSpacing: '-0.02em' } }, 'Post an opportunity'),

            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' } },
                React.createElement('aside', {
                    style: { background: t.bg.card, border: `1px solid ${t.border.base}`, borderRadius: 16, padding: 12, position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 4 }
                },
                    CAT_KEYS.map(key => {
                        const active = category === key;
                        const cat = CATEGORY[key];
                        return React.createElement('button', {
                            key: key, onClick: () => changeCategory(key),
                            style: {
                                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10,
                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                background: active ? (s.theme === 'dark' ? 'rgba(249,115,22,.14)' : OC.orangeMuted) : 'transparent',
                                color: active ? OC.orange : t.text.primary,
                                fontFamily: FONT.body, fontWeight: active ? 700 : 500, fontSize: 13.5,
                            }
                        }, React.createElement(Icon, { name: cat.icon, size: 16 }), cat.label);
                    })
                ),

                React.createElement('div', null,
                    React.createElement(Card, { theme: s.theme, padding: 24, style: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 18 } },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                            React.createElement(CategoryIcon, { category: category, size: 34, theme: s.theme }),
                            React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary } }, CATEGORY[category].label, ' — core details')
                        ),
                        React.createElement(Input, { theme: s.theme, label: category === 'events' ? 'Event title' : 'Title', value: core.title, onChange: v => setCoreField('title', v), placeholder: `e.g. ${category === 'jobs' ? 'Senior Frontend Engineer' : category === 'events' ? 'AI Career Fair 2026' : 'Opportunity title'}`, icon: 'briefcase' }),
                        React.createElement(Input, { theme: s.theme, label: category === 'events' ? 'Organizer name' : (category === 'jobs' || category === 'internships') ? 'Company name' : 'Organization / institution', value: core.org, onChange: v => setCoreField('org', v), placeholder: 'Name', icon: 'building' }),
                        (category === 'jobs' || category === 'internships') ? selectRow('Location', core.location, v => setCoreField('location', v), LOCATIONS) : null,
                        category === 'events' ? React.createElement(Input, { theme: s.theme, label: 'Event date', value: core.deadline, onChange: v => setCoreField('deadline', v), type: 'date', icon: 'clock' })
                            : React.createElement(Input, { theme: s.theme, label: 'Application deadline', value: core.deadline, onChange: v => setCoreField('deadline', v), type: 'date', icon: 'clock' }),
                        (category === 'scholarships' || category === 'admissions') ? React.createElement(Input, { theme: s.theme, label: 'External application link', value: core.applyLink, onChange: v => setCoreField('applyLink', v), placeholder: 'https://…', icon: 'globe' }) : null
                    ),

                    React.createElement(Card, { theme: s.theme, padding: 24, style: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 18 } },
                        React.createElement('div', { style: { fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: t.text.primary } }, CATEGORY[category].label, ' details'),
                        extraConfig.map(f =>
                            f.type === 'select'
                                ? React.createElement(React.Fragment, { key: f.key }, selectRow(f.label, fields[f.key], v => setExtraField(f.key, v), f.options))
                                : f.type === 'radio'
                                ? React.createElement(React.Fragment, { key: f.key }, radioRow(f.label, fields[f.key], v => setExtraField(f.key, v), f.options))
                                : f.type === 'textarea'
                                ? React.createElement(Input, { key: f.key, theme: s.theme, label: f.label, value: fields[f.key] || '', onChange: v => setExtraField(f.key, v), as: 'textarea', rows: 4 })
                                : React.createElement(Input, { key: f.key, theme: s.theme, label: f.label, value: fields[f.key] || '', onChange: v => setExtraField(f.key, v), type: f.type === 'time' ? 'time' : f.type })
                        ),
                        (fields.applicationType === 'External Apply') ? React.createElement(Input, { theme: s.theme, label: 'External apply URL', value: core.applyLink, onChange: v => setCoreField('applyLink', v), placeholder: 'https://…', icon: 'globe' }) : null,
                        React.createElement(Input, { theme: s.theme, label: 'Description', value: core.description, onChange: v => setCoreField('description', v), as: 'textarea', rows: 6, placeholder: 'Details, requirements, benefits…' })
                    ),

                    React.createElement('div', { style: { display: 'flex', gap: 10 } },
                        React.createElement(Button, { kind: 'ghost', size: 'lg', theme: s.theme, onClick: () => s.go('employers'), style: { flex: 1 } }, 'Cancel'),
                        React.createElement(Button, {
                            kind: 'primary', size: 'lg', theme: s.theme, onClick: submit,
                            style: { flex: 2, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed', pointerEvents: valid ? 'auto' : 'none' }
                        }, 'Submit for review')
                    )
                )
            )
        )
    );
}
// ========================================
// ABOUT SCREEN - Complete
// Paste this after all other screens
// ========================================

function AboutScreen() {
    const s = useStore();
    const t = useTheme(s.theme);

    // What We Offer Data
    const offerings = [
        { icon: 'briefcase', label: 'Jobs', desc: 'Find your dream job from top companies', color: '#3B82F6' },
        { icon: 'cap', label: 'Internships', desc: 'Gain real-world experience', color: '#8B5CF6' },
        { icon: 'building', label: 'Admissions', desc: 'Apply to top universities worldwide', color: '#14B8A6' },
        { icon: 'award', label: 'Scholarships', desc: 'Fund your education with ease', color: '#22C55E' },
        { icon: 'spark', label: 'Events', desc: 'Attend webinars & career fairs', color: '#F97316' },
    ];

    // Why Choose Us Features
    const features = [
        { icon: 'grid', title: 'All in One Place', desc: 'Jobs, internships, scholarships, admissions, and events — everything you need' },
        { icon: 'shieldCheck', title: 'Verified Listings', desc: 'Every opportunity is reviewed and verified by our team' },
        { icon: 'arrowUpRight', title: 'Easy Application', desc: 'Apply with one click — internal and external applications supported' },
        { icon: 'smartphone', title: 'Responsive Design', desc: 'Access from any device — desktop, tablet, or mobile' },
    ];

    return React.createElement('div', { style: { width: '100%' } },
        // ========================================
        // 1. HERO BANNER
        // ========================================
        React.createElement('div', {
            style: {
                background: s.theme === 'dark' ? OC.charcoal : '#F9FAFB',
                borderBottom: `1px solid ${t.border.base}`,
                padding: '80px 0 60px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }
        },
            // Background decoration
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: '-200px',
                    right: '-100px',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: OC.orange + '08',
                    pointerEvents: 'none'
                }
            }),
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    bottom: '-100px',
                    left: '-50px',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: OC.orange + '06',
                    pointerEvents: 'none'
                }
            }),
            
            React.createElement('div', { style: { maxWidth: 900, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 1 } },
                React.createElement(Badge, {
                    color: OC.orange,
                    theme: s.theme,
                    style: { fontSize: 13, padding: '6px 16px', marginBottom: 16 }
                }, '🚀 Your Gateway to Success'),
                
                React.createElement('h1', {
                    style: {
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: 52,
                        color: t.text.primary,
                        margin: '0 0 16px',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1
                    }
                },
                    'Your Gateway to',
                    React.createElement('br', null),
                    React.createElement('span', { style: { color: OC.orange } }, 'Career & Education Opportunities')
                ),
                
                React.createElement('p', {
                    style: {
                        fontSize: 18,
                        color: t.text.secondary,
                        lineHeight: 1.7,
                        maxWidth: 640,
                        margin: '0 auto 32px'
                    }
                },
                    'Discover thousands of verified opportunities — jobs, internships, scholarships, admissions, and events — all in one place.'
                ),
                
                React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' } },
                    React.createElement(Button, {
                        kind: 'primary',
                        size: 'lg',
                        theme: s.theme,
                        iconRight: React.createElement(Icon, { name: 'arrowRight', size: 16 }),
                        onClick: () => s.go('feed')
                    }, 'Get Started'),
                    React.createElement(Button, {
                        kind: 'secondary',
                        size: 'lg',
                        theme: s.theme,
                        onClick: () => s.go('signup')
                    }, 'Join Now')
                )
            )
        ),

        // ========================================
        // 2. ABOUT US
        // ========================================
        React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '60px 32px' } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' } },
                // Left: Content
                React.createElement('div', null,
                    React.createElement(Badge, {
                        color: OC.orange,
                        theme: s.theme,
                        style: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }
                    }, 'About Us'),
                    React.createElement('h2', {
                        style: {
                            fontFamily: FONT.display,
                            fontWeight: 800,
                            fontSize: 34,
                            color: t.text.primary,
                            margin: '12px 0 16px',
                            letterSpacing: '-0.02em'
                        }
                    }, 'Connecting Talent with Opportunity'),
                    React.createElement('p', {
                        style: {
                            fontSize: 16,
                            color: t.text.secondary,
                            lineHeight: 1.8,
                            margin: '0 0 16px'
                        }
                    },
                        'We are a comprehensive career platform designed for ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'students'),
                        ', ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'fresh graduates'),
                        ', and ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'professionals'),
                        ' — connecting you with verified opportunities from around the world.'
                    ),
                    React.createElement('p', {
                        style: {
                            fontSize: 16,
                            color: t.text.secondary,
                            lineHeight: 1.8,
                            margin: 0
                        }
                    },
                        'From ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'job listings'),
                        ' and ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'internships'),
                        ' to ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'scholarships'),
                        ' and ',
                        React.createElement('strong', { style: { color: t.text.primary } }, 'university admissions'),
                        ' — we provide trusted opportunities in one seamless platform.'
                    )
                ),
                // Right: Stats/Image placeholder
                React.createElement('div', {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 16
                    }
                },
                    [
                        { value: '10k+', label: 'Live Opportunities' },
                        { value: '500+', label: 'Trusted Employers' },
                        { value: '50+', label: 'Countries' },
                        { value: '100%', label: 'Free Access' }
                    ].map(stat =>
                        React.createElement(Card, {
                            key: stat.label,
                            theme: s.theme,
                            padding: 20,
                            style: { textAlign: 'center' }
                        },
                            React.createElement('div', {
                                style: {
                                    fontFamily: FONT.display,
                                    fontWeight: 800,
                                    fontSize: 28,
                                    color: OC.orange
                                }
                            }, stat.value),
                            React.createElement('div', {
                                style: {
                                    fontSize: 13,
                                    color: t.text.secondary,
                                    marginTop: 4
                                }
                            }, stat.label)
                        )
                    )
                )
            )
        ),

        // ========================================
        // 3. OUR MISSION
        // ========================================
        React.createElement('div', {
            style: {
                background: t.bg.card,
                borderTop: `1px solid ${t.border.base}`,
                borderBottom: `1px solid ${t.border.base}`,
                padding: '60px 32px'
            }
        },
            React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', textAlign: 'center' } },
                React.createElement(Badge, {
                    color: OC.orange,
                    theme: s.theme,
                    style: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }
                }, 'Our Mission'),
                
                React.createElement('h2', {
                    style: {
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: 34,
                        color: t.text.primary,
                        margin: '12px 0 16px',
                        letterSpacing: '-0.02em'
                    }
                }, 'Making Career Opportunities Accessible to Everyone'),
                
                React.createElement('p', {
                    style: {
                        fontSize: 17,
                        color: t.text.secondary,
                        lineHeight: 1.8,
                        maxWidth: 700,
                        margin: '0 auto 40px'
                    }
                },
                    'We believe in breaking down barriers. Our mission is to connect students and employers with trusted, verified opportunities — all on a single, easy-to-use platform.'
                ),
                
                // Mission Points
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, textAlign: 'left' } },
                    [
                        { icon: 'globe', title: 'Accessible Opportunities', desc: 'Career opportunities made available to everyone, everywhere' },
                        { icon: 'users', title: 'Connect Talent & Employers', desc: 'Bridging the gap between job seekers and companies' },
                        { icon: 'shieldCheck', title: 'Trusted & Verified', desc: 'Every listing is reviewed for authenticity and quality' }
                    ].map(item =>
                        React.createElement(Card, {
                            key: item.title,
                            theme: s.theme,
                            padding: 24,
                            style: { display: 'flex', gap: 14, alignItems: 'flex-start' }
                        },
                            React.createElement('div', {
                                style: {
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: s.theme === 'dark' ? 'rgba(249,115,22,.12)' : OC.orangeMuted,
                                    color: OC.orange,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flex: '0 0 auto'
                                }
                            }, React.createElement(Icon, { name: item.icon, size: 20 })),
                            React.createElement('div', null,
                                React.createElement('h4', {
                                    style: {
                                        fontFamily: FONT.display,
                                        fontWeight: 700,
                                        fontSize: 16,
                                        color: t.text.primary,
                                        margin: '0 0 4px'
                                    }
                                }, item.title),
                                React.createElement('p', {
                                    style: {
                                        fontSize: 13,
                                        color: t.text.secondary,
                                        margin: 0,
                                        lineHeight: 1.5
                                    }
                                }, item.desc)
                            )
                        )
                    )
                )
            )
        ),

        // ========================================
        // 4. WHAT WE OFFER (5 Cards)
        // ========================================
        React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '60px 32px' } },
            React.createElement('div', { style: { textAlign: 'center', marginBottom: 40 } },
                React.createElement(Badge, {
                    color: OC.orange,
                    theme: s.theme,
                    style: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }
                }, 'What We Offer'),
                React.createElement('h2', {
                    style: {
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: 34,
                        color: t.text.primary,
                        margin: '12px 0 8px',
                        letterSpacing: '-0.02em'
                    }
                }, 'Explore Opportunities Across All Categories'),
                React.createElement('p', {
                    style: {
                        fontSize: 16,
                        color: t.text.secondary,
                        margin: 0
                    }
                }, 'Find exactly what you\'re looking for')
            ),
            
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 } },
                offerings.map(o =>
                    React.createElement(Card, {
                        key: o.label,
                        theme: s.theme,
                        padding: 24,
                        style: {
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all .2s ease',
                            border: `1px solid ${t.border.base}`
                        },
                        onMouseEnter: e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = t.shadow.md;
                        },
                        onMouseLeave: e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        },
                        onClick: () => {
                            const catMap = {
                                'Jobs': 'jobs',
                                'Internships': 'internships',
                                'Admissions': 'admissions',
                                'Scholarships': 'scholarships',
                                'Events': 'events'
                            };
                            s.go('feed', { cat: catMap[o.label] || 'all' });
                        }
                    },
                        React.createElement('div', {
                            style: {
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                background: s.theme === 'dark' ? `${o.color}26` : `${o.color}14`,
                                color: o.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 12
                            }
                        }, React.createElement(Icon, { name: o.icon, size: 26 })),
                        React.createElement('h4', {
                            style: {
                                fontFamily: FONT.display,
                                fontWeight: 700,
                                fontSize: 17,
                                color: t.text.primary,
                                margin: '0 0 4px'
                            }
                        }, o.label),
                        React.createElement('p', {
                            style: {
                                fontSize: 13,
                                color: t.text.secondary,
                                margin: 0,
                                lineHeight: 1.4
                            }
                        }, o.desc)
                    )
                )
            )
        ),

        // ========================================
        // 5. WHY CHOOSE US (Features)
        // ========================================
        React.createElement('div', {
            style: {
                background: t.bg.card,
                borderTop: `1px solid ${t.border.base}`,
                borderBottom: `1px solid ${t.border.base}`,
                padding: '60px 32px'
            }
        },
            React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto' } },
                React.createElement('div', { style: { textAlign: 'center', marginBottom: 40 } },
                    React.createElement(Badge, {
                        color: OC.orange,
                        theme: s.theme,
                        style: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }
                    }, 'Why Choose Us'),
                    React.createElement('h2', {
                        style: {
                            fontFamily: FONT.display,
                            fontWeight: 800,
                            fontSize: 34,
                            color: t.text.primary,
                            margin: '12px 0 8px',
                            letterSpacing: '-0.02em'
                        }
                    }, 'Built for Your Success'),
                    React.createElement('p', {
                        style: {
                            fontSize: 16,
                            color: t.text.secondary,
                            margin: 0
                        }
                    }, 'Everything you need in one place')
                ),
                
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 } },
                    features.map(f =>
                        React.createElement(Card, {
                            key: f.title,
                            theme: s.theme,
                            padding: 24,
                            style: { textAlign: 'center' }
                        },
                            React.createElement('div', {
                                style: {
                                    width: 52,
                                    height: 52,
                                    borderRadius: 12,
                                    background: s.theme === 'dark' ? 'rgba(249,115,22,.12)' : OC.orangeMuted,
                                    color: OC.orange,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 12
                                }
                            }, React.createElement(Icon, { name: f.icon, size: 24 })),
                            React.createElement('h4', {
                                style: {
                                    fontFamily: FONT.display,
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: t.text.primary,
                                    margin: '0 0 4px'
                                }
                            }, f.title),
                            React.createElement('p', {
                                style: {
                                    fontSize: 13,
                                    color: t.text.secondary,
                                    margin: 0,
                                    lineHeight: 1.5
                                }
                            }, f.desc)
                        )
                    )
                )
            )
        ),

        // ========================================
        // 6. OUR VISION
        // ========================================
        React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '60px 32px' } },
            React.createElement('div', {
                style: {
                    background: s.theme === 'dark' ? 'rgba(249,115,22,.06)' : OC.orangeMuted,
                    borderRadius: 20,
                    padding: '48px 40px',
                    textAlign: 'center'
                }
            },
                React.createElement(Badge, {
                    color: OC.orange,
                    theme: s.theme,
                    style: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }
                }, 'Our Vision'),
                
                React.createElement('h2', {
                    style: {
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: 34,
                        color: t.text.primary,
                        margin: '12px 0 16px',
                        letterSpacing: '-0.02em'
                    }
                }, 'Shaping the Future of Careers'),
                
                React.createElement('p', {
                    style: {
                        fontSize: 17,
                        color: t.text.secondary,
                        lineHeight: 1.8,
                        maxWidth: 700,
                        margin: '0 auto'
                    }
                },
                    'To become the ',
                    React.createElement('strong', { style: { color: OC.orange } }, 'leading career platform'),
                    ' for students and professionals, and to create a ',
                    React.createElement('strong', { style: { color: OC.orange } }, 'strong connection'),
                    ' between employers and top talent — building a future where opportunities are accessible to all.'
                )
            )
        ),

        // ========================================
        // 7. CALL TO ACTION
        // ========================================
        React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '0 32px 80px' } },
            React.createElement('div', {
                style: {
                    background: OC.orange,
                    borderRadius: 20,
                    padding: '56px 40px',
                    textAlign: 'center',
                    color: '#fff'
                }
            },
                React.createElement('h2', {
                    style: {
                        fontFamily: FONT.display,
                        fontWeight: 800,
                        fontSize: 36,
                        margin: '0 0 12px',
                        letterSpacing: '-0.02em'
                    }
                }, 'Start Your Career Journey Today'),
                
                React.createElement('p', {
                    style: {
                        fontSize: 16,
                        opacity: 0.9,
                        maxWidth: 540,
                        margin: '0 auto 28px',
                        lineHeight: 1.6
                    }
                }, 'Join thousands of students and professionals finding their dream opportunities'),
                
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        gap: 10,
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }
                },
                    [
                        { label: 'Browse Jobs', cat: 'jobs' },
                        { label: 'Explore Internships', cat: 'internships' },
                        { label: 'Discover Scholarships', cat: 'scholarships' },
                        { label: 'Find Admissions', cat: 'admissions' },
                        { label: 'Join Events', cat: 'events' },
                    ].map(btn =>
                        React.createElement(Button, {
                            key: btn.label,
                            kind: 'ghost',
                            size: 'md',
                            style: {
                                background: 'rgba(255,255,255,.15)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,.2)',
                                fontWeight: 600
                            },
                            onClick: () => s.go('feed', { cat: btn.cat })
                        }, btn.label)
                    )
                )
            )
        )
    );
}
// ========================================
// 6. ROUTING
// ========================================

function PageRouter() {
    const s = useStore();
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handleRouteChange = () => {
            setCurrentPath(window.location.pathname);
            const params = new URLSearchParams(window.location.search);
            const mode = params.get('mode');

            if (window.location.pathname.includes('auth')) {
                s.go(mode === 'signup' ? 'signup' : 'login');
            } else if (window.location.pathname === '/' || window.location.pathname === '') {
                s.go('home');
            } else if (window.location.pathname === '/feed') {
                s.go('feed');
            } else if (window.location.pathname === '/search') {
                s.go('search');
            } else if (window.location.pathname === '/saved') {
                s.go('saved');
            } else if (window.location.pathname === '/applications') {
                s.go('applications');
            } else if (window.location.pathname === '/employers') {
                s.go('employers');
            } else if (window.location.pathname === '/post-job') {
                s.go('postJob');
            }
        };

        window.addEventListener('popstate', handleRouteChange);
        handleRouteChange();

        return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

    if (window.location.pathname.includes('auth')) {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode') || 'login';
        return React.createElement(AuthScreen, { mode: mode });
    }

    switch (s.route.name) {
        case 'home': return React.createElement(HomeScreen, null);
        case 'feed': return React.createElement(FeedScreen, null);
        case 'search': return React.createElement(SearchScreen, null);
        case 'saved': return React.createElement(SavedScreen, null);
        case 'account': return React.createElement(AccountSettingsSection, null);
        case 'employers': return React.createElement(EmployersScreen, null);
        case 'postJob': return React.createElement(PostOpportunityScreen, null);
        case 'detail': return React.createElement(DetailScreen, null); // ✅ FIX: was missing, cards/rows linked here but nothing rendered
        case 'login': return React.createElement(AuthScreen, { mode: 'login' });
        case 'signup': return React.createElement(AuthScreen, { mode: 'signup' });
         case 'companyProfile': return React.createElement(CompanyProfileScreen, null);
         case 'about': return React.createElement(AboutScreen, null);
        default: return React.createElement(HomeScreen, null);
    }
}

// ========================================
// 7. APP SHELL
// ========================================

function AppShell() {
    const s = useStore();
    const t = useTheme(s.theme);

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const params = new URLSearchParams(window.location.search);
            const mode = params.get('mode');

            if (path.includes('auth')) {
                s.go(mode === 'signup' ? 'signup' : 'login');
            } else if (path === '/' || path === '') {
                s.go('home');
            } else if (path === '/feed') {
                s.go('feed');
            } else if (path === '/search') {
                s.go('search');
            } else if (path === '/saved') {
                s.go('saved');
            } else if (path === '/applications') {
                s.go('applications');
            } else if (path === '/employers') {
                s.go('employers');
            } else if (path === '/post-job') {
                s.go('postJob');
            }
        };

        window.addEventListener('popstate', handlePopState);
        handlePopState();

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return React.createElement('div', {
        style: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: t.bg.page,
            transition: 'background .2s ease',
        }
    },
        React.createElement(AppNav, null),
        React.createElement('main', { style: { flex: 1 } },
            React.createElement(PageRouter, null)
        ),
        React.createElement(Footer, null),
        React.createElement(ApplyModal, null),
        React.createElement(Toast, null)
    );
}

// ========================================
// 8. RENDER
// ========================================

function App() {
    return React.createElement(
        StoreProvider,
        null,
        React.createElement(AppShell, null)
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));

console.log('✅ Opportunity Circle App Loaded Successfully!');