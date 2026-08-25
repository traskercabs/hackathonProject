const knownBrands = {
  flipkart: "flipkart.com",
  amazon: "amazon.in", // Adjust based on target region
  meesho: "meesho.com",
  myntra: "myntra.com"
};

const suspiciousTlds = [".xyz", ".top", ".click", ".shop", ".site", ".vip", ".online", ".store"];
const promoWords = ["sale", "offer", "discount", "deal", "official", "cheap", "free"];

const urlInput = document.getElementById("url-input");
const scanBtn = document.getElementById("scan-btn");
const resultCard = document.getElementById("result-card");
const domainDisplay = document.getElementById("domain-display");
const riskBadge = document.getElementById("risk-badge");
const riskLevelText = document.getElementById("risk-level");
const riskScoreText = document.getElementById("risk-score");
const reasonsList = document.getElementById("reasons-list");
const quickChips = document.querySelectorAll(".chip");

// Event listeners
scanBtn.addEventListener("click", handleScan);
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleScan();
});

// Quick-test chip clicks
quickChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    urlInput.value = chip.dataset.url;
    handleScan();
  });
});

function handleScan() {
  const rawInput = urlInput.value.trim();
  if (!rawInput) return;

  const domain = extractDomain(rawInput);
  analyzeRisk(domain);
}

// Clean user input into a standardized domain format
function extractDomain(input) {
  let cleaned = input.toLowerCase();
  
  // Add protocol if missing so URL parser works
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.hostname.replace(/^www\./, "");
  } catch (err) {
    return input.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  }
}

function analyzeRisk(domain) {
  let score = 0;
  let reasons = [];

  // 1. Exact official match check
  let isOfficial = false;
  for (const [brand, officialDomain] of Object.entries(knownBrands)) {
    if (domain === officialDomain) {
      isOfficial = true;
      break;
    }
  }

  if (isOfficial) {
    renderResults(domain, 0, ["Recognized official brand domain."]);
    return;
  }

  // 2. Brand impersonation rule (+50)
  for (const [brand] of Object.entries(knownBrands)) {
    if (domain.includes(brand)) {
      score += 50;
      reasons.push(`Possible impersonation of brand "${brand}"`);
    }
  }

  // 3. Suspicious TLD rule (+30)
  const lastDot = domain.lastIndexOf(".");
  if (lastDot !== -1) {
    const tld = domain.substring(lastDot);
    if (suspiciousTlds.includes(tld)) {
      score += 30;
      reasons.push(`Suspicious top-level domain (${tld})`);
    }
  }

  // 4. Promotional wording (+20)
  for (const word of promoWords) {
    if (domain.includes(word)) {
      score += 20;
      reasons.push(`Contains promotional keyword "${word}"`);
    }
  }

  // 5. Excessive hyphens (+15)
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    score += 15;
    reasons.push(`Unusual number of hyphens (${hyphenCount})`);
  }

  // Cap score at 100
  score = Math.min(score, 100);

  if (score === 0) {
    reasons.push("No immediate red flags detected based on initial heuristics.");
    reasons.push("Always verify payment details and reviews.");
  }

  renderResults(domain, score, reasons);
}

function renderResults(domain, score, reasons) {
  domainDisplay.textContent = domain;
  riskScoreText.textContent = score;

  riskBadge.className = "risk-badge";
  reasonsList.innerHTML = "";

  if (score <= 20) {
    riskBadge.classList.add("risk-low");
    riskLevelText.textContent = "🟢 LOW RISK";
  } else if (score <= 60) {
    riskBadge.classList.add("risk-med");
    riskLevelText.textContent = "🟡 SUSPICIOUS";
  } else {
    riskBadge.classList.add("risk-high");
    riskLevelText.textContent = "🔴 HIGH RISK";
  }

  reasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    reasonsList.appendChild(li);
  });

  resultCard.classList.remove("hidden");
}