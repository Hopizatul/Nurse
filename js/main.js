// ============================================
// MAIN JS - WEB KEPERAWATAN S1
// ============================================

// === NAVBAR SCROLL ===
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// === HAMBURGER MENU ===
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
}

// Mark active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// === SCROLL ANIMATION (AOS-like) ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
    }
  });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

// === ACCORDION / MATERI SECTIONS ===
document.querySelectorAll('.materi-section-header').forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const arrow = header.querySelector('.accordion-arrow');
    const isOpen = body.classList.contains('open');

    // Close all
    document.querySelectorAll('.materi-section-body').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.materi-section-header').forEach(h => {
      h.classList.remove('active');
      const a = h.querySelector('.accordion-arrow');
      if (a) a.classList.remove('open');
    });

    if (!isOpen) {
      body.classList.add('open');
      header.classList.add('active');
      if (arrow) arrow.classList.add('open');

      // Smooth scroll to section
      setTimeout(() => {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });
});

// Open first section by default
const firstSection = document.querySelector('.materi-section-header');
if (firstSection) {
  firstSection.click();
}

// === SIDEBAR NAVIGATION ===
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      // Expand the section
      const header = targetSection.querySelector('.materi-section-header');
      if (header) {
        const body = header.nextElementSibling;
        if (!body.classList.contains('open')) header.click();
      }
    }

    // Update active sidebar link
    document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// === COUNTER ANIMATION ===
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      element.textContent = target + (element.dataset.suffix || '');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start) + (element.dataset.suffix || '');
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      const target = parseInt(entry.target.dataset.target);
      animateCounter(entry.target, target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

// === EKG ANIMATION (Canvas) ===
function drawEKG(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  let x = 0;
  const speed = 3;
  const midY = H / 2;

  function ekgPath(px) {
    const cycle = W / 2;
    const pos = px % cycle;
    if (pos < cycle * 0.3) return midY;
    if (pos < cycle * 0.35) return midY - 5;
    if (pos < cycle * 0.38) return midY + 10;
    if (pos < cycle * 0.42) return midY - 40;
    if (pos < cycle * 0.46) return midY + 20;
    if (pos < cycle * 0.50) return midY - 5;
    if (pos < cycle * 0.55) return midY - 15;
    if (pos < cycle * 0.60) return midY;
    return midY;
  }

  const trail = [];

  function animate() {
    ctx.clearRect(0, 0, W, H);
    trail.push({ x, y: ekgPath(x) });
    if (trail.length > W) trail.shift();

    ctx.beginPath();
    ctx.strokeStyle = '#1A56DB';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#1A56DB';

    trail.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x % W, pt.y);
      else ctx.lineTo(pt.x % W, pt.y);
    });
    ctx.stroke();

    // Glowing dot at current position
    ctx.beginPath();
    ctx.arc(x % W, ekgPath(x), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#34D399';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#34D399';
    ctx.fill();

    x += speed;
    if (x > W * 2) x = 0;
    requestAnimationFrame(animate);
  }

  animate();
}

drawEKG('ekg-canvas');

// ============================================
// QUIZ ENGINE
// ============================================

const QUIZ_DATA = {
  dasar: [
    {
      question: "Jantung manusia terdiri dari berapa ruang?",
      options: ["2 ruang (atrium kanan dan kiri)", "3 ruang (2 atrium, 1 ventrikel)", "4 ruang (2 atrium, 2 ventrikel)", "5 ruang (3 atrium, 2 ventrikel)"],
      correct: 2,
      explanation: "Jantung manusia terdiri dari 4 ruang: Atrium kanan (dekstra), Atrium kiri (sinistra), Ventrikel kanan, dan Ventrikel kiri. Setiap ruang dipisahkan oleh septum dan katup jantung."
    },
    {
      question: "Organ utama yang berfungsi sebagai tempat pertukaran gas O₂ dan CO₂ adalah?",
      options: ["Jantung", "Hati (Hepar)", "Paru-paru (Pulmo)", "Ginjal (Ren)"],
      correct: 2,
      explanation: "Paru-paru (pulmo) adalah organ utama sistem pernapasan. Pertukaran gas terjadi di alveoli — O₂ masuk ke kapiler darah, CO₂ dikeluarkan ke udara alveoli untuk diekspirasi."
    },
    {
      question: "Nilai normal tekanan darah pada orang dewasa menurut WHO adalah?",
      options: ["100/60 mmHg", "120/80 mmHg", "140/90 mmHg", "160/100 mmHg"],
      correct: 1,
      explanation: "Tekanan darah normal orang dewasa adalah 120/80 mmHg (sistolik/diastolik). Nilai sistolik antara 120-129 mmHg disebut 'elevated', ≥130/80 mmHg dikatakan hipertensi."
    },
    {
      question: "Berapa jumlah tulang pada tubuh manusia dewasa?",
      options: ["186 tulang", "196 tulang", "206 tulang", "226 tulang"],
      correct: 2,
      explanation: "Tubuh manusia dewasa memiliki 206 tulang. Saat lahir, manusia memiliki sekitar 270-300 tulang yang berangsur menyatu (fusi) seiring pertumbuhan hingga dewasa."
    },
    {
      question: "Komponen darah yang berperan dalam proses pembekuan darah (hemostasis) adalah?",
      options: ["Eritrosit (sel darah merah)", "Leukosit (sel darah putih)", "Trombosit (platelet)", "Plasma darah"],
      correct: 2,
      explanation: "Trombosit (platelet) berperan dalam hemostasis. Nilai normal trombosit: 150.000-400.000/μL. Jika <150.000 disebut trombositopenia, jika >400.000 disebut trombositosis."
    },
    {
      question: "Bagian otak yang mengatur keseimbangan dan koordinasi gerak tubuh adalah?",
      options: ["Serebrum (otak besar)", "Serebelum (otak kecil)", "Batang otak (brainstem)", "Hipotalamus"],
      correct: 1,
      explanation: "Serebelum (otak kecil) terletak di bagian posterior fosa kranialis. Fungsinya mengatur koordinasi gerak, keseimbangan, dan postur tubuh. Kerusakan serebelum menyebabkan ataksia."
    },
    {
      question: "Nilai normal saturasi oksigen (SpO₂) pada orang dewasa sehat adalah?",
      options: ["85-90%", "90-94%", "95-100%", "100-105%"],
      correct: 2,
      explanation: "SpO₂ normal adalah 95-100%. SpO₂ 90-94% = hipoksemia ringan-sedang (perlu oksigenasi). SpO₂ <90% = hipoksemia berat (kondisi darurat). SpO₂ diukur dengan pulse oximeter."
    },
    {
      question: "Lapisan terluar kulit manusia yang berfungsi sebagai pelindung disebut?",
      options: ["Dermis", "Epidermis", "Hipodermis", "Subdermis"],
      correct: 1,
      explanation: "Epidermis adalah lapisan kulit terluar, terdiri dari keratinosit yang mengalami keratinisasi. Di bawahnya terdapat dermis (mengandung kelenjar, folikel rambut) dan hipodermis (lemak subkutan)."
    },
    {
      question: "Arteri terbesar dalam tubuh manusia yang keluar dari ventrikel kiri adalah?",
      options: ["Arteri pulmonalis", "Arteri koronaria", "Aorta", "Arteri renalis"],
      correct: 2,
      explanation: "Aorta adalah arteri terbesar dalam tubuh, diameter ±2-3 cm. Dimulai dari ventrikel kiri, lalu membentuk arcus aorta, aorta descendens, dan bercabang ke seluruh tubuh."
    },
    {
      question: "Cairan serebrospinal (CSF) diproduksi oleh?",
      options: ["Dura mater", "Pleksus koroid di ventrikel otak", "Sel-sel saraf (neuron)", "Kelenjar hipofisis"],
      correct: 1,
      explanation: "CSF (liquor cerebrospinalis) diproduksi oleh pleksus koroid di ventrikel lateral, ventrikel III, dan ventrikel IV. Volume normal CSF sekitar 150 mL. Fungsinya melindungi otak dan korda spinalis."
    }
  ],
  menengah: [
    {
      question: "Prinsip 'FIVE RIGHTS' (5 Benar) dalam pemberian obat yang aman adalah?",
      options: ["Benar Obat, Dosis, Rute, Waktu, Pasien", "Benar Obat, Dosis, Rute, Waktu, Dokter", "Benar Obat, Dosis, Waktu, Pasien, Perawat", "Benar Obat, Dosis, Rute, Pasien, Ruangan"],
      correct: 0,
      explanation: "Five Rights: (1) Benar Pasien — identifikasi 2 identitas, (2) Benar Obat — cek nama generik/dagang, (3) Benar Dosis — hitung dosis sesuai resep, (4) Benar Waktu — frekuensi pemberian, (5) Benar Rute — oral, IV, IM, SC, dll."
    },
    {
      question: "Nilai GCS (Glasgow Coma Scale) normal pada orang dewasa adalah?",
      options: ["10", "12", "13", "15"],
      correct: 3,
      explanation: "GCS maksimal = 15, terdiri dari: Eye Opening (E) max 4, Verbal Response (V) max 5, Motor Response (M) max 6. GCS 13-15 = cedera ringan, 9-12 = sedang, 3-8 = berat (koma). GCS <8 = indikasi intubasi."
    },
    {
      question: "Posisi yang dianjurkan untuk pasien dengan sesak napas (dyspnea) adalah?",
      options: ["Supinasi (terlentang datar)", "Pronasi (tengkurap)", "Posisi Fowler (30-90°)", "Posisi Trendelenburg"],
      correct: 2,
      explanation: "Posisi Fowler (30-90°) mengoptimalkan ekspansi paru dengan gravitasi menurunkan diafragma. Semi-Fowler (30-45°) untuk pasien post-operasi, Fowler penuh (90°) untuk edema paru akut."
    },
    {
      question: "Frekuensi napas (RR) normal pada orang dewasa adalah?",
      options: ["8-12 x/menit", "12-20 x/menit", "20-30 x/menit", "30-40 x/menit"],
      correct: 1,
      explanation: "RR normal dewasa: 12-20 x/menit. RR <12 = bradipnea (overdosis opioid, dll). RR >20 = takipnea (infeksi, asidosis, nyeri). RR >30 sangat mengkhawatirkan. Pada bayi baru lahir RR normal 40-60 x/menit."
    },
    {
      question: "Tanda dan gejala hipoglikemia yang perlu dikenali perawat adalah?",
      options: ["Poliuria, polidipsia, polifagia", "Keringat dingin, gemetar, pusing, lapar", "Sesak napas, nyeri dada, palpitasi", "Mual, muntah, nyeri perut"],
      correct: 1,
      explanation: "Hipoglikemia (GDS <70 mg/dL): gejala adrenergik — keringat dingin, gemetar, palpitasi, gelisah; gejala neuroglikopenik — pusing, sakit kepala, pandangan kabur, konfusi, kejang, koma jika berat. Tindakan: 15 g glukosa oral atau D40% IV."
    },
    {
      question: "Golongan obat antihipertensi ACE Inhibitor bekerja dengan cara?",
      options: ["Memblok reseptor beta-adrenergik", "Menghambat enzim pengubah angiotensin I → II", "Memblok kanal kalsium pada pembuluh darah", "Meningkatkan ekskresi natrium di ginjal"],
      correct: 1,
      explanation: "ACE Inhibitor (captopril, lisinopril, ramipril) menghambat enzim ACE sehingga angiotensin I tidak diubah menjadi angiotensin II (vasokonstriktor kuat), mengakibatkan vasodilatasi dan penurunan tekanan darah. Efek samping khas: batuk kering."
    },
    {
      question: "Suhu tubuh manusia dewasa yang dikategorikan demam (febris) adalah?",
      options: ["Suhu > 36.5°C", "Suhu > 37.0°C", "Suhu > 37.5°C", "Suhu > 39.0°C"],
      correct: 2,
      explanation: "Demam (febris) didefinisikan jika suhu tubuh > 37.5°C (aksila) atau > 38°C (rektal/oral). Subfebris: 37.5-38.5°C. Febris: 38.5-40°C. Hiperpireksia: >40°C (kondisi darurat). Normal aksila: 36-37.2°C."
    },
    {
      question: "Tanda-tanda vital (TTV) standar yang wajib diukur perawat meliputi?",
      options: ["Tekanan Darah, Nadi, Suhu, Frekuensi Napas", "Tekanan Darah, Nadi, SpO₂, Berat Badan", "Suhu, Berat Badan, Tinggi Badan, GDS", "Nadi, SpO₂, GCS, Frekuensi Napas"],
      correct: 0,
      explanation: "TTV dasar: (1) Tekanan Darah/TD, (2) Nadi/HR, (3) Suhu/T, (4) Frekuensi Napas/RR. Beberapa fasilitas menambahkan SpO₂ sebagai TTV ke-5. TTV adalah indikator pertama kondisi hemodinamik pasien."
    },
    {
      question: "Dalam pemasangan infus IV, urutan langkah yang benar adalah?",
      options: ["Pungsi vena → tourniquet → antiseptik → fiksasi", "Tourniquet → antiseptik → pungsi vena → fiksasi → sambung selang", "Antiseptik → tourniquet → pungsi vena → fiksasi", "Tourniquet → pungsi vena → antiseptik → fiksasi"],
      correct: 1,
      explanation: "Prosedur IV line: informed consent → persiapan alat → pilih vena → pasang tourniquet 10-15 cm di proksimal → disinfeksi dengan alkohol swab sirkular → pungsi vena sudut 15-30° → cabut tourniquet → sambung selang infus → fiksasi → atur tetesan."
    },
    {
      question: "Prinsip sterilisasi menggunakan autoklaf pada alat kesehatan adalah?",
      options: ["Radiasi sinar ultraviolet (UV)", "Gas etilen oksida (EtO)", "Uap air panas bertekanan (121°C, 15 psi)", "Larutan glutaraldehid 2%"],
      correct: 2,
      explanation: "Autoklaf (Steam Sterilization) menggunakan uap air jenuh bertekanan: 121°C selama 15-20 menit pada 15 psi (atau 134°C selama 3-4 menit). Membunuh semua mikroorganisme termasuk spora. Digunakan untuk instrumen tahan panas dan tekanan."
    }
  ],
  tinggi: [
    {
      question: "Nilai APGAR score yang menunjukkan kondisi neonatus baik/normal adalah?",
      options: ["0-3 (buruk, perlu resusitasi segera)", "4-6 (sedang, perlu stimulasi)", "7-10 (baik/normal)", "11-12 (sangat baik)"],
      correct: 2,
      explanation: "APGAR dinilai menit ke-1 dan ke-5. 5 komponen: Appearance (warna kulit), Pulse (detak jantung), Grimace (refleks), Activity (tonus otot), Respiration (pernapasan). Skor 7-10 = normal, 4-6 = perlu perhatian, 0-3 = resusitasi segera."
    },
    {
      question: "Pada syok hipovolemik, tindakan keperawatan prioritas pertama adalah?",
      options: ["Pemberian antibiotik spektrum luas IV", "Resusitasi cairan kristaloid intravena cepat", "Pemasangan kateter urin untuk monitor output", "Pemberian vasopressor (norepinefrin)"],
      correct: 1,
      explanation: "Syok hipovolemik = defisit volume sirkulasi. Prioritas: resusitasi cairan NaCl 0.9% atau Ringer Laktat 20-30 mL/kgBB dalam 30-60 menit (fluid challenge). Monitor: MAP ≥65 mmHg, UO ≥0.5 mL/kgBB/jam, perbaikan CRT dan kesadaran."
    },
    {
      question: "Kriteria diagnosis SIRS (Systemic Inflammatory Response Syndrome) memerlukan minimal berapa kriteria terpenuhi?",
      options: ["1 dari 4 kriteria", "2 dari 4 kriteria", "3 dari 4 kriteria", "4 dari 4 kriteria"],
      correct: 1,
      explanation: "SIRS: ≥2 dari 4 kriteria: (1) Suhu >38°C atau <36°C, (2) HR >90 x/mnt, (3) RR >20 x/mnt atau PaCO₂ <32 mmHg, (4) WBC >12.000 atau <4.000 atau >10% bands. SIRS + infeksi = Sepsis. Sepsis + disfungsi organ = Sepsis berat."
    },
    {
      question: "Teori keperawatan jiwa Hildegard Peplau berfokus pada?",
      options: ["Adaptasi pasien terhadap stimulus (Model Roy)", "Hubungan interpersonal terapeutik perawat-klien", "Kemandirian pasien dalam self-care (Model Orem)", "14 kebutuhan dasar manusia (Model Henderson)"],
      correct: 1,
      explanation: "Peplau (1952) — Interpersonal Relations in Nursing. Ia menekankan hubungan perawat-klien yang terapeutik melalui 4 fase: Orientasi, Identifikasi, Eksploitasi, dan Resolusi. Perawat berperan sebagai stranger, resource person, teacher, leader, surrogate, counselor."
    },
    {
      question: "Dalam keperawatan komunitas, assessment data primer diperoleh melalui?",
      options: ["Rekam medis dan catatan penyakit terdahulu", "Data sensus penduduk nasional", "Wawancara, observasi langsung, dan pemeriksaan fisik komunitas", "Laporan Dinas Kesehatan Kota/Kabupaten"],
      correct: 2,
      explanation: "Data primer: diperoleh langsung dari sumber (masyarakat) melalui windshield survey (observasi komunitas dari kendaraan), wawancara key informan, kuesioner/survei, observasi langsung, dan pemeriksaan fisik warga. Data sekunder: dari laporan, rekam medis, sensus, dll."
    },
    {
      question: "Terapi Kognitif-Perilaku (CBT) terbukti paling efektif untuk kondisi?",
      options: ["Skizofrenia fase akut dengan halusinasi aktif", "Depresi mayor dan gangguan kecemasan", "Demensia Alzheimer berat", "Gangguan kepribadian antisosial"],
      correct: 1,
      explanation: "CBT (Cognitive Behavioral Therapy) memiliki evidence kuat untuk: depresi mayor, gangguan kecemasan umum, fobia, OCD, PTSD, gangguan panik, dan gangguan makan. CBT mengubah pola pikir negatif (cognitive distortion) dan perilaku maladaptif."
    },
    {
      question: "Parameter monitoring utama pada pasien dengan ventilator mekanik di ICU adalah?",
      options: ["Tekanan darah dan suhu saja", "Volume tidal, tekanan puncak/plateau, PEEP, FiO₂, SpO₂", "Hanya SpO₂ dan frekuensi napas", "GCS dan refleks pupil"],
      correct: 1,
      explanation: "Monitoring ventilator: Volume tidal (TV) 6-8 mL/kgBB ideal weight, Peak pressure (<35 cmH₂O), Plateau pressure (<30 cmH₂O), PEEP (5-10 cmH₂O), FiO₂ (minimal untuk SpO₂ 94-98%), RR, I:E ratio. AGD berkala untuk evaluasi ventilasi."
    },
    {
      question: "Indikator mutu pelayanan keperawatan berdasarkan model NDNQI meliputi?",
      options: ["Kepuasan pasien dan biaya perawatan saja", "Falls rate, pressure ulcer, CAUTI, CLABSI, nurse satisfaction", "Jumlah perawat per shift dan jam dinas", "Lama rawat inap dan angka kematian saja"],
      correct: 1,
      explanation: "NDNQI (National Database of Nursing Quality Indicators): angka jatuh (falls), luka tekan (pressure ulcer), infeksi CAUTI (kateter urin), CLABSI (line sentral), HAP (healthcare-acquired pneumonia), kepuasan pasien dan perawat, rasio perawat-pasien."
    },
    {
      question: "Tujuan utama asuhan keperawatan paliatif menurut WHO adalah?",
      options: ["Menyembuhkan penyakit terminal secara definitif", "Memperpanjang usia hidup sebisa mungkin dengan terapi agresif", "Meningkatkan kualitas hidup pasien dan keluarga melalui manajemen gejala holistik", "Mengurangi biaya perawatan di akhir kehidupan"],
      correct: 2,
      explanation: "WHO: Perawatan paliatif meningkatkan kualitas hidup pasien dengan penyakit mengancam jiwa dan keluarganya melalui: manajemen nyeri dan gejala, dukungan psikologis-sosial-spiritual, fasilitasi komunikasi, dan persiapan akhir kehidupan. Tidak mempercepat maupun menunda kematian."
    },
    {
      question: "Model Praktik Keperawatan Profesional (MPKP) yang paling sesuai untuk pelayanan keperawatan berkualitas di RS adalah?",
      options: ["Model Fungsional (task-oriented)", "Model Tim-Primer (primary nursing dalam tim)", "Model Kasus (case method) satu perawat satu pasien", "Model Total Care tanpa koordinator"],
      correct: 1,
      explanation: "MPKP Tim-Primer mengombinasikan: Ketua Tim (RN) bertanggung jawab sekelompok pasien selama 24 jam, anggota tim (RN/D3/pekarya) melaksanakan asuhan, continuity of care terjaga, kolaborasi optimal. Direkomendasikan Depkes RI untuk pelayanan profesional."
    }
  ]
};

// Quiz State
let quizState = {
  level: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  correctAnswers: 0,
  wrongAnswers: 0,
  timer: null,
  timeLeft: 30
};

// Quiz Level Selector
document.querySelectorAll('.quiz-level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.quiz-level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const level = btn.dataset.level;
    startQuiz(level);
  });
});

function startQuiz(level) {
  quizState.level = level;
  quizState.questions = [...QUIZ_DATA[level]].sort(() => Math.random() - 0.5);
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState.correctAnswers = 0;
  quizState.wrongAnswers = 0;

  const card = document.getElementById('quiz-card');
  const result = document.getElementById('quiz-result');
  if (card) card.classList.add('active');
  if (result) result.classList.remove('show');

  showQuestion();
}

function showQuestion() {
  if (quizState.currentIndex >= quizState.questions.length) {
    showResult();
    return;
  }

  const q = quizState.questions[quizState.currentIndex];
  quizState.answered = false;
  quizState.timeLeft = 30;

  // Update UI
  const questionNum = document.getElementById('question-num');
  const questionText = document.getElementById('question-text');
  const optionsList = document.getElementById('options-list');
  const explanation = document.getElementById('quiz-explanation');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const nextBtn = document.getElementById('next-btn');
  const timerEl = document.getElementById('quiz-timer');

  if (questionNum) questionNum.textContent = `Soal ${quizState.currentIndex + 1} dari ${quizState.questions.length}`;
  if (questionText) questionText.textContent = q.question;
  if (explanation) explanation.classList.remove('show');
  if (progressFill) progressFill.style.width = `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%`;
  if (progressText) progressText.textContent = `${quizState.currentIndex + 1}/${quizState.questions.length}`;
  if (nextBtn) nextBtn.disabled = true;
  if (timerEl) {
    timerEl.classList.remove('warning');
    timerEl.querySelector('.timer-text').textContent = '30s';
  }

  if (optionsList) {
    optionsList.innerHTML = '';
    q.options.forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'quiz-option';
      li.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${opt}</span>`;
      li.addEventListener('click', () => selectAnswer(i));
      optionsList.appendChild(li);
    });
  }

  // Start timer
  clearInterval(quizState.timer);
  quizState.timer = setInterval(() => {
    quizState.timeLeft--;
    if (timerEl) {
      timerEl.querySelector('.timer-text').textContent = `${quizState.timeLeft}s`;
      if (quizState.timeLeft <= 10) timerEl.classList.add('warning');
    }
    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timer);
      if (!quizState.answered) autoAnswer();
    }
  }, 1000);
}

function autoAnswer() {
  quizState.answered = true;
  quizState.wrongAnswers++;
  const q = quizState.questions[quizState.currentIndex];
  const options = document.querySelectorAll('.quiz-option');
  options[q.correct].classList.add('correct');
  showExplanation(q);
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.disabled = false;
}

function selectAnswer(index) {
  if (quizState.answered) return;
  quizState.answered = true;
  clearInterval(quizState.timer);

  const q = quizState.questions[quizState.currentIndex];
  const options = document.querySelectorAll('.quiz-option');

  options[index].classList.add('selected');

  if (index === q.correct) {
    options[index].classList.add('correct');
    quizState.score += 10;
    quizState.correctAnswers++;
  } else {
    options[index].classList.add('wrong');
    options[q.correct].classList.add('correct');
    quizState.wrongAnswers++;
  }

  showExplanation(q);

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.disabled = false;
}

function showExplanation(q) {
  const explanation = document.getElementById('quiz-explanation');
  const explanationText = document.getElementById('explanation-text');
  if (explanation && explanationText) {
    explanationText.textContent = q.explanation;
    explanation.classList.add('show');
  }
}

// Next Button
document.getElementById('next-btn')?.addEventListener('click', () => {
  quizState.currentIndex++;
  showQuestion();
});

function showResult() {
  const card = document.getElementById('quiz-card');
  const result = document.getElementById('quiz-result');

  if (card) card.classList.remove('active');
  if (result) {
    result.classList.add('show');

    const totalQ = quizState.questions.length;
    const pct = Math.round((quizState.correctAnswers / totalQ) * 100);

    document.getElementById('result-score').textContent = pct + '%';
    document.getElementById('result-correct').textContent = quizState.correctAnswers;
    document.getElementById('result-wrong').textContent = quizState.wrongAnswers;
    document.getElementById('result-total').textContent = totalQ;

    // SVG Circle
    const circle = document.getElementById('score-circle-fill');
    if (circle) {
      const circumference = 2 * Math.PI * 60;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference - (pct / 100 * circumference);
      circle.style.stroke = pct >= 70 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626';
    }

    // Message
    const msg = document.getElementById('result-message');
    if (msg) {
      if (pct >= 80) msg.textContent = '🎉 Luar biasa! Kamu menguasai materi dengan sangat baik!';
      else if (pct >= 60) msg.textContent = '👍 Bagus! Masih ada beberapa materi yang perlu dipelajari kembali.';
      else msg.textContent = '📚 Semangat! Pelajari kembali materi dan coba lagi untuk hasil yang lebih baik.';
    }
  }
}

// Retry
document.getElementById('retry-btn')?.addEventListener('click', () => {
  if (quizState.level) startQuiz(quizState.level);
});

// Quiz from materi page
function openQuiz(level) {
  window.location.href = `quiz.html?level=${level}`;
}

// Auto-start quiz if URL has level param
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const level = params.get('level');
  if (level && QUIZ_DATA[level]) {
    const btn = document.querySelector(`.quiz-level-btn[data-level="${level}"]`);
    if (btn) btn.click();
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
