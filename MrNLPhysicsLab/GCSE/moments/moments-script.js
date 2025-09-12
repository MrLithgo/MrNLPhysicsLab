let masses = [];
let massCounter = 1;
let draggedMass = null;
let dragOffset = { x: 0, y: 0 };

// Initialize the simulation
function init() {
    createScale();
    createDropZones();
    updateBeamBalance();

    // Add event listeners
    document.getElementById('addMassBtn').addEventListener('click', addMass);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);

    // Add input event listeners for table
    document.getElementById('leftMasses').addEventListener('input', updateTable);
    document.getElementById('rightMasses').addEventListener('input', updateTable);
    document.getElementById('leftDistance').addEventListener('input', updateTable);
    document.getElementById('rightDistance').addEventListener('input', updateTable);
}

function getScaleWidth() {
    const scale = document.querySelector('.scale');
    return scale ? scale.offsetWidth : 980 * 0.95; // fallback
}

// Use this function wherever you need the beam width
function getBeamWidth() {
    const beam = document.getElementById('beam');
    return beam ? beam.offsetWidth * 0.95 : 980 * 0.95; // or adjust factor as needed
}

function getBeamSpacing() {
    return getBeamWidth() / 24; // 24 intervals for 25 marks
}

function createScale() {
    const scale = document.querySelector('.scale');
    scale.innerHTML = '';
    const spacing = getBeamSpacing();

    for (let i = -12; i <= 12; i++) {
        const mark = document.createElement('div');
        mark.className = 'scale-mark';
        mark.style.position = 'absolute';
        mark.style.left = `${(i + 12) * spacing}px`;
        mark.style.transform = 'translateX(-50%)';

        const number = document.createElement('div');
        number.className = 'scale-number';
        number.textContent = Math.abs(i);
        mark.appendChild(number);

        scale.appendChild(mark);
    }
}

function createDropZones() {
    const container = document.querySelector('.beam');
    document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());
    const spacing = getBeamSpacing();

    for (let i = -12; i <= 12; i++) {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.style.left = `calc(50% + ${i * spacing}px)`;
        zone.style.transform = 'translateX(-50%)';
        zone.dataset.position = i;
        container.appendChild(zone);
    }
}

function addMass() {
    const massContainer = document.createElement('div');
    massContainer.className = 'mass-container';
    massContainer.dataset.id = massCounter;
    massContainer.dataset.position = 0;

    // Create hook structure
    const hookTop = document.createElement('div');
    hookTop.className = 'hook-top';

    const hook = document.createElement('div');
    hook.className = 'hook';

    const mass = document.createElement('div');
    mass.className = 'mass';
    mass.textContent = massCounter;

    massContainer.appendChild(hookTop);
    massContainer.appendChild(hook);
    massContainer.appendChild(mass);

    // Position at center (pivot) - hanging from beam
    massContainer.style.left = '50%';
    massContainer.style.transform = 'translateX(-50%)';
    massContainer.style.bottom = '60px';

    // Add drag functionality
    massContainer.addEventListener('mousedown', startDrag);

    document.querySelector('.balance-container').appendChild(massContainer);

    // Default weight is 1, can be changed later if needed
    masses.push({
        id: massCounter,
        position: 0,
        weight: 1,
        element: massContainer
    });

    massCounter++;
    updateBeamBalance();
    updateMassCount();
}

function startDrag(e) {
    draggedMass = e.currentTarget;
    draggedMass.classList.add('dragging');

    const rect = draggedMass.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left - rect.width / 2;
    dragOffset.y = e.clientY - rect.top - rect.height / 2;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Highlight drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.add('active');
    });

    e.preventDefault();
}

function drag(e) {
    if (!draggedMass) return;

    const container = document.querySelector('.balance-container');
    const containerRect = container.getBoundingClientRect();

    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    draggedMass.style.left = `${x}px`;
    draggedMass.style.bottom = `${container.offsetHeight - y - 70}px`;
}

function endDrag(e) {
    if (!draggedMass) return;

    // Find closest drop zone
    let closestZone = null;
    let minDistance = Infinity;

    document.querySelectorAll('.drop-zone').forEach(zone => {
        const zoneRect = zone.getBoundingClientRect();
        const massRect = draggedMass.getBoundingClientRect();

        const distance = Math.sqrt(
            Math.pow(zoneRect.left + zoneRect.width / 2 - (massRect.left + massRect.width / 2), 2) +
            Math.pow(zoneRect.top + zoneRect.height / 2 - (massRect.top + massRect.height / 2), 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestZone = zone;
        }
    });

    const spacing = getBeamSpacing();

    // Snap to closest zone if within reasonable distance
    if (closestZone && minDistance < 60) {
        const position = parseInt(closestZone.dataset.position);
        const massId = parseInt(draggedMass.dataset.id);
        draggedMass.style.left = `calc(50% + ${position * spacing}px)`;
        draggedMass.style.transform = 'translateX(-50%)';
        draggedMass.style.bottom = '60px';
        draggedMass.dataset.position = position;

        // Update masses array
        const massObj = masses.find(m => m.id === massId);
        if (massObj) {
            massObj.position = position;
        }
    } else {
        // Snap back to original position if not dropped on a valid zone
        const massId = parseInt(draggedMass.dataset.id);
        const massObj = masses.find(m => m.id === massId);
        draggedMass.style.left = `calc(50% + ${massObj.position * spacing}px)`;
        draggedMass.style.transform = 'translateX(-50%)';
        draggedMass.style.bottom = '60px';
    }

    draggedMass.classList.remove('dragging');
    draggedMass = null;

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);

    // Remove drop zone highlights
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });

    updateBeamBalance();
    updateMassCount();
}

function updateBeamBalance() {
    let leftMoment = 0;
    let rightMoment = 0;

    masses.forEach(mass => {
        if (mass.position < 0) {
            leftMoment += Math.abs(mass.position) * (mass.weight || 1);
        } else if (mass.position > 0) {
            rightMoment += mass.position * (mass.weight || 1);
        }
    });

    const totalMoment = rightMoment - leftMoment;
    const maxRotation = 15; // Maximum rotation in degrees
    const rotation = Math.max(-maxRotation, Math.min(maxRotation, totalMoment * 2));

    // Rotate beam
    document.getElementById('beam').style.transform = `translateX(-50%) rotate(${rotation}deg)`;

    // Rotate all masses with the beam
    masses.forEach(mass => {
        const currentTransform = mass.element.style.transform || '';
        // Extract all transforms except rotate
        const transforms = currentTransform
            .split(/\)\s*/)
            .filter(t => t.trim() !== '' && !t.includes('rotate'))
            .map(t => t.includes(')') ? t + ')' : t)
            .join(' ');
        // Ensure translateX is present, default to translateX(-50%) if not
        const translateMatch = transforms.match(/translateX\([^)]+\)/);
        const translateX = translateMatch ? translateMatch[0] : 'translateX(-50%)';
        mass.element.style.transform = `${translateX} rotate(${-rotation}deg)`;
    });
}

function updateMassCount() {
    let leftCount = 0;
    let rightCount = 0;

    masses.forEach(mass => {
        if (mass.position < 0) leftCount++;
        else if (mass.position > 0) rightCount++;
    });

    // Update DOM after counting
    document.getElementById('leftMasses').value = leftCount;
    document.getElementById('rightMasses').value = rightCount;
}

function updateTable() {
    // This function is called when users manually update the table
    // The moment calculation is left for students to do manually
}

function clearAll() {
    masses.forEach(mass => {
        mass.element.remove();
    });
    masses = [];
    massCounter = 1;
    updateBeamBalance();
    updateMassCount();

    // Clear table inputs
    document.getElementById('leftMasses').value = 0;
    document.getElementById('rightMasses').value = 0;
    document.getElementById('leftDistance').value = 0;
    document.getElementById('rightDistance').value = 0;
    document.getElementById('leftMoment').value = 0;
    document.getElementById('rightMoment').value = 0;
}

// Initialize the simulation when page loads
document.addEventListener('DOMContentLoaded', init);

window.addEventListener('resize', () => {
    createScale();
    createDropZones();
    masses.forEach(mass => {
        // Reposition masses based on new spacing
        const spacing = getBeamSpacing();
        mass.element.style.left = `calc(50% + ${mass.position * spacing}px)`;
        mass.element.style.transform = 'translateX(-50%)';
        mass.element.style.bottom = '60px';
    });
});