// GTM dataLayer
window.dataLayer = window.dataLayer || [];

// Helpers
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// Theme
const root = document.documentElement;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let theme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', theme);

const updateTheme = () => {
  const isDark = theme === 'dark';
  document.getElementById('themeIcon').textContent = isDark ? '🌙' : '☀️';
  document.getElementById('themeLabel').textContent = isDark ? 'Dark' : 'Light';
};
updateTheme();

$('#themeToggle').addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateTheme();
  window.dataLayer.push({ event: 'theme_toggle', theme_mode: theme });
});

// Tab System
const tabs = $$('[role="tab"]');
const panels = $$('[role="tabpanel"]');
const tabNames = {
  'panel-home': 'Home',
  'panel-aiml': 'AI/ML/GenAI',
  'panel-devops': 'DevOps Engineer',
  'panel-projects': 'Projects',
  'panel-blog': 'Blog',
  'panel-resume': 'Resume',
  'panel-pubs': 'Publications',
  'panel-knfl': 'KNFL'
};

const setTitle = (panelId) => {
  document.title = `${tabNames[panelId] || 'Home'} – Dr. Shikhar Bhardwaj`;
};

const activateTab = (btn) => {
  tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
  panels.forEach(p => p.hidden = true);

  if (!btn) return;

  btn.setAttribute('aria-selected', 'true');
  const id = btn.dataset.target;
  const panel = $(`#${id}`);
  if (panel) {
    panel.hidden = false;
    panel.focus();
    window.location.hash = id;
    setTitle(id);
  }

  window.dataLayer.push({ event: 'tab_view', tab_name: id });

  if (id === 'panel-resume') loadResume();
  if (id === 'panel-pubs') buildPubs();
};

const initTabFromHash = () => {
  const hash = window.location.hash.slice(1);
  const tab = $(`[data-target="${hash}"]`);
  if (tab) {
    activateTab(tab);
  } else {
    const defaultTab = $('.tab[aria-selected="true"]');
    if (defaultTab) activateTab(defaultTab);
    else setTitle('panel-home');
  }
};

$('.tabs').addEventListener('click', e => {
  const btn = e.target.closest('[role="tab"]');
  if (btn) activateTab(btn);
});

window.addEventListener('hashchange', initTabFromHash);
initTabFromHash();

// Outbound Link Tracking
document.addEventListener('click', e => {
  const el = e.target.closest('[data-gtm-event]');
  if (el) {
    const event = el.dataset.gtmEvent;
    const label = el.dataset.gtmLabel || el.href || el.textContent;
    window.dataLayer.push({ event, link_label: label });
  }
});

// Publications
const pubs = [
  {
    title: "There is Mathematics for That! : A Formal Verification of Privacy and Simulative Analysis of Consumer-Centric Content Delivery in IoT",
    authors: "Shikhar Bhardwaj, Sandeep Harit, Shilpa",
    year: 2025,
    venue: "Transactions on Emerging Telecommunications Technologies (SCIE)",
    url: "https://onlinelibrary.wiley.com/doi/10.1002/ett.70059"
  },
  {
    title: "Towards a software-defined networking model for consumer-centric content delivery network for IoT",
    authors: "Shikhar Bhardwaj, Sandeep Harit, Anil Yadav",
    year: 2023,
    venue: "Transactions on Emerging Telecommunications Technologies (SCIE)",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/ett.4903"
  },
  {
    title: "Message Queuing Telemetry Transport - Secure Connection: A Power-efficient Secure Communication",
    authors: "Shikhar Bhardwaj, Sandeep Harit, Shilpa, Darpan Anand",
    year: 2023,
    venue: "International Journal of Sensor Networks (IJSN SCIE)",
    url: "https://doi.org/10.1504/IJSNET.2023.131246"
  },
  {
    title: "SDN-Enabled Secure IoT Architecture Development: A Review",
    authors: "Bhardwaj S., Harit S.",
    year: 2022,
    venue: "Inventive Communication and Computational Technologies (ICICCT). Lecture Notes in Networks and Systems, vol 311. Springer",
    url: "https://doi.org/10.1007/978-981-16-5529-6_47"
  },
  {
    title: "Traceability of Unwitting Disclosure Using Explainable Correlation in Procurement and Supply Chain",
    authors: "Gunjal, H.V.; Ingale, V.; Bhardwaj, S.; Belokar, R.M.",
    year: 2023,
    venue: "Applications of Emerging Technologies and AI/ML Algorithms. ICDAPS 2022. Asset Analytics. Springer",
    url: "https://doi.org/10.1007/978-981-99-1019-9_35"
  },
  {
    title: "Stacking Ensemble-based Automatic Web Page Classification",
    authors: "D. Deeksha, R. Bhatia, S. Bhardwaj, M. Kumar, K. Bhatia and S. S. Gill",
    year: 2021,
    venue: "Fourth International Conference on Computational Intelligence and Communication Technologies (CCICT), IEEE",
    url: "https://doi.org/10.1109/CCICT53244.2021.00042"
  }
];

function buildPubs() {
  const container = $('#pubs-list');
  if (container.children.length > 0) return;

  pubs.forEach(p => {
    const url = p.url.trim();
    const details = document.createElement('details');
    details.innerHTML = `
      <summary class="acc-h" style="list-style:none;cursor:pointer;padding:12px;background:var(--glass);border:1px solid rgba(255,255,255,0.03);border-radius:8px;margin-bottom:8px;">
        <div class="pub-title">${p.title}</div>
        <div class="pub-authors">${p.authors} (${p.year})</div>
      </summary>
      <div class="pub-venue" style="padding:12px;">${p.venue}</div>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="pub-link"
         onclick="window.dataLayer.push({event:'publication_click',publication_title:'${p.title.replace(/'/g,"\\\\'")}',publication_url:'${url}'});return true;">
        View publication
      </a>
    `;
    container.appendChild(details);
  });
}

// Resume
function loadResume() {
  const container = $('#resumeContainer');
  if (container.querySelector('embed')) return;

  container.innerHTML = '<div class="loader"></div><div class="pdf-loading">Loading resume...</div>';

  setTimeout(() => {
    const embed = document.createElement('embed');
    embed.src = 'resume.pdf';
    embed.type = 'application/pdf';
    embed.style.width = '100%';
    embed.style.height = '70vh';
    embed.setAttribute('aria-label', 'Resume PDF document');

    let loaded = false;
    embed.onload = () => { loaded = true; };
    embed.onerror = embed.onabort = () => {
      if (!loaded) {
        container.innerHTML = `
          <p class="muted" style="text-align:center;padding:40px;">
            Unable to load resume. Please <a href="resume.pdf" download style="color:var(--accent)">download the PDF</a>.
          </p>
        `;
      }
    };

    container.innerHTML = '';
    container.appendChild(embed);
  }, 500);
}

// KNFL Game
const rollBtn = $('#knfl-roll');
if (rollBtn) {
  rollBtn.onclick = () => {
    const dice = Array(5).fill().map(() => Math.floor(Math.random() * 6) + 1);
    const diceEl = $('#knfl-dice');
    diceEl.innerHTML = dice.map(n =>
      `<div class="dice" role="img" aria-label="Die showing ${n}">${n}</div>`
    ).join('');

    const sorted = [...dice].sort();
    const uniq = [...new Set(sorted)];
    const knfl = sorted.every(x => x === sorted[0]);

    let maxSeq = 1, curSeq = 1;
    for (let i = 1; i < uniq.length; i++) {
      if (uniq[i] === uniq[i-1] + 1) {
        curSeq++;
        maxSeq = Math.max(maxSeq, curSeq);
      } else curSeq = 1;
    }
    const bigStreet = maxSeq >= 5;
    const lilStreet = maxSeq >= 4 && !bigStreet;

    const counts = {};
    sorted.forEach(x => counts[x] = (counts[x] || 0) + 1);
    const freqs = Object.values(counts).sort((a,b) => b - a);
    const fullHouse = freqs.length === 2 && freqs[0] === 3 && freqs[1] === 2;

    let result, points;
    if (knfl) { result = 'KNFL'; points = 500; }
    else if (bigStreet) { result = 'Big street'; points = 40; }
    else if (lilStreet) { result = "Lil' street"; points = 30; }
    else if (fullHouse) { result = 'Fullhouse'; points = 25; }
    else {
      const bestVal = Object.keys(counts).reduce((a,b) => counts[a] > counts[b] ? a : b);
      const bestCount = counts[bestVal];
      points = bestVal * bestCount;
      result = `Stack (${bestCount}) of ${bestVal}`;
    }

    $('#knfl-score').textContent = `${result} — ${points} pts`;
    window.dataLayer.push({ event: 'knfl_roll', result, points });
  };
}
