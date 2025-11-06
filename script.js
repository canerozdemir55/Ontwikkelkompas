const DOMAINS = [
    { key: 'cognitief', label: 'Cognitief', icon: '🧠' },
    { key: 'motorisch', label: 'Motorisch', icon: '✋' },
    { key: 'sociaal', label: 'Sociaal-emotioneel', icon: '❤️' },
    { key: 'werkhouding', label: 'Werkhouding', icon: '🧩' },
    { key: 'zelfredzaamheid', label: 'Zelfredzaamheid', icon: '🕊️' },
];

const childForm = document.querySelector('#child-form');
const childNameInput = document.querySelector('#child-name');
const sliderFields = Array.from(document.querySelectorAll('.slider-field'));
const previewName = document.querySelector('#preview-name');
const previewStats = document.querySelector('#preview-stats');
const previewCard = document.querySelector('#preview-card');
const childList = document.querySelector('#child-list');
const navToggle = document.querySelector('#nav-toggle');
const navLinks = document.querySelectorAll('.nav__links a');
const footerYear = document.querySelector('#year');
const contactForm = document.querySelector('.contact__form');
const downloadZipBtn = document.querySelector('#download-zip-btn');

const createId = () => {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return `child-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const sampleChildren = [
    {
        id: createId(),
        name: 'Ava',
        scores: {
            cognitief: 6,
            motorisch: 5,
            sociaal: 6,
            werkhouding: 5,
            zelfredzaamheid: 6,
        },
    },
    {
        id: createId(),
        name: 'Noah',
        scores: {
            cognitief: 4,
            motorisch: 3,
            sociaal: 5,
            werkhouding: 4,
            zelfredzaamheid: 4,
        },
    },
];

let children = [...sampleChildren];
let previewData = {
    name: 'Nieuw kind',
    scores: sliderFields.reduce((acc, field) => {
        const range = field.querySelector('input[type="range"]');
        acc[field.dataset.domain] = Number(range.value);
        return acc;
    }, {}),
};

function groupLabel(value) {
    return `Groep ${value}`;
}

function setSliderValue(field, value) {
    const label = field.querySelector('.slider-value');
    if (label) {
        label.textContent = groupLabel(value);
    }
}

function renderPreview() {
    previewName.textContent = previewData.name;
    previewStats.innerHTML = DOMAINS.map((domain) => {
        const value = previewData.scores[domain.key];
        const percentage = (value - 1) / 7;
        const fill = Math.max(0.1, percentage);
        return `
            <li class="profile-stat">
                <div class="profile-stat__meta">
                    <span>${domain.icon} ${domain.label}</span>
                    <span>${groupLabel(value)}</span>
                </div>
                <div class="profile-bar" role="presentation">
                    <div class="profile-bar__fill" style="--fill: ${fill}"></div>
                </div>
            </li>
        `;
    }).join('');

    previewCard.classList.remove('profile-card--animate');
    requestAnimationFrame(() => {
        previewCard.classList.add('profile-card--animate');
    });
}

function renderChildList() {
    if (!childList) return;
    if (!children.length) {
        childList.innerHTML = '<p>Er zijn nog geen profielen opgeslagen.</p>';
        return;
    }

    childList.innerHTML = children.map((child) => {
        const stats = DOMAINS.map((domain) => {
            const value = child.scores[domain.key];
            return `<li>${domain.icon} ${domain.label}: <strong>${groupLabel(value)}</strong></li>`;
        }).join('');

        return `
            <article class="child-card" data-id="${child.id}">
                <h4>${child.name}</h4>
                <ul>${stats}</ul>
            </article>
        `;
    }).join('');
}

function updatePreviewFromSliders() {
    sliderFields.forEach((field) => {
        const range = field.querySelector('input[type="range"]');
        setSliderValue(field, range.value);
        previewData.scores[field.dataset.domain] = Number(range.value);
    });
    renderPreview();
}

sliderFields.forEach((field) => {
    const range = field.querySelector('input[type="range"]');
    setSliderValue(field, range.value);
    range.addEventListener('input', (event) => {
        const value = Number(event.target.value);
        setSliderValue(field, value);
        previewData.scores[field.dataset.domain] = value;
        renderPreview();
    });
});

childForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(childForm);
    const name = formData.get('childName').trim();
    if (!name) {
        childNameInput.focus();
        return;
    }

    const scores = DOMAINS.reduce((acc, domain) => {
        acc[domain.key] = Number(formData.get(domain.key));
        return acc;
    }, {});

    const newChild = {
        id: createId(),
        name,
        scores,
    };

    children = [newChild, ...children];
    renderChildList();

    childForm.reset();
    sliderFields.forEach((field) => {
        const range = field.querySelector('input[type="range"]');
        const defaultValue = range.defaultValue || 4;
        range.value = defaultValue;
        setSliderValue(field, defaultValue);
    });

    previewData = {
        name: 'Nieuw kind',
        scores: sliderFields.reduce((acc, field) => {
            const range = field.querySelector('input[type="range"]');
            acc[field.dataset.domain] = Number(range.value);
            return acc;
        }, {}),
    };
    previewName.textContent = previewData.name;
    renderPreview();
});

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        if (navToggle.checked) {
            navToggle.checked = false;
        }
    });
});

if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        contactForm.reset();
        const existing = contactForm.parentElement.querySelector('.contact__confirmation');
        if (existing) {
            existing.remove();
        }
        const message = document.createElement('p');
        message.className = 'contact__confirmation';
        message.textContent = 'Bedankt! We nemen zo snel mogelijk contact met je op.';
        contactForm.parentElement.appendChild(message);
        setTimeout(() => {
            message.remove();
        }, 5000);
    });
}

if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
}

async function downloadWebsiteZip(button) {
    if (!window.JSZip || !window.saveAs) {
        console.error('Downloadfunctionaliteit niet beschikbaar.');
        return;
    }

    const files = [
        { path: 'index.html', name: 'index.html' },
        { path: 'style.css', name: 'style.css' },
        { path: 'script.js', name: 'script.js' },
    ];

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Voorbereiden…';

    try {
        const zip = new JSZip();

        const contents = await Promise.all(files.map(async (file) => {
            const response = await fetch(file.path, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Kon ${file.path} niet laden`);
            }
            return response.text();
        }));

        contents.forEach((content, index) => {
            zip.file(files[index].name, content);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, 'ontwikkelkompas-website.zip');
        button.textContent = 'Download gestart!';
    } catch (error) {
        console.error(error);
        button.textContent = 'Download mislukt';
    } finally {
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2500);
    }
}

if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', () => downloadWebsiteZip(downloadZipBtn));
}

renderChildList();
updatePreviewFromSliders();