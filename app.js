
        // Initial Mock Database
        let jobs = [
            { id: 1, category: 'transport', badgeClass: 'badge-transport', catName: 'Rides & Cabs', title: 'Dehradun ➔ Tehri Roundtrip', details: 'Sedan • 110 km • Departure: 17:00 Today', price: 2800, fee: 20 },
            { id: 2, category: 'home', badgeClass: 'badge-home', catName: 'Home Services', title: 'Main Panel Inverter Wiring & Inspection', details: 'Electrician Required • Rajpur Road • 2 Hours estimate', price: 650, fee: 15 },
            { id: 3, category: 'delivery', badgeClass: 'badge-delivery', catName: 'Express Logistics', title: 'Commercial Spare Parts Delivery (45kg)', details: 'Transport Tempo • Industrial Area ➔ Patel Nagar', price: 1200, fee: 20 },
            { id: 4, category: 'cleaning', badgeClass: 'badge-cleaning', catName: 'Deep Cleaning', title: '3BHK Post-Renovation Deep Clean', details: 'Equipment Required • 4-person crew • Scheduled: Tomorrow', price: 3500, fee: 25 },
            { id: 5, category: 'transport', badgeClass: 'badge-transport', catName: 'Rides & Cabs', title: 'Delhi ➔ Jaipur Direct Drop', details: 'SUV Required • 280 km • Departure: Tomorrow 06:00', price: 4500, fee: 20 }
        ];

        let walletBalance = 850;
        let totalWorkerSavings = 4320;
        let currentFilter = 'all';

        function renderJobs() {
            const container = document.getElementById('jobs-container');
            const filtered = currentFilter === 'all' ? jobs : jobs.filter(j => j.category === currentFilter);
            
            if (filtered.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px;">No open leads in this category right now. New requests will appear automatically.</div>';
                return;
            }

            container.innerHTML = filtered.map(job => `
                <div class="job-card" id="job-${job.id}">
                    <div>
                        <span class="badge ${job.badgeClass}">${job.catName}</span>
                        <div class="job-title">${job.title}</div>
                        <div class="job-details">
                            <span>📋 ${job.details}</span>
                        </div>
                    </div>
                    <div class="action-pane">
                        <div>
                            <div class="job-price">₹ ${job.price.toLocaleString()}</div>
                            <div class="job-sub">Worker keeps 100% of fare</div>
                        </div>
                        <button class="claim-btn" onclick="claimJob(${job.id}, ${job.fee}, ${job.price})">
                            Claim (₹${job.fee} Flat Fee)
                        </button>
                    </div>
                </div>
            `).join('');

            updateCounts();
        }

        function updateCounts() {
            document.getElementById('count-all').innerText = jobs.length;
            document.getElementById('count-transport').innerText = jobs.filter(j => j.category === 'transport').length;
            document.getElementById('count-delivery').innerText = jobs.filter(j => j.category === 'delivery').length;
            document.getElementById('count-home').innerText = jobs.filter(j => j.category === 'home').length;
            document.getElementById('count-cleaning').innerText = jobs.filter(j => j.category === 'cleaning').length;
        }

        function filterCategory(cat, btnElement) {
            currentFilter = cat;
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            if(btnElement) btnElement.classList.add('active');
            
            const titles = {
                all: 'Live Cooperative Ledger (All Verticals)',
                transport: 'Live Outstation & Local Cab Dispatch',
                delivery: 'Live Express Delivery & Cargo Leads',
                home: 'Live Electrician, Plumbing & Repair Calls',
                cleaning: 'Live Deep Cleaning & Sanitation Orders'
            };
            document.getElementById('current-category-label').innerText = titles[cat];
            renderJobs();
        }

        function claimJob(id, fee, price) {
            if (walletBalance < fee) {
                alert('Wallet balance too low for flat SaaS fee. Please recharge.');
                return;
            }

            walletBalance -= fee;
            // Traditional app would take 25% = price * 0.25. Savings = (price * 0.25) - fee
            const saved = (price * 0.25) - fee;
            totalWorkerSavings += Math.max(0, saved);

            jobs = jobs.filter(j => j.id !== id);
            
            document.getElementById('wallet-pill').innerText = `Wallet: ₹ ${walletBalance.toFixed(2)}`;
            document.getElementById('savings-counter').innerText = `₹ ${Math.round(totalWorkerSavings).toLocaleString()} Saved`;
            
            showToast(`Lead Claimed! Platform fee: ₹${fee} (Worker retained ₹${price - fee})`);
            renderJobs();
        }

        function postJob() {
            const cat = document.getElementById('new-cat').value;
            const title = document.getElementById('new-title').value.trim();
            const price = parseFloat(document.getElementById('new-price').value);

            if (!title || !price || price <= 0) {
                alert('Please enter a valid title and price.');
                return;
            }

            const badges = {
                transport: { badgeClass: 'badge-transport', catName: 'Rides & Cabs', fee: 20 },
                delivery: { badgeClass: 'badge-delivery', catName: 'Express Logistics', fee: 20 },
                home: { badgeClass: 'badge-home', catName: 'Home Services', fee: 15 },
                cleaning: { badgeClass: 'badge-cleaning', catName: 'Deep Cleaning', fee: 25 }
            };

            const newJob = {
                id: Date.now(),
                category: cat,
                badgeClass: badges[cat].badgeClass,
                catName: badges[cat].catName,
                title: title,
                details: 'Direct customer broadcast • Flexible timing',
                price: price,
                fee: badges[cat].fee
            };

            jobs.unshift(newJob);
            document.getElementById('new-title').value = '';
            document.getElementById('new-price').value = '';

            showToast('New gig broadcasted to cooperative ledger!');
            renderJobs();
        }

        function rechargeWallet() {
            walletBalance += 200;
            document.getElementById('wallet-pill').innerText = `Wallet: ₹ ${walletBalance.toFixed(2)}`;
            showToast('₹200 added to operator SaaS balance.');
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }

        // Initialize view on load
        renderJobs();