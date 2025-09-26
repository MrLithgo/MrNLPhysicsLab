// pages/Home.jsx
import SimulationCard from '../components/SimulationCard';

const Home = () => {
    const simulationAlert = (simulation) => {
        alert(`Opening ${simulation} simulation...`);
        // In a real implementation, this would navigate to the simulation
    };

    // Define your simulation data
    const simulations = [
        {
            id: 1,
            title: "Investigating Motion",
            subtitle: "Falling under gravity",
            description: "In this investigation you measure the time taken for a paper cone to fall different heights.",
            accentColor: "teal",
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" stroke="currentColor" strokeWidth="1.5">

                    <circle cx="12" cy="12" r="6" />
                    <line x1="12" y1="1" x2="12" y2="6" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 1 L9 4 M12 1 L15 4" />
                    <line x1="12" y1="18" x2="12" y2="24" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 24L9 21 M12 24L15 21z " />

                </svg>
            ),
            onClick: () => simulationAlert('Core Practical 1 - Investigating Motion')
        },
        {
            id: 2,
            title: "Investigating Motion",
            subtitle: "Trolley and Ramp",
            description: "In this investigation you use light gates to measure the speed of a trolley moving down a ramp.",
            accentColor: "teal",
            isLegacy: true,  // Mark this as a legacy simulation
            iconSvg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" stroke="currentColor" strokeWidth="1.5">

                    <rect transform="rotate(23.7214 10.053 8.68634)" height="5.31243" width="12.2991"
                        y="6.03012" x="3.90342" fill="none" />
                    <line y2="21.09329" x2="22.78111" y1="11.63025" x1="1.2189" fill="none" />
                    <ellipse ry="1.71873" rx="1.71873" cy="10.62468" cx="5.68759" fill="#ffffff" />
                    <ellipse ry="1.71873" rx="1.71873" cy="13.12465" cx="11.50001" fill="#ffffff" />

                </svg>
            ),
            linkTo: "/legacy-sims/trolley-ramp.html",
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
                            onClick={sim.onClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;