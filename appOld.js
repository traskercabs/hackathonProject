const knownBrands = {
  flipkart: "flipkart.com",
  amazon: "amazon.in",
  meesho: "meesho.com",
  myntra: "myntra.com",
  paypal: "paypal.com"
};

const suspiciousTlds = [
  ".xyz", ".top", ".click", ".shop", ".site",
  ".vip", ".online", ".store", ".cc"
];

const promoWords = [
  "sale", "offer", "discount", "deal", "cheap", "free"
];

const phishingWords = [
  "login", "verify", "secure", "update",
  "banking", "kyc", "signin", "wallet"
];

// Common number-to-letter visual substitutes
const lookalikes = {
  "0": "o",
  "1": "l",
  "3": "e",
  "4": "a",
  "5": "s",
  "@": "a"
};

const urlInput = document.getElementById("url-input");
const scanBtn = document.getElementById("scan-btn");
const resultCard = document.getElementById("result-card");
const domainDisplay = document.getElementById("domain-display");
const riskBadge = document.getElementById("risk-badge");
const riskLevelText = document.getElementById("risk-level");
const riskScoreText = document.getElementById("risk-score");
const reasonsList = document.getElementById("reasons-list");
const quickChips = document.querySelectorAll(".chip");

scanBtn.addEventListener("click", handleScan);

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleScan();
});

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

function extractDomain(input) {
  let cleaned = input.toLowerCase();

  if (
    !cleaned.startsWith("http://") &&
    !cleaned.startsWith("https://")
  ) {
    cleaned = "https://" + cleaned;
  }

  try {
    const parsed = new URL(cleaned);

    return parsed.hostname
      .replace(/^www\./, "");
  } catch (err) {
    return input
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
  }
}

function analyzeRisk(domain) {
  let score = 0;
  let reasons = [];

  // 1. Exact Official Domain check
  for (const [, officialDomain] of Object.entries(knownBrands)) {
    if (domain === officialDomain) {
      renderResults(domain, 0, [
        "Recognized official brand domain."
      ]);
      return;
    }
  }

  // 2. Subdomain Camouflage
  for (const [, officialDomain] of Object.entries(knownBrands)) {
    if (
      domain.includes(officialDomain) &&
      !domain.endsWith(officialDomain)
    ) {
      score += 70;
      reasons.push(
        `Subdomain trick: disguised as "${officialDomain}".`
      );
    }
  }

  // 3. Typosquatting / Leetspeak
  let normalizedDomain = domain;

  for (const [char, replacement] of Object.entries(lookalikes)) {
    normalizedDomain = normalizedDomain.replaceAll(
      char,
      replacement
    );
  }

  for (const [brand] of Object.entries(knownBrands)) {
    if (
      normalizedDomain.includes(brand) &&
      !domain.includes(brand)
    ) {
      score += 65;

      reasons.push(
        `Lookalike/Typosquatting detected: resembles brand "${brand}".`
      );
    }
  }

  // 4. Unofficial Brand usage
  for (const [brand] of Object.entries(knownBrands)) {
    if (domain.includes(brand)) {
      score += 45;

      reasons.push(
        `Brand name "${brand}" found in an unverified domain.`
      );
    }
  }

  // 5. Suspicious Top-Level Domains
  const lastDot = domain.lastIndexOf(".");

  if (lastDot !== -1) {
    const tld = domain.substring(lastDot);

    if (suspiciousTlds.includes(tld)) {
      score += 30;

      reasons.push(
        `Uses a high-risk TLD (${tld}).`
      );
    }
  }

  // 6. Sensitive Action & Phishing Keywords
  for (const word of phishingWords) {
    if (domain.includes(word)) {
      score += 25;

      reasons.push(
        `Contains high-risk credential/security keyword: "${word}".`
      );
    }
  }

  // 7. Promotional Keywords
  for (const word of promoWords) {
    if (domain.includes(word)) {
      score += 15;

      reasons.push(
        `Contains promotional keyword: "${word}".`
      );
    }
  }

  // 8. Excessive Subdomain / Hyphen Chaining
  const dotCount = (domain.match(/\./g) || []).length;
  const hyphenCount = (domain.match(/-/g) || []).length;

  if (dotCount >= 3 || hyphenCount >= 3) {
    score += 20;

    reasons.push(
      "Suspiciously complex domain structure (excessive dots/hyphens)."
    );
  }

  // 9. Abnormal Domain Length
  if (domain.length > 30) {
    score += 15;

    reasons.push(
      "Unusually long domain name."
    );
  }

  // 10. Punycode Detection
  if (domain.includes("xn--")) {
    score += 40;

    reasons.push(
      "Domain uses Punycode, which may indicate a Unicode lookalike attack."
    );
  }

  score = Math.min(score, 100);

  if (score === 0) {
    reasons.push("No obvious red flags detected.");

    reasons.push(
      "Always verify checkout pages before entering payment details."
    );
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

