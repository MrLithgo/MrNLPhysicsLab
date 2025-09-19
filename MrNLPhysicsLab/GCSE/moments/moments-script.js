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
    document.getElementById('leftDistance').addEventListener('input', updateTable);
    document.getElementById('rightDistance').addEventListener('input', updateTable);

    // Add initial mass to make it more engaging
    addMass();
}

function getScaleWidth() {
    const scale = document.querySelector('.scale');
    return scale ? scale.offsetWidth : 980 * 0.95; // fallback
}

function getBeamWidth() {
    const beam = document.getElementById('beam');
    return beam ? beam.offsetWidth * 0.95 : 980 * 0.95;
}

function getBeamSpacing() {
    return getBeamWidth() / 24; // 24 intervals for 25 marks
}

function createScale() {
    const scale = document.querySelector('.scale');
    scale.innerHTML = '';
    const spacing = getBeamSpacing();

    // The scale container is already centered, so we position marks relative to its center
    const scaleWidth = scale.offsetWidth;
    const centerPosition = scaleWidth / 2;

    for (let i = -12; i <= 12; i++) {
        const mark = document.createElement('div');
        mark.className = 'scale-mark';
        mark.style.position = 'absolute';
        mark.style.left = `${centerPosition + (i * spacing)}px`;
        mark.style.transform = 'translateX(-50%)';

        // Add number labels only for even numbers to reduce clutter
        if (i % 2 === 0) {
            const number = document.createElement('div');
            number.className = 'scale-number';
            number.textContent = Math.abs(i);
            number.style.left = `${centerPosition + (i * spacing)}px`;
            number.style.transform = 'translateX(-50%)';
            scale.appendChild(number);
        }

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

    // Add to beam instead of balance-container
    document.getElementById('beam').appendChild(massContainer);

    // Position at center (pivot)
    const spacing = getBeamSpacing();
    massContainer.style.top = `calc(50% + ${0 * spacing}px)`;

    // Add drag functionality
    massContainer.addEventListener('mousedown', startDrag);

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

    // Store original position for potential snap-back
    const massId = parseInt(draggedMass.dataset.id);
    const massObj = masses.find(m => m.id === massId);
    draggedMass.dataset.originalPosition = massObj.position;
    draggedMass.dataset.originalLeft = draggedMass.style.left;
    draggedMass.dataset.originalTransform = draggedMass.style.transform;

    // Calculate offset from mouse position to element's current position
    const rect = draggedMass.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    // Switch to fixed positioning for smooth dragging
    draggedMass.style.position = 'fixed';
    draggedMass.style.left = `${e.clientX - dragOffset.x}px`;
    draggedMass.style.top = `${e.clientY - dragOffset.y}px`;
    draggedMass.style.transform = 'none';
    draggedMass.style.zIndex = '1000';

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

    // Move the mass with the cursor
    draggedMass.style.left = `${e.clientX - dragOffset.x}px`;
    draggedMass.style.top = `${e.clientY - dragOffset.y}px`;
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
    const massId = parseInt(draggedMass.dataset.id);
    const massObj = masses.find(m => m.id === massId);

    // Reset to absolute positioning
    draggedMass.style.position = 'absolute';
    draggedMass.style.top = 'auto';
    draggedMass.style.zIndex = '10';
    draggedMass.style.transform = 'translateX(-50%)';

    // Only snap to zone if within reasonable distance
    if (closestZone && minDistance < 100) {
        const position = parseInt(closestZone.dataset.position);

        // Position the mass correctly relative to the beam
        draggedMass.style.left = `calc(50% + ${position * spacing}px)`;
        draggedMass.style.bottom = '60px';

        // Update data
        draggedMass.dataset.position = position;
        massObj.position = position;
    } else {
        // Snap back to original position if not dropped on a valid zone
        const originalPosition = parseInt(draggedMass.dataset.originalPosition);

        // Restore original position
        draggedMass.style.left = `calc(50% + ${originalPosition * spacing}px)`;
        draggedMass.style.bottom = '60px';

        // Update data
        draggedMass.dataset.position = originalPosition;
        massObj.position = originalPosition;
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

    // Position all masses at their drop zones (no rotation applied to masses)
    masses.forEach(mass => {
        const spacing = getBeamSpacing();
        const massElem = mass.element;

        // Position the mass at the correct drop zone location
        massElem.style.left = `calc(50% + ${mass.position * spacing}px)`;
        massElem.style.transform = 'translateX(-50%)'; // No rotation for masses
        massElem.style.bottom = '60px'; // Reset bottom position
    });

    // Update balance status
    const balanceStatus = document.getElementById('balanceStatus');
    if (Math.abs(totalMoment) < 0.1) {
        balanceStatus.textContent = "Balanced!";
        balanceStatus.className = "balance-status balanced";
    } else {
        balanceStatus.textContent = "Unbalanced";
        balanceStatus.className = "balance-status unbalanced";
    }
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
    document.getElementById('leftMoment').value = '';
    document.getElementById('rightMoment').value = '';

    // Reset balance status
    document.getElementById('balanceStatus').textContent = '';
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
    updateBeamBalance();
});