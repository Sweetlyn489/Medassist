/**
 * Fictional demonstration clinical data for MediAssist.
 * ALL DATA IS SYNTHETIC AND DESIGNED STRICTLY FOR DEMONSTRATION PURPOSES.
 */

// High quality self-contained SVG medical imaging assets
const createSvgDataUrl = (title, subtitle, graphicType) => {
  let innerGraphic = '';

  if (graphicType === 'xray_chest') {
    innerGraphic = `
      <rect x="0" y="0" width="800" height="800" fill="#080a0f"/>
      <path d="M 400 120 L 400 680" stroke="#334155" stroke-width="2" stroke-dasharray="6 4"/>
      <!-- Rib cage silhouette -->
      <ellipse cx="400" cy="400" rx="260" ry="240" fill="none" stroke="#64748b" stroke-width="1.5" opacity="0.3"/>
      <path d="M 280 200 Q 400 240 520 200" fill="none" stroke="#94a3b8" stroke-width="12" opacity="0.6"/>
      <path d="M 240 260 Q 400 310 560 260" fill="none" stroke="#94a3b8" stroke-width="14" opacity="0.65"/>
      <path d="M 210 330 Q 400 380 590 330" fill="none" stroke="#94a3b8" stroke-width="16" opacity="0.7"/>
      <path d="M 200 410 Q 400 460 600 410" fill="none" stroke="#94a3b8" stroke-width="18" opacity="0.75"/>
      <path d="M 210 490 Q 400 540 590 490" fill="none" stroke="#94a3b8" stroke-width="18" opacity="0.7"/>
      <path d="M 240 570 Q 400 610 560 570" fill="none" stroke="#94a3b8" stroke-width="16" opacity="0.65"/>
      <!-- Spine -->
      <rect x="385" y="160" width="30" height="500" rx="6" fill="#cbd5e1" opacity="0.4"/>
      <!-- Clavicles -->
      <path d="M 200 180 Q 300 160 380 190" fill="none" stroke="#e2e8f0" stroke-width="14" opacity="0.8"/>
      <path d="M 600 180 Q 500 160 420 190" fill="none" stroke="#e2e8f0" stroke-width="14" opacity="0.8"/>
      <!-- Cardiac silhouette -->
      <path d="M 390 340 C 350 360 310 420 330 510 C 350 560 410 570 470 540 C 490 510 480 430 430 360 Z" fill="#f8fafc" opacity="0.7" filter="blur(6px)"/>
      <!-- Diaphragm -->
      <path d="M 160 620 Q 300 520 400 590 Q 500 520 640 620 L 640 700 L 160 700 Z" fill="#cbd5e1" opacity="0.85"/>
      <!-- Labels -->
      <text x="50" y="80" fill="#e2e8f0" font-family="monospace" font-size="20" font-weight="bold">R</text>
      <text x="740" y="80" fill="#e2e8f0" font-family="monospace" font-size="20" font-weight="bold">L</text>
      <text x="50" y="740" fill="#38bdf8" font-family="sans-serif" font-size="16">CHEST PA ERECT</text>
    `;
  } else if (graphicType === 'ecg') {
    innerGraphic = `
      <rect x="0" y="0" width="800" height="500" fill="#0c1322"/>
      <!-- Grid -->
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" stroke-width="0.5"/>
        </pattern>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#smallGrid)"/>
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" stroke-width="1.2"/>
        </pattern>
      </defs>
      <rect width="800" height="500" fill="url(#grid)" />
      <!-- Waveform Lead II -->
      <path d="
        M 20 250 L 80 250 
        Q 90 240 100 250 
        L 130 250 
        L 140 260 
        L 155 120 
        L 170 300 
        L 180 250 
        L 210 250 
        Q 235 210 260 250 
        L 320 250 
        Q 330 240 340 250 
        L 370 250 
        L 380 260 
        L 395 110 
        L 410 310 
        L 420 250 
        L 450 250 
        Q 475 210 500 250 
        L 560 250 
        Q 570 240 580 250 
        L 610 250 
        L 620 260 
        L 635 125 
        L 650 305 
        L 660 250 
        L 690 250 
        Q 715 210 740 250 
        L 780 250
      " fill="none" stroke="#10b981" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <text x="30" y="45" fill="#10b981" font-family="monospace" font-size="18" font-weight="bold">LEAD II · 25mm/s · 10mm/mV</text>
      <text x="30" y="70" fill="#94a3b8" font-family="monospace" font-size="14">HR: 84 bpm · PR: 156ms · QRS: 88ms · QTc: 412ms</text>
    `;
  } else if (graphicType === 'xray_knee') {
    innerGraphic = `
      <rect x="0" y="0" width="800" height="800" fill="#05070a"/>
      <!-- Femur -->
      <path d="M 330 50 L 330 360 C 330 410 280 430 260 470 C 290 490 350 490 370 460 C 390 460 410 460 430 460 C 450 490 510 490 540 470 C 520 430 470 410 470 360 L 470 50 Z" fill="#cbd5e1" opacity="0.75" filter="blur(2px)"/>
      <!-- Joint space gap -->
      <line x1="250" y1="500" x2="550" y2="500" stroke="#05070a" stroke-width="18"/>
      <!-- Tibia & Fibula -->
      <path d="M 280 520 C 300 510 380 510 400 530 L 400 780 L 330 780 L 330 550 C 310 540 290 530 280 520 Z" fill="#94a3b8" opacity="0.7" filter="blur(2px)"/>
      <path d="M 400 530 C 420 510 500 510 520 520 C 510 530 490 540 470 550 L 470 780 L 400 780 Z" fill="#cbd5e1" opacity="0.8" filter="blur(2px)"/>
      <!-- Patella -->
      <ellipse cx="400" cy="420" rx="55" ry="40" fill="#e2e8f0" opacity="0.85"/>
      <text x="50" y="80" fill="#e2e8f0" font-family="monospace" font-size="20" font-weight="bold">LEFT KNEE AP</text>
    `;
  } else if (graphicType === 'mri_brain') {
    innerGraphic = `
      <rect x="0" y="0" width="800" height="800" fill="#000000"/>
      <!-- Cranium outer outline -->
      <ellipse cx="400" cy="400" rx="270" ry="320" fill="#1e293b" opacity="0.4"/>
      <ellipse cx="400" cy="400" rx="255" ry="305" fill="#090d16" stroke="#475569" stroke-width="4"/>
      <!-- Brain parenchyma lobes -->
      <path d="M 400 130 C 270 130 190 260 190 400 C 190 540 280 660 400 660 C 520 660 610 540 610 400 C 610 260 530 130 400 130 Z" fill="#334155" opacity="0.75"/>
      <!-- Interhemispheric fissure -->
      <line x1="400" y1="130" x2="400" y2="660" stroke="#0f172a" stroke-width="4"/>
      <!-- Ventricles -->
      <path d="M 370 330 C 350 360 350 420 375 460 C 385 430 385 360 370 330 Z" fill="#020617"/>
      <path d="M 430 330 C 450 360 450 420 425 460 C 415 430 415 360 430 330 Z" fill="#020617"/>
      <!-- Gyri / Sulci texture -->
      <path d="M 260 280 Q 320 320 280 380 Q 240 440 280 500" fill="none" stroke="#1e293b" stroke-width="3" opacity="0.8"/>
      <path d="M 540 280 Q 480 320 520 380 Q 560 440 520 500" fill="none" stroke="#1e293b" stroke-width="3" opacity="0.8"/>
      <text x="50" y="70" fill="#93c5fd" font-family="monospace" font-size="16">AXIAL T2 / FLAIR</text>
      <text x="50" y="95" fill="#64748b" font-family="monospace" font-size="13">TE: 105ms · TR: 9000ms · FOV: 240mm</text>
    `;
  } else {
    // Ultrasound / Dermoscopy
    innerGraphic = `
      <rect x="0" y="0" width="800" height="600" fill="#080808"/>
      <!-- Sector cone -->
      <path d="M 400 60 L 160 540 A 380 380 0 0 0 640 540 Z" fill="#141a24" stroke="#283548" stroke-width="1.5"/>
      <ellipse cx="400" cy="360" rx="90" ry="60" fill="#2d3d52" opacity="0.8" filter="blur(8px)"/>
      <ellipse cx="430" cy="340" rx="35" ry="25" fill="#05080f" opacity="0.95"/>
      <text x="50" y="60" fill="#38bdf8" font-family="monospace" font-size="16">ULTRASOUND ABDOMINAL</text>
      <text x="50" y="85" fill="#64748b" font-family="monospace" font-size="13">Freq: 3.5MHz · Gain: 72% · Depth: 16cm</text>
    `;
  }

  // Watermark bar overlay
  const watermark = `
    <rect x="0" y="740" width="800" height="60" fill="#0f172a" opacity="0.92"/>
    <text x="400" y="775" fill="#f59e0b" font-family="sans-serif" font-weight="700" font-size="14" text-anchor="middle" letter-spacing="1.5">
      ⚠️ DEMONSTRATION RECORD — SYNTHETIC CLINICAL DATA ONLY
    </text>
    <text x="400" y="725" fill="#ffffff" font-family="sans-serif" font-weight="600" font-size="16" text-anchor="middle">
      ${title} · ${subtitle}
    </text>
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">${innerGraphic}${watermark}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const patients = [
  {
    firstName: 'Ananya',
    lastName: 'Rao',
    dateOfBirth: '1985-03-14',
    gender: 'Female',
    bloodGroup: 'B+',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=face',
    allergies: [{ substance: 'Penicillin', reaction: 'Diffuse erythematous maculopapular rash, pruritus', severity: 'Severe' }],
    medicalHistory: [
      { condition: 'Type 2 Diabetes Mellitus', diagnosedYear: 2018, notes: 'Non-insulin dependent, maintained on Metformin' },
      { condition: 'Essential Hypertension', diagnosedYear: 2020, notes: 'Stage 1, monitoring BP' },
    ],
    contact: { phone: '555-0112', email: 'ananya.rao@example-health.net', address: '142 Birchwood Lane, Suite 4' },
  },
  {
    firstName: 'Marcus',
    lastName: 'Webb',
    dateOfBirth: '1972-11-02',
    gender: 'Male',
    bloodGroup: 'O+',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Hypertension', diagnosedYear: 2015, notes: 'Suboptimally controlled on monotherapy' },
      { condition: 'Hyperlipidemia', diagnosedYear: 2019, notes: 'Elevated LDL-C' },
    ],
    contact: { phone: '555-0125', email: 'marcus.webb@example-health.net', address: '78 Oak Ridge Terrace' },
  },
  {
    firstName: 'Sofia',
    lastName: 'Alvarez',
    dateOfBirth: '1990-07-22',
    gender: 'Female',
    bloodGroup: 'A+',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=face',
    allergies: [{ substance: 'Sulfa drugs', reaction: 'Urticaria and facial swelling', severity: 'Moderate' }],
    medicalHistory: [
      { condition: 'Migraine without aura', diagnosedYear: 2017, notes: 'Recurrent unilateral throbbing headache' },
    ],
    contact: { phone: '555-0138', email: 'sofia.alvarez@example-health.net', address: '304 Maple Crescent' },
  },
  {
    firstName: 'Liam',
    lastName: "O'Connor",
    dateOfBirth: '1958-01-30',
    gender: 'Male',
    bloodGroup: 'A-',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Coronary Artery Disease', diagnosedYear: 2020, notes: 'Status post drug-eluting stent to LAD (2020)' },
      { condition: 'Atrial Fibrillation', diagnosedYear: 2021, notes: 'Paroxysmal, on oral anticoagulation' },
    ],
    contact: { phone: '555-0144', email: 'liam.oconnor@example-health.net', address: '512 Willow Brook Way' },
  },
  {
    firstName: 'David',
    lastName: 'Kim',
    dateOfBirth: '1979-05-17',
    gender: 'Male',
    bloodGroup: 'AB+',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Asthma', diagnosedYear: 2000, notes: 'Moderate persistent, exercise-induced triggers' },
    ],
    contact: { phone: '555-0160', email: 'david.kim@example-health.net', address: '89 Pine Grove Court' },
  },
  {
    firstName: 'Thomas',
    lastName: 'Novak',
    dateOfBirth: '1966-08-08',
    gender: 'Male',
    bloodGroup: 'O-',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop&crop=face',
    allergies: [{ substance: 'Aspirin', reaction: 'Gastric distress and heartburn', severity: 'Mild' }],
    medicalHistory: [
      { condition: 'Chronic Kidney Disease Stage 3a', diagnosedYear: 2021, notes: 'eGFR 52 mL/min, baseline creatinine 1.5' },
      { condition: 'Essential Hypertension', diagnosedYear: 2014, notes: 'Controlled' },
    ],
    contact: { phone: '555-0177', email: 'thomas.novak@example-health.net', address: '63 Highland Avenue' },
  },
  {
    firstName: 'Grace',
    lastName: 'Mensah',
    dateOfBirth: '1995-12-25',
    gender: 'Female',
    bloodGroup: 'B-',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Iron-deficiency Anemia', diagnosedYear: 2022, notes: 'Follow-up on ferritin & hemoglobin' },
    ],
    contact: { phone: '555-0182', email: 'grace.mensah@example-health.net', address: '124 Sycamore Lane' },
  },
  {
    firstName: 'James',
    lastName: 'Whitfield',
    dateOfBirth: '1950-10-04',
    gender: 'Male',
    bloodGroup: 'A+',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Congestive Heart Failure', diagnosedYear: 2017, notes: 'NYHA Class II, reduced ejection fraction (EF 40%)' },
      { condition: 'Type 2 Diabetes Mellitus', diagnosedYear: 2010, notes: 'Diabetic kidney disease risk' },
    ],
    contact: { phone: '555-0199', email: 'james.whitfield@example-health.net', address: '44 Harbor View Dr' },
  },
  {
    firstName: 'Robert',
    lastName: 'Sanders',
    dateOfBirth: '1962-04-27',
    gender: 'Male',
    bloodGroup: 'O+',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'COPD', diagnosedYear: 2016, notes: 'Chronic obstructive pulmonary disease, GOLD stage 2' },
    ],
    contact: { phone: '555-0211', email: 'robert.sanders@example-health.net', address: '98 Riverbed Road' },
  },
  {
    firstName: 'Fatima',
    lastName: 'Haidari',
    dateOfBirth: '1993-06-11',
    gender: 'Female',
    bloodGroup: 'AB-',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face',
    allergies: [{ substance: 'Shellfish', reaction: 'Anaphylaxis requiring epinephrine', severity: 'Severe' }],
    medicalHistory: [],
    contact: { phone: '555-0223', email: 'fatima.haidari@example-health.net', address: '221 Elmwood Terrace' },
  },
  {
    firstName: 'Samuel',
    lastName: 'Okafor',
    dateOfBirth: '1980-09-30',
    gender: 'Male',
    bloodGroup: 'B+',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&h=160&fit=crop&crop=face',
    allergies: [{ substance: 'Codeine', reaction: 'Nausea and dysphoria', severity: 'Mild' }],
    medicalHistory: [
      { condition: 'Gouty Arthritis', diagnosedYear: 2019, notes: 'Recurrent right 1st MTP joint flares' },
    ],
    contact: { phone: '555-0234', email: 'samuel.okafor@example-health.net', address: '37 Sunset Boulevard' },
  },
  {
    firstName: 'Hannah',
    lastName: 'Berg',
    dateOfBirth: '2004-03-03',
    gender: 'Female',
    bloodGroup: 'O+',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=face',
    allergies: [{ substance: 'Latex', reaction: 'Erythema and contact urticaria', severity: 'Mild' }],
    medicalHistory: [],
    contact: { phone: '555-0245', email: 'hannah.berg@example-health.net', address: '55 Valley Vista Court' },
  },
  {
    firstName: 'Charles',
    lastName: 'Dubois',
    dateOfBirth: '1955-07-07',
    gender: 'Male',
    bloodGroup: 'A+',
    avatarUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Hypertension', diagnosedYear: 2012, notes: 'Well-controlled' },
      { condition: 'Osteoarthritis', diagnosedYear: 2018, notes: 'Bilateral knee pain, worse on left' },
    ],
    contact: { phone: '555-0256', email: 'charles.dubois@example-health.net', address: '18 Heritage Plaza' },
  },
  {
    firstName: 'Mei',
    lastName: 'Lin',
    dateOfBirth: '1991-11-21',
    gender: 'Female',
    bloodGroup: 'O+',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Hypothyroidism', diagnosedYear: 2020, notes: 'Euthyroid on levothyroxine replacement' },
    ],
    contact: { phone: '555-0267', email: 'mei.lin@example-health.net', address: '710 Kensington Way' },
  },
  {
    firstName: 'Isabella',
    lastName: 'Conti',
    dateOfBirth: '1988-02-19',
    gender: 'Female',
    bloodGroup: 'A-',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [
      { condition: 'Atypical Dysplastic Nevus', diagnosedYear: 2023, notes: 'Dermatology surveillance scheduled' },
    ],
    contact: { phone: '555-0278', email: 'isabella.conti@example-health.net', address: '93 Cloverhill Drive' },
  },
  {
    firstName: 'Emily',
    lastName: 'Tran',
    dateOfBirth: '1997-01-13',
    gender: 'Female',
    bloodGroup: 'B+',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&h=160&fit=crop&crop=face',
    allergies: [],
    medicalHistory: [],
    contact: { phone: '555-0289', email: 'emily.tran@example-health.net', address: '408 Parkview Way' },
  },
];

module.exports = {
  createSvgDataUrl,
  patients,
};
