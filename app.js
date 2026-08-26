// Handle Service Selection UI
function selectService(type, element) {
    // UI Toggle
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');

    // Change Inputs dynamically
    const inputs = document.getElementById('dynamic-inputs');
    if (type === 'ride' || type === 'delivery') {
        inputs.innerHTML = `
            <div class="input-group"><label>Pickup Location</label><input type="text" value="Dehradun"></div>
            <div class="input-group"><label>Destination</label><input type="text" placeholder="Enter Dropoff..."></div>
        `;
    } else if (type === 'home' || type === 'clean') {
        inputs.innerHTML = `
            <div class="input-group"><label>Your Address</label><input type="text" value="Dehradun"></div>
            <div class="input-group"><label>Describe the Task</label><input type="text" placeholder="e.g. AC Repair, 2BHK Deep Clean"></div>
        `;
    }
}

// Simulate the matching process
function requestService() {
    document.getElementById('search-view').style.display = 'flex';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('match-card').style.display = 'none';
    document.getElementById('status-text').innerText = 'Broadcasting to Open Ledger...';

    // Fake processing time to make it feel real during demo
    setTimeout(() => {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('status-text').innerText = 'Worker Found & Accepted!';
        document.getElementById('match-card').style.display = 'block';
    }, 2500);
}

// Reset App for next demo
function resetApp() {
    document.getElementById('search-view').style.display = 'none';
}