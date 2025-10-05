// DOM elements
const cone = document.getElementById('cone');
const heightInput = document.getElementById('height');
const massInput = document.getElementById('cone-mass');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');
const resultsBody = document.getElementById('results-body');
const simulationArea = document.getElementById('simulation-area');

// Simulation variables
let isDropping = false;
let isTiming = false;
let startTime = 0;
let trialNumber = 0;
let results = [];
let animationId;
let terminalVelocity = 0;

// Physics constants
const AIR_DENSITY = 1.225; // kg/m³
const DRAG_COEFFICIENT = 0.5; // Typical for a cone
const GRAVITY = 9.81; // m/s²



// Set initial cone position
function resetConePosition() {
    const height = parseInt(heightInput.value);
    cone.style.bottom = `${height + 20}px`;
    cone.style.transform = 'translateX(-50%) rotate(0deg)';
    cone.style.opacity = '1';
    cone.style.transition = 'none';
    cone.style.cursor = 'pointer';
}

// Calculate terminal velocity (v_term = sqrt(2mg/ρACd))
function calculateTerminalVelocity(mass, height) {
    const massKg = mass / 1000; // Convert g to kg
    const area = 0.03; // Approximate cross-sectional area in m² (for a typical paper cone)

    // Calculate terminal velocity in m/s
    const vTerm = Math.sqrt((2 * massKg * GRAVITY) / (AIR_DENSITY * area * DRAG_COEFFICIENT));

    // Convert to cm/s 
    const randomFactor = Math.random() * 0.05 + 0.95;
    //return vTerm*100;
    return vTerm * 100 * randomFactor;

}

// Start the experiment
function startExperiment() {
    if (isDropping || isTiming) return;

    const height = parseInt(heightInput.value);
    const mass = parseFloat(massInput.value);

    // Calculate terminal velocity
    terminalVelocity = calculateTerminalVelocity(mass, height);
    console.log(terminalVelocity);


    // Start timing
    isTiming = true;
    isDropping = true;
    startTime = Date.now();
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Start timer display
    updateTimer();

    // Drop the cone with realistic terminal velocity behavior
    const startBottom = height;
    const dropDuration = height / terminalVelocity; // Time to reach ground at terminal velocity

    let lastTimestamp = performance.now();
    let progress = 0;

    function animateDrop(timestamp) {
        if (!isDropping) return;

        const deltaTime = (timestamp - lastTimestamp) / 1000; // in seconds
        lastTimestamp = timestamp;

        progress += deltaTime / dropDuration;

        if (progress >= 1) {
            progress = 1;
            isDropping = false;

        }

        const currentBottom = 20 + startBottom * (1 - progress);
        cone.style.bottom = `${currentBottom}px`;
        cone.style.transform = 'rotate(0deg)';


        // Add some rotation for visual effect
        var a = Math.random() * 10 - 9;
        cone.style.transform = `translateX(-50%)rotate(${a}deg)`;

        animationId = requestAnimationFrame(animateDrop);
    }

    animationId = requestAnimationFrame(animateDrop);
}

// Update timer display
function updateTimer() {
    if (!isTiming) return;
    const elapsed = (Date.now() - startTime) / 1000;
    timerDisplay.textContent = `Time: ${elapsed.toFixed(2)}s`;
    requestAnimationFrame(updateTimer);
}

// Stop the experiment and record results
function stopExperiment() {
    if (!isTiming) return;

    // Stop timing and animation
    isTiming = false;
    isDropping = false;
    cancelAnimationFrame(animationId);

    const elapsedTime = (Date.now() - startTime) / 1000;
    const height = parseInt(heightInput.value);
    const mass = parseFloat(massInput.value);

    // Record results
    trialNumber++;
    results.push({
        trial: trialNumber,
        height: height,
        mass: mass,
        time: elapsedTime,
        terminalVelocity: terminalVelocity
    });

    updateResultsTable();

    // Reset controls
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cone.style.opacity = '0.7';
}

// Update results table
function updateResultsTable() {
    resultsBody.innerHTML = '';

    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.trial}</td>
            <td>${result.height}</td>
            <td>${result.mass}</td>
            <td>${result.time.toFixed(2)}</td>
           
        `;
        resultsBody.appendChild(row);
    });
}

// Reset everything
function resetExperiment() {
    isTiming = false;
    isDropping = false;
    cancelAnimationFrame(animationId);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    timerDisplay.textContent = 'Time: 0.00s';
    resetConePosition();
}

// Event listeners
startBtn.addEventListener('click', startExperiment);
stopBtn.addEventListener('click', stopExperiment);
resetBtn.addEventListener('click', resetExperiment);
// Get touch position from event
function getTouchPos(touchEvent) {
    return {
        x: touchEvent.touches[0].clientX,
        y: touchEvent.touches[0].clientY
    };
}

// Cone dragging with touch support
cone.addEventListener('mousedown', startDragCone);
cone.addEventListener('touchstart', startDragCone, { passive: false });

function startDragCone(e) {
    e.preventDefault();
    if (isDropping || isTiming) return;

    const startPos = e.type === 'touchstart' ? getTouchPos(e) : { x: e.clientX, y: e.clientY };
    const startBottom = parseInt(cone.style.bottom) || parseInt(heightInput.value) + 20;

    function moveCone(e) {
        const currentPos = e.type.includes('touch') ? getTouchPos(e) : { x: e.clientX, y: e.clientY };
        const deltaY = startPos.y - currentPos.y;
        let newBottom = startBottom + deltaY;
        const maxHeight = simulationArea.clientHeight - cone.clientHeight;

        newBottom = Math.max(20, Math.min(maxHeight, newBottom));
        cone.style.bottom = `${newBottom}px`;
        heightInput.value = newBottom - 20;
    }

    function stopMoving() {
        document.removeEventListener('mousemove', moveCone);
        document.removeEventListener('mouseup', stopMoving);
        document.removeEventListener('touchmove', moveCone);
        document.removeEventListener('touchend', stopMoving);
    }

    document.addEventListener('mousemove', moveCone);
    document.addEventListener('mouseup', stopMoving);
    document.addEventListener('touchmove', moveCone, { passive: false });
    document.addEventListener('touchend', stopMoving);
}

// Real-time height update
heightInput.addEventListener('input', () => {
    if (!isDropping && !isTiming) {
        const inputHeight = parseInt(heightInput.value);
        // Add ground offset to position cone correctly
        const coneBottom = inputHeight + 20;
        const maxHeight = simulationArea.clientHeight - cone.clientHeight;

        // Constrain to valid range
        const constrainedHeight = Math.min(maxHeight, coneBottom);
        cone.style.bottom = `${constrainedHeight}px`;

        // Update input to reflect any constraints
        heightInput.value = constrainedHeight - 20;
    }
});
// Initialize
resetConePosition();

// Clear results function
function clearResults() {
    if (confirm('Are you sure you want to clear all results?')) {
        results = [];
        trialNumber = 0;
        updateResultsTable(); // This will clear the table since results is empty
    }
}

// Add event listener for the clear button
document.getElementById('clear-results-btn').addEventListener('click', clearResults);

document.getElementById("help-button").addEventListener("click", function () {
    // Create a new div element for the floating window
    var helpWindow = document.createElement("div");
    helpWindow.id = "help-window";
    helpWindow.style.position = "absolute";
    helpWindow.style.top = "50%";
    helpWindow.style.left = "50%";
    helpWindow.style.transform = "translate(-50%, -50%)";
    helpWindow.style.width = "60%";
    helpWindow.style.height = "100%";
    helpWindow.style.background = "white";
    helpWindow.style.border = "1px solid black";
    helpWindow.style.padding = "10px";
    helpWindow.style.zIndex = "1000";
    helpWindow.style.overflow = "auto";
    helpWindow.style.overflowY = "auto";

    // Add content to the floating window
    var helpContent = document.createElement("p");
    helpContent.innerHTML =
        '<h2 style="text-align:center;">Core Practical: Investigating Motion</h2><p><b>Aim of the Experiment</b></p><ul><li>The aim of this experiment is to investigate the motion of some everyday objects, by measuring their speed </li><li>By measuring distance moved and time taken, the average speed of the object can be calculated</li></ul><p><b>Variables:</b></p><ul><li><b>Independent variable</b> = Distance moved, d</li><li><b>Dependent variable</b> = Time taken, t</li><li><b>Control variables:</b><ul><li>Same object used</li></ul></ul><p><b>Method:</b></p><ol><li>Measure out a height of 1.0 m using the tape measure</li><li>Drop the object (in this case, a paper cone) from this height</li><li>Use the stop clock to measure how long the object takes to hit the ground</li></ul><li>Record the distance travelled and time taken</li><li>Repeat steps three times, calculating an average time taken for the object to fall this distance</li><li>Repeat this process for 4 more different heights</li></ol><p><b>Analysis of Results</b></p><ul><li>The average speed of the falling object can be calculated using the equation</li><br></br><math><mi>average speed (m/s) = </mi><mfrac><msup><mi>distance travelled (m)</mi></msup><mn>average time (s)</mn></mfrac</math></ul><p><b>Extension</b></p><ul><li>Repeat the experiment for different mass cones (air resistance is accounted for in this simulation so mass will have an effect)</li></ul><p><b>Evaluation</b></p><ul><li>The average human reaction time is 0.25 s, which is significant when the times are small</li><li>To reduce this systematic error, larger distances should be used resulting in larger time intervals</li><li>You can use other methods such as light gates or sensors for more precision</li><li>You could also use a ball bearing and electronic switch to measure times more accurately</li></ul>';
    helpWindow.appendChild(helpContent);

    // Add a close button to the floating window
    var closeButton = document.createElement("button");
    closeButton.innerHTML = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "20px";
    closeButton.style.right = "10px";
    closeButton.style.width = "10%";
    closeButton.addEventListener("click", function () {
        helpWindow.remove();
    });
    helpWindow.appendChild(closeButton);

    document.body.appendChild(helpWindow);
});


//tape measure code
// DOM Elements
const ruler = document.getElementById('ruler');


// Initialize Ruler
function initRuler() {
    // Set initial position (right side, centered vertically)
    ruler.style.left = `${simulationArea.clientWidth - 50}px`;
    ruler.style.top = `${(simulationArea.clientHeight - 300) / 2}px`;
    createRealisticRuler();
    startDragRuler();
}

// Create realistic ruler markings
function createRealisticRuler() {
    const rulerScale = document.getElementById('ruler-scale');
    rulerScale.innerHTML = '';

    const heightPx = 300; // 300cm tall
    const pxPerCm = heightPx / 300;

    // Create marks for each cm
    for (let cm = 0; cm <= 300; cm++) {
        const position = (300 - cm) * pxPerCm;

        const mark = document.createElement('div');
        mark.className = 'cm-mark';
        mark.style.top = `${position}px`;

        // Different mark types
        if (cm % 10 === 0) {
            // Major mark (every 10cm)
            mark.style.height = '2px';
            mark.style.width = '12px';
            mark.style.background = '#111';

            // Add number
            if (cm > 0) {  // Don't show 0 at bottom
                const number = document.createElement('div');
                number.className = 'cm-number';
                number.style.top = `${position}px`;
                number.textContent = cm;
                rulerScale.appendChild(number);
            }
        }
        else if (cm % 5 === 0) {
            // Medium mark (every 5cm)
            mark.className += ' medium';
            mark.style.height = '1.5px';
        }
        else {
            // Minor mark (every 1cm)
            mark.className += ' minor';
        }

        rulerScale.appendChild(mark);
    }
}

// Initialize ruler dragging
// Ruler dragging with touch support
// Unified touch/mouse position getter
function getPosition(event) {
    if (event.touches) {
        return {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    } else {
        return {
            x: event.clientX,
            y: event.clientY
        };
    }
}

// Initialize ruler dragging with proper Y movement
function initRulerDrag() {
    ruler.addEventListener('mousedown', startDragRuler);
    ruler.addEventListener('touchstart', startDragRuler, { passive: false });

    function startDragRuler(e) {
        e.preventDefault();
        const pos = getPosition(e);
        const startX = pos.x;
        const startY = pos.y;
        const startLeft = parseInt(ruler.style.left) || 0;
        const startTop = parseInt(ruler.style.top) || 0;
        const startBottom = parseInt(ruler.style.bottom) || 0;

        function moveRuler(e) {
            const currentPos = getPosition(e);
            const dx = currentPos.x - startX;
            const dy = currentPos.y - startY;

            // Calculate new position using bottom (not top)
            let newLeft = startLeft + dx;
            let newBottom = startBottom - dy; // Subtract because bottom increases as Y decreases

            // Constrain to simulation area
            newLeft = Math.max(0, Math.min(
                simulationArea.clientWidth - ruler.offsetWidth,
                newLeft
            ));

            newBottom = Math.max(20, Math.min(
                simulationArea.clientHeight - ruler.offsetHeight,
                newBottom
            ));

            ruler.style.left = `${newLeft}px`;
            ruler.style.bottom = `${newBottom}px`;
            ruler.style.top = 'auto'; // Ensure we're using bottom positioning
        }

        function stopMoving() {
            document.removeEventListener('mousemove', moveRuler);
            document.removeEventListener('mouseup', stopMoving);
            document.removeEventListener('touchmove', moveRuler);
            document.removeEventListener('touchend', stopMoving);
            document.body.style.cursor = '';
        }

        document.body.style.cursor = 'grabbing';
        document.addEventListener('mousemove', moveRuler);
        document.addEventListener('mouseup', stopMoving);
        document.addEventListener('touchmove', moveRuler, { passive: false });
        document.addEventListener('touchend', stopMoving);
    }
}

// Initialize ruler position
function initRulerPosition() {
    ruler.style.left = '30px';
    ruler.style.bottom = '20px'; // Align with ground
    ruler.style.top = 'auto';
}

// Initialize everything
function initSimulation() {
    initRulerPosition();
    createRealisticRuler();
    initRulerDrag();
}

window.addEventListener('load', initSimulation);
window.addEventListener('resize', function () {
    // Handle screen rotation/resize
    resetConePosition();
    // positionRuler();
}
)