// components/SimulationCard.jsx
import { Link } from 'react-router-dom';

const SimulationCard = ({
    title,
    subtitle,
    description,
    accentColor,
    iconSvg,
    linkTo,
    isLegacy = false  // Add this prop to identify legacy sims
}) => {
    return (
        <div className="card">
            <div className={`card-accent ${accentColor}-accent`}></div>
            <div className="card-content">
                <div className={`card-icon ${accentColor}-icon`}>
                    {iconSvg}
                </div>
                <h2>{title}</h2>
                <h3>{subtitle}</h3>
                <p>{description}</p>

                {isLegacy ? (
                    // For legacy simulations (external HTML files)
                    <a
                        href={linkTo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn ${accentColor}-btn`}
                    >
                        Launch Legacy Simulation
                    </a>
                ) : (
                    // For React simulations (internal routes)
                    <Link to={linkTo} className={`btn ${accentColor}-btn`}>
                        Launch Simulation
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SimulationCard;