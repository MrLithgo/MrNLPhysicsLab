// components/SimulationCard.jsx
const SimulationCard = ({
    title,
    subtitle,
    description,
    accentColor,
    iconSvg,
    onClick
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
                <button
                    onClick={onClick}
                    className={`btn ${accentColor}-btn`}
                >
                    Launch Simulation
                </button>
            </div>
        </div>
    );
};

export default SimulationCard;