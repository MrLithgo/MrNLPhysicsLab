// components/SimulationCard.jsx
import { Link } from 'react-router-dom';

const SimulationCard = ({
    title,
    subtitle,
    description,
    accentColor,
    iconSvg,
    isLegacy = false,
    href = "#"
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
                    // For legacy simulations - use <a> tag with href
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn ${accentColor}-btn`}
                    >
                        Launch Simulation
                    </a>
                ) : (
                    // For future React simulations - use <Link> component
                    <Link to={href} className={`btn ${accentColor}-btn`}>
                        Launch Simulation
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SimulationCard;