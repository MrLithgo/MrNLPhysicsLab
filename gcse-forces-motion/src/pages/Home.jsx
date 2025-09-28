// pages/Home.jsx
import SimulationCard from '../components/SimulationCard';

const Home = () => {
    // Define your simulation data
    const simulations = [
        {
            id: 1,
            title: "Investigating Motion",
            subtitle: "Falling under gravity",
            description: "In this investigation you measure the time taken for a paper cone to fall different heights.",
            accentColor: "teal",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="6" />
                    <line x1="12" y1="1" x2="12" y2="6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1 L9 4 M12 1 L15 4" />
                    <line x1="12" y1="18" x2="12" y2="24" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 24L9 21 M12 24L15 21z " />
                </svg>
            ),
            href: "/legacy-sims/motion.html",
        },
        {
            id: 2,
            title: "Investigating Motion",
            subtitle: "Trolley and Ramp",
            description: "In this investigation you use light gates to measure the speed of a trolley moving down a ramp.",
            accentColor: "teal",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" stroke="currentColor" strokeWidth="1.5">
                    <rect transform="rotate(23.7214 10.053 8.68634)" height="5.31243" width="12.2991"
                        y="6.03012" x="3.90342" fill="none" />
                    <line y2="21.09329" x2="22.78111" y1="11.63025" x1="1.2189" fill="none" />
                    <ellipse ry="1.71873" rx="1.71873" cy="10.62468" cx="5.68759" fill="#ffffff" />
                    <ellipse ry="1.71873" rx="1.71873" cy="13.12465" cx="11.50001" fill="#ffffff" />
                </svg>
            ),
            href: "/legacy-sims/trolley-ramp.html",
        },
        {
            id: 3,
            title: "Investigating Friction",
            subtitle: "Forces in Action",
            description: "Test different surfaces and materials to understand the factors that affect friction.",
            accentColor: "navy",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="6.28" y="7.51" width="16.75" height="8.5" />
                    <polyline points="17.58,17.52 0.99,17.51 3.14,15.07 " />
                    <line x1="3.03" y1="19.92" x2="1.06" y2="17.68" />
                </svg>
            ),
            href: "/legacy-sims/friction.html",
        },
        {
            id: 4,
            title: "Newton's Second Law",
            subtitle: "F = ma",
            description: "Manipulate force and mass to observe changes in acceleration and verify Newton's Second Law.",
            accentColor: "coral",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 25 25" stroke="currentColor">
                    <circle cx="7.5" cy="12.5" r="5" fill="none" stroke-width="1.5" />
                    <line x1="13" y1="12.5" x2="22.5" y2="12.5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,2" />
                </svg>
            ),
            href: "/legacy-sims/secondlaw.html",
        },
        {
            id: 5,
            title: "Stopping Distance",
            subtitle: "Thinking and Braking",
            description: "Investigate factors affecting stopping distance including speed, reaction time, and road conditions.",
            accentColor: "navy",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="4.98" y="10" width="14.84" height="6.52" />
                    <rect x="7.2" y="3.58" width="10.25" height="6.25" />
                    <rect x="5.4" y="16.67" width="2.5" height="4.24" />
                    <rect x="16.65" y="16.67" width="2.5" height="4.24" />
                    <circle cx="8.24" cy="13.08" r="1" />
                    <circle cx="16.49" cy="13.08" r="1" />
                </svg>
            ),
            href: "/legacy-sims/stopping-distance.html",
        },
        {
            id: 6,
            title: "Investigating Friction",
            subtitle: "Forces in Action",
            description: "Test different surfaces and materials to understand the factors that affect friction.",
            accentColor: "navy",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="6.28" y="7.51" width="16.75" height="8.5" />
                    <polyline points="17.58,17.52 0.99,17.51 3.14,15.07 " />
                    <line x1="3.03" y1="19.92" x2="1.06" y2="17.68" />
                </svg>
            ),
            href: "/legacy-sims/friction.html",
        },
        {
            id: 7,
            title: "Investigating Friction",
            subtitle: "Forces in Action",
            description: "Test different surfaces and materials to understand the factors that affect friction.",
            accentColor: "navy",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="6.28" y="7.51" width="16.75" height="8.5" />
                    <polyline points="17.58,17.52 0.99,17.51 3.14,15.07 " />
                    <line x1="3.03" y1="19.92" x2="1.06" y2="17.68" />
                </svg>
            ),
            href: "/legacy-sims/friction.html",
        },
        {
            id: 8,
            title: "Investigating Friction",
            subtitle: "Forces in Action",
            description: "Test different surfaces and materials to understand the factors that affect friction.",
            accentColor: "navy",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="6.28" y="7.51" width="16.75" height="8.5" />
                    <polyline points="17.58,17.52 0.99,17.51 3.14,15.07 " />
                    <line x1="3.03" y1="19.92" x2="1.06" y2="17.68" />
                </svg>
            ),
            href: "/legacy-sims/friction.html",
        },
        {
            id: 3,
            title: "Investigating Friction",
            subtitle: "Forces in Action",
            description: "Test different surfaces and materials to understand the factors that affect friction.",
            accentColor: "navy",
            isLegacy: true,  // Mark as legacy
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="6.28" y="7.51" width="16.75" height="8.5" />
                    <polyline points="17.58,17.52 0.99,17.51 3.14,15.07 " />
                    <line x1="3.03" y1="19.92" x2="1.06" y2="17.68" />
                </svg>
            ),
            href: "/legacy-sims/friction.html",
        },
        // Add all your other simulations here
    ];

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <h1>GCSE Forces and Motion</h1>
                    <p>Interactive simulations to help you master physics concepts</p>
                </div>
            </header>

            <div className="container main-content">
                <div className="quote-card">
                    <p className="quote-text">"In physics, you don't have to go around making trouble for yourself - nature does it for you."</p>
                    <p className="quote-author">- Frank Wilczek</p>
                </div>

                <div className="cards-grid">
                    {simulations.map(sim => (
                        <SimulationCard
                            key={sim.id}
                            title={sim.title}
                            subtitle={sim.subtitle}
                            description={sim.description}
                            accentColor={sim.accentColor}
                            iconSvg={sim.iconSvg}
                            isLegacy={sim.isLegacy}  // Pass the legacy flag
                            href={sim.href}          // Pass the href for legacy sims
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;