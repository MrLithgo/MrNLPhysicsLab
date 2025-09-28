// Elements
const cartContainer = document.getElementById('cartContainer');
const cart = document.getElementById('cart');
const massSlider = document.getElementById('massSlider');
const forceSlider = document.getElementById('forceSlider');
const massValue = document.getElementById('massValue');
const forceValue = document.getElementById('forceValue');
const massDisplay = document.getElementById('massDisplay');
const scaleReading = document.getElementById('scaleReading');
const timerDisplay = document.getElementById('timerDisplay');
const velocityDisplay = document.getElementById('velocityDisplay');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const forceArrow = document.getElementById('forceArrow');
const resultsTable = document.getElementById('resultsTable');
const clearResultsBtn = document.getElementById('clearResultsBtn');

// Constants
const TRACK_LENGTH = 1.0; // meters
const TRACK_ELEMENT = document.querySelector('.track');
const TRACK_PIXEL_LENGTH = TRACK_ELEMENT.clientWidth - 8 - 80; // pixels (minus finish line width and cart width)
const PIXELS_PER_METER = TRACK_PIXEL_LENGTH / TRACK_LENGTH;
const SIMULATION_SPEED = 1; // 1 = real time, higher = faster simulation
const RANDOMNESS_FACTOR = 0.05; // 5% randomness

// Variables
let mass = 1.0; // kg
let force = 0.0; // N
let experimentRunning = false;
let experimentCount = 0;
let startTime = 0;
let currentTime = 0;
let currentPosition = 0; // meters
let currentVelocity = 0; // m/s
let animationId = null;
let displayedTime = 0;
let displayedVelocity = 0;

// Initialize
updateMassDisplay();
updateForceDisplay();
updateForceArrow();

// Event listeners
massSlider.addEventListener('input', function () {
    mass = parseFloat(this.value);
    updateMassDisplay();
});

forceSlider.addEventListener('input', function () {
    force = parseFloat(this.value);
    updateForceDisplay();
    updateForceArrow();
});

startBtn.addEventListener('click', function () {
    if (!experimentRunning) {
        startExperiment();
    }
});

resetBtn.addEventListener('click', resetExperiment);

clearResultsBtn.addEventListener('click', function () {
    resultsTable.innerHTML = '';
    experimentCount = 0;
});

// Functions
function updateMassDisplay() {
    massValue.textContent = `${mass.toFixed(1)} kg`;
    massDisplay.textContent = `${mass.toFixed(1)} kg`;

    const scale = 1 + (mass - 1) * 0.1;
    cart.style.transform = `scale(${scale}) translateY(${(1 - scale) * 8}px)`;

    // Adjust cart container height to compensate for scaling
    cartContainer.style.bottom = `${104 - (scale - 1) * 8}px`;
}

function updateForceDisplay() {
    forceValue.textContent = `${force.toFixed(1)} N`;
}

function updateForceArrow() {
    // Adjust arrow length based on force
    const arrowWidth = 10 + force * 30;
    forceArrow.querySelector('div').style.width = `${arrowWidth}px`;
}

// Add randomness to a value within the specified percentage
function addRandomness(value) {
    const randomFactor = 1 + (Math.random() * 2 - 1) * RANDOMNESS_FACTOR;
    return value * randomFactor;
}

function startExperiment() {
    experimentRunning = true;
    startBtn.disabled = true;
    startBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // Disable sliders during experiment
    massSlider.disabled = true;
    forceSlider.disabled = true;

    // Reset position and velocity
    currentPosition = 0;
    currentVelocity = 0;
    displayedTime = 0;
    displayedVelocity = 0;
    cartContainer.style.transform = `translateX(0px)`;
    cart.classList.remove('cart-stop');

    // Start timer
    startTime = performance.now();
    currentTime = 0;

    // Run physics simulation
    runSimulation();
}

function runSimulation() {
    const now = performance.now();
    const deltaTime = (now - startTime) / 1000 * SIMULATION_SPEED; // Convert to seconds
    startTime = now;

    // Update time
    currentTime += deltaTime;
    displayedTime = addRandomness(currentTime);
    timerDisplay.textContent = `Time: ${displayedTime.toFixed(2)} s`;

    // Calculate acceleration (F = ma, so a = F/m)
    const acceleration = force / mass;

    // Update velocity (v = v0 + at)
    currentVelocity += acceleration * deltaTime;
    displayedVelocity = addRandomness(currentVelocity);
    velocityDisplay.textContent = `Velocity: ${displayedVelocity.toFixed(2)} m/s`;

    // Update position (x = x0 + vt)
    currentPosition += currentVelocity * deltaTime;

    // Check if we've reached the finish line
    if (currentPosition >= TRACK_LENGTH) {
        // Stop at the finish line
        currentPosition = TRACK_LENGTH;

        // Move cart to finish line
        const pixelPosition = TRACK_PIXEL_LENGTH;
        cartContainer.style.transform = `translateX(${pixelPosition}px)`;

        // Add stop animation
        cart.classList.add('cart-stop');

        finishExperiment();
        return;
    }

    // Move cart
    const pixelPosition = currentPosition * PIXELS_PER_METER;
    cartContainer.style.transform = `translateX(${pixelPosition}px)`;

    animationId = requestAnimationFrame(runSimulation);
}

function finishExperiment() {
    experimentRunning = false;
    experimentCount++;

    // Add result to table
    addResultToTable();

    // Re-enable controls
    startBtn.disabled = false;
    startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    massSlider.disabled = false;
    forceSlider.disabled = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function resetExperiment() {
    if (experimentRunning) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        experimentRunning = false;
        startBtn.disabled = false;
        startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        massSlider.disabled = false;
        forceSlider.disabled = false;
    }

    // Reset position and displays
    currentPosition = 0;
    currentVelocity = 0;
    currentTime = 0;
    displayedTime = 0;
    displayedVelocity = 0;
    cartContainer.style.transform = `translateX(0px)`;
    cart.classList.remove('cart-stop');
    timerDisplay.textContent = `Time: 0.00 s`;
    velocityDisplay.textContent = `Velocity: 0.00 m/s`;
}

function addResultToTable() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="border border-softgray">${experimentCount}</td>
        <td class="border border-softgray">${mass.toFixed(1)}</td>
        <td class="border border-softgray">${force.toFixed(1)}</td>
        <td class="border border-softgray">${TRACK_LENGTH.toFixed(1)}</td>
        <td class="border border-softgray">${displayedTime.toFixed(2)}</td>
        <td class="border border-softgray">${displayedVelocity.toFixed(2)}</td>
        <td class="border border-softgray">
            <input type="number" step="0.01" placeholder="Enter value" 
                   class="w-24 border border-softgray rounded px-2 py-1 text-center">
        </td>
        <td class="border border-softgray">
            <button class="delete-btn text-coral hover:text-opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        </td>
    `;

    // Add delete functionality
    row.querySelector('.delete-btn').addEventListener('click', function () {
        row.remove();
    });

    resultsTable.appendChild(row);

    // Highlight the new row briefly
    row.classList.add('bg-teal', 'bg-opacity-10');
    setTimeout(() => {
        row.classList.remove('bg-teal', 'bg-opacity-10');
    }, 1500);
}