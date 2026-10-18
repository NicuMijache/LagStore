#!/usr/bin/env node
/**
 * LagStore – script de populare bază de date prin API REST
 * Rulare:
 *   node scripts/seed.mjs
 * Dacă backend-ul folosește HTTPS cu certificat auto-semnat:
 *   $env:NODE_TLS_REJECT_UNAUTHORIZED=0; node scripts/seed.mjs
 */

// ─── Configurare ────────────────────────────────────────────────────────────

const API_URL      = process.env.API_URL      ?? 'https://localhost:7209/api';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  ?? 'admin@lagstore.ro';
const ADMIN_PASS   = process.env.ADMIN_PASSWORD ?? 'Admin123';

// ─── Date de seed ───────────────────────────────────────────────────────────

const CATEGORIES = [
  'Mouse-uri',
  'Tastaturi',
  'Căști',
  'Monitoare',
  'Mousepad-uri',
  'Scaune gaming',
  'Controllere',
  'Microfoane și webcam-uri',
];

const SUPPLIERS = [
  { name: 'Logitech',   contactEmail: 'contact@logitech.ro',    contactPhone: '0721 111 001' },
  { name: 'Razer',      contactEmail: 'contact@razer.ro',       contactPhone: '0722 222 002' },
  { name: 'SteelSeries',contactEmail: 'contact@steelseries.ro', contactPhone: '0723 333 003' },
  { name: 'Corsair',    contactEmail: 'contact@corsair.ro',     contactPhone: '0724 444 004' },
  { name: 'HyperX',     contactEmail: 'contact@hyperx.ro',      contactPhone: '0725 555 005' },
  { name: 'ASUS ROG',   contactEmail: 'contact@asusrog.ro',     contactPhone: '0726 666 006' },
  { name: 'Samsung',    contactEmail: 'contact@samsung.ro',     contactPhone: '0727 777 007' },
  { name: 'Arozzi',     contactEmail: 'contact@arozzi.ro',      contactPhone: '0728 888 008' },
];

/** name, price, estimatedDaysMin, estimatedDaysMax */
const DELIVERY_METHODS = [
  { name: 'Curier rapid',                         price: 24.00, estimatedDaysMin: 1, estimatedDaysMax: 2  },
  { name: 'Curier standard',                      price: 15.00, estimatedDaysMin: 2, estimatedDaysMax: 4  },
  { name: 'Ridicare din punct partener (locker)', price:  9.99, estimatedDaysMin: 2, estimatedDaysMax: 3  },
  { name: 'Ridicare personală din magazin',       price:  0.00, estimatedDaysMin: 0, estimatedDaysMax: 1  },
  { name: 'Livrare voluminoasă',                  price: 49.00, estimatedDaysMin: 3, estimatedDaysMax: 6  },
];

/**
 * Produse – câmpurile: name, description, specifications, price, stock,
 * category (string), supplier (string), deliveryMethod (string).
 * La inserare, string-urile vor fi înlocuite cu id-urile corespunzătoare.
 */
const PRODUCTS = [
  // ── Mouse-uri ─────────────────────────────────────────────────────────────
  {
    name: 'Logitech G502 Hero',
    description: 'Mouse gaming cu senzor Hero 25K, 11 butoane programabile și sistem de greutăți reglabile. Design ergonomic potrivit pentru sesiuni lungi de joc.',
    specifications: 'DPI: 100–25600; Butoane: 11; Conexiune: USB cu fir; Greutate: 121 g; Iluminare: RGB',
    price: 329.99, stock: 45,
    category: 'Mouse-uri', supplier: 'Logitech', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Logitech G Pro X Superlight 2',
    description: 'Mouse wireless ultra-ușor pentru esports, cu senzor Hero 2 de 32K DPI. Carcasă din plastic de înaltă calitate sub 60 g.',
    specifications: 'DPI: 100–32000; Butoane: 5; Conexiune: wireless 2.4 GHz; Greutate: 60 g; Autonomie: 95 ore',
    price: 749.99, stock: 22,
    category: 'Mouse-uri', supplier: 'Logitech', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Razer DeathAdder V3',
    description: 'Mouse gaming cu design ergonomic și senzor Focus Pro 30K. Clicheuri optice rapide și roată de scroll cu precizie ridicată.',
    specifications: 'DPI: 100–30000; Butoane: 6; Conexiune: USB cu fir; Greutate: 59 g; Clicheuri optice: da',
    price: 419.99, stock: 31,
    category: 'Mouse-uri', supplier: 'Razer', deliveryMethod: 'Curier standard',
  },
  {
    name: 'Razer Viper V3 HyperSpeed',
    description: 'Mouse wireless compact cu viteză de răspuns ridicată, ideal pentru gaming competitiv. Baterie de 280 de ore în modul standard.',
    specifications: 'DPI: 100–30000; Butoane: 6; Conexiune: wireless 2.4 GHz / Bluetooth; Greutate: 82 g; Autonomie: 280 ore',
    price: 299.99, stock: 0,
    category: 'Mouse-uri', supplier: 'Razer', deliveryMethod: 'Curier standard',
  },
  {
    name: 'SteelSeries Rival 650',
    description: 'Mouse wireless gaming cu sistem de greutăți reglabil și iluminare RGB pe 16,8 milioane de culori. Dublu senzor optic pentru precizie maximă.',
    specifications: 'DPI: 100–12000; Butoane: 7; Conexiune: wireless 2.4 GHz; Greutate: 121 g (fără greutăți); Autonomie: 24 ore',
    price: 499.00, stock: 14,
    category: 'Mouse-uri', supplier: 'SteelSeries', deliveryMethod: 'Ridicare din punct partener (locker)',
  },
  {
    name: 'ASUS ROG Keris II Ace',
    description: 'Mouse gaming wireless cu senzor ROG AimPoint Pro de 42K DPI și design simetric. Conectivitate tri-mod: 2.4 GHz, Bluetooth și cu fir.',
    specifications: 'DPI: 100–42000; Butoane: 7; Conexiune: 2.4 GHz / Bluetooth / USB; Greutate: 54 g; Autonomie: 111 ore',
    price: 579.99, stock: 8,
    category: 'Mouse-uri', supplier: 'ASUS ROG', deliveryMethod: 'Curier rapid',
  },

  // ── Tastaturi ─────────────────────────────────────────────────────────────
  {
    name: 'SteelSeries Apex Pro TKL',
    description: 'Tastatură mecanică TKL cu switch-uri OmniPoint ajustabile (0.1–4 mm), OLED display și iluminare RGB per taste. Construcție din aluminiu premium.',
    specifications: 'Switch: OmniPoint ajustabil; Layout: TKL; Conexiune: USB cu fir; Iluminare: RGB per tastă; Display: OLED',
    price: 999.99, stock: 19,
    category: 'Tastaturi', supplier: 'SteelSeries', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Razer BlackWidow V4 Pro',
    description: 'Tastatură mecanică gaming full-size cu switch-uri Razer Green Clicky, volum rotativ multifuncțional și taste media dedicate.',
    specifications: 'Switch: Razer Green Clicky; Layout: full-size; Conexiune: wireless 2.4 GHz / Bluetooth / USB; Iluminare: Chroma RGB; Autonomie: 200 ore',
    price: 1199.99, stock: 11,
    category: 'Tastaturi', supplier: 'Razer', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Corsair K70 RGB MK.2',
    description: 'Tastatură mecanică cu switch-uri Cherry MX Red și cadru din aluminiu anodizat. Taste pentru volum dedicate și repaus rapid.',
    specifications: 'Switch: Cherry MX Red; Layout: full-size; Conexiune: USB cu fir (detașabil); Iluminare: RGB per tastă; Memorie macro: 8 MB',
    price: 749.00, stock: 27,
    category: 'Tastaturi', supplier: 'Corsair', deliveryMethod: 'Curier standard',
  },
  {
    name: 'HyperX Alloy Origins 65',
    description: 'Tastatură mecanică compactă 65% cu switch-uri HyperX Red liniare. Construcție din aluminiu full și cablu USB-C detașabil.',
    specifications: 'Switch: HyperX Red liniar; Layout: 65%; Conexiune: USB-C cu fir; Iluminare: RGB; Construcție: aluminiu',
    price: 469.99, stock: 35,
    category: 'Tastaturi', supplier: 'HyperX', deliveryMethod: 'Ridicare personală din magazin',
  },
  {
    name: 'Logitech G915 TKL',
    description: 'Tastatură mecanică wireless low-profile cu switch-uri Logitech GL. Design ultra-subțire, 40 de ore de autonomie și conectivitate multiplă.',
    specifications: 'Switch: GL Tactil / GL Liniar / GL Clicky; Layout: TKL; Conexiune: Lightspeed 2.4 GHz / Bluetooth; Autonomie: 40 ore; Grosime: 22 mm',
    price: 1099.00, stock: 16,
    category: 'Tastaturi', supplier: 'Logitech', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'ASUS ROG Strix Scope RX TKL',
    description: 'Tastatură gaming TKL cu switch-uri optice ROG RX Red și taste stabilizatoare cu sateliți. Iluminare Aura Sync RGB.',
    specifications: 'Switch: ROG RX Red optic; Layout: TKL; Conexiune: USB-C cu fir; Iluminare: Aura Sync RGB; Stabilizatori: cu sateliți',
    price: 649.00, stock: 0,
    category: 'Tastaturi', supplier: 'ASUS ROG', deliveryMethod: 'Curier standard',
  },

  // ── Căști ─────────────────────────────────────────────────────────────────
  {
    name: 'HyperX Cloud II Wireless',
    description: 'Căști gaming wireless cu sunet 7.1 surround virtual, microfon detașabil cu anulare zgomot și 30 de ore de autonomie.',
    specifications: 'Difuzoare: 53 mm; Răspuns frecvență: 15–20000 Hz; Impedanță: 60 Ω; Conexiune: USB wireless 2.4 GHz; Autonomie: 30 ore',
    price: 599.99, stock: 40,
    category: 'Căști', supplier: 'HyperX', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'SteelSeries Arctis Nova Pro Wireless',
    description: 'Căști premium cu sistem activ de anulare a zgomotului (ANC), dual wireless și sunet Hi-Res Audio. Stație de încărcare cu slot pentru baterie de rezervă.',
    specifications: 'Difuzoare: 40 mm; ANC: activ; Conexiune: wireless 2.4 GHz + Bluetooth; Autonomie: 22 ore (per baterie); Hi-Res: da',
    price: 1699.99, stock: 7,
    category: 'Căști', supplier: 'SteelSeries', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Razer Barracuda X',
    description: 'Căști gaming wireless ușoare, compatibile PC, PlayStation, Switch și mobil. Design minimalist cu microfon HyperClear retractabil.',
    specifications: 'Difuzoare: 40 mm; Conexiune: wireless 2.4 GHz / 3.5 mm; Autonomie: 50 ore; Greutate: 250 g; Microfon: retractabil',
    price: 449.99, stock: 0,
    category: 'Căști', supplier: 'Razer', deliveryMethod: 'Curier standard',
  },
  {
    name: 'Corsair HS80 RGB Wireless',
    description: 'Căști gaming wireless cu Dolby Atmos, microfon omni-direcțional detașabil și iluminare RGB. Susținute de 60 de ore de autonomie.',
    specifications: 'Difuzoare: 50 mm; Conexiune: USB wireless 2.4 GHz; Autonomie: 60 ore; Dolby Atmos: da; Greutate: 337 g',
    price: 699.00, stock: 23,
    category: 'Căști', supplier: 'Corsair', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Logitech G435',
    description: 'Căști gaming wireless ușoare (165 g), sustenabile – 22% plastic reciclat. Microfon dual beamforming fără braț vizibil.',
    specifications: 'Difuzoare: 40 mm; Conexiune: Lightspeed 2.4 GHz / Bluetooth; Autonomie: 18 ore; Greutate: 165 g; Microfon: dual beamforming',
    price: 349.99, stock: 50,
    category: 'Căști', supplier: 'Logitech', deliveryMethod: 'Curier standard',
  },
  {
    name: 'ASUS ROG Delta S',
    description: 'Căști gaming cu DAC ESS ES9281AC quad-core integrat, Hi-Res Audio și sunet 7.1 virtual. Conectivitate USB-C compatibilă Switch și telefoane.',
    specifications: 'Difuzoare: 50 mm; DAC: ESS 9281AC; Conexiune: USB-C / USB-A; Hi-Res Audio: da; Răspuns: 20–40000 Hz',
    price: 799.00, stock: 13,
    category: 'Căști', supplier: 'ASUS ROG', deliveryMethod: 'Curier rapid',
  },

  // ── Monitoare ─────────────────────────────────────────────────────────────
  {
    name: 'Samsung Odyssey G5 27"',
    description: 'Monitor curbat gaming 27" cu panou VA 1000R, rezoluție 2K 165 Hz și timp de răspuns 1 ms. Suport AMD FreeSync Premium.',
    specifications: 'Diagonală: 27"; Panou: VA curbat 1000R; Rezoluție: 2560×1440; Rată: 165 Hz; Răspuns: 1 ms MPRT; FreeSync Premium: da',
    price: 1399.00, stock: 10,
    category: 'Monitoare', supplier: 'Samsung', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Samsung Odyssey Neo G9 57"',
    description: 'Monitor dual-4K ultrawide curbat 1000R cu Quantum Mini LED și 240 Hz. Cel mai imersiv monitor gaming din gama Samsung.',
    specifications: 'Diagonală: 57"; Panou: QLED curbat 1000R; Rezoluție: 7680×2160; Rată: 240 Hz; HDR: 2000; Quantum Mini LED: da',
    price: 9999.99, stock: 2,
    category: 'Monitoare', supplier: 'Samsung', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'ASUS ROG Swift PG27AQN',
    description: 'Monitor IPS 27" 2K cu 360 Hz – primul din lume la această rezoluție și rată de împrospătare. NVIDIA G-Sync Ultimate integrat.',
    specifications: 'Diagonală: 27"; Panou: IPS; Rezoluție: 2560×1440; Rată: 360 Hz; Răspuns: 1 ms; G-Sync Ultimate: da',
    price: 4199.00, stock: 4,
    category: 'Monitoare', supplier: 'ASUS ROG', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'ASUS ROG Strix XG27AQM',
    description: 'Monitor IPS 27" 2K 270 Hz cu tehnologia ELMB-Sync pentru eliminarea blur-ului. Fast IPS cu răspuns de 0.5 ms.',
    specifications: 'Diagonală: 27"; Panou: Fast IPS; Rezoluție: 2560×1440; Rată: 270 Hz; Răspuns: 0.5 ms; ELMB-Sync: da',
    price: 2799.00, stock: 6,
    category: 'Monitoare', supplier: 'ASUS ROG', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Samsung Odyssey G4 25" FHD',
    description: 'Monitor IPS Full HD 240 Hz cu răspuns de 1 ms și G-Sync Compatible. Ideal pentru esports la un preț accesibil.',
    specifications: 'Diagonală: 25"; Panou: IPS; Rezoluție: 1920×1080; Rată: 240 Hz; Răspuns: 1 ms; G-Sync Compatible: da',
    price: 1099.00, stock: 18,
    category: 'Monitoare', supplier: 'Samsung', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Corsair XENEON 27QHD240',
    description: 'Monitor OLED 27" 2K 240 Hz cu contrast infinit și culori HDR spectaculoase. Ideal pentru gaming și creație de conținut.',
    specifications: 'Diagonală: 27"; Panou: OLED; Rezoluție: 2560×1440; Rată: 240 Hz; Răspuns: 0.03 ms; HDR: True Black 400',
    price: 3499.00, stock: 0,
    category: 'Monitoare', supplier: 'Corsair', deliveryMethod: 'Livrare voluminoasă',
  },

  // ── Mousepad-uri ──────────────────────────────────────────────────────────
  {
    name: 'SteelSeries QcK Heavy XXL',
    description: 'Mousepad gaming XXL cu suprafață textilă optimizată pentru senzori de mare precizie și bază anti-alunecare din cauciuc gros.',
    specifications: 'Dimensiuni: 900×300×6 mm; Suprafață: textilă; Bază: cauciuc; Greutate: 875 g',
    price: 229.99, stock: 60,
    category: 'Mousepad-uri', supplier: 'SteelSeries', deliveryMethod: 'Curier standard',
  },
  {
    name: 'Razer Gigantus V2 XXL',
    description: 'Mousepad gigant cu suprafață micro-texturată pentru precizie maximă și margini cusute pentru durabilitate sporită.',
    specifications: 'Dimensiuni: 940×410×4 mm; Suprafață: micro-texturată; Margini: cusute; Bază: cauciuc anti-alunecare',
    price: 249.99, stock: 42,
    category: 'Mousepad-uri', supplier: 'Razer', deliveryMethod: 'Curier standard',
  },
  {
    name: 'Corsair MM700 RGB Extended',
    description: 'Mousepad gaming extins cu iluminare RGB pe periferie și bază solidă din cauciuc. Hub USB-C integrat cu 2 porturi USB-A.',
    specifications: 'Dimensiuni: 930×400×4 mm; Iluminare: RGB periferic; Hub USB: USB-C + 2× USB-A; Suprafață: textilă',
    price: 399.99, stock: 25,
    category: 'Mousepad-uri', supplier: 'Corsair', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Logitech G640',
    description: 'Mousepad de gaming cu suprafață textilă consistentă optimizată pentru senzorii optici. Format large, potrivit pentru sensibilitate scăzută.',
    specifications: 'Dimensiuni: 460×400×3 mm; Suprafață: textilă; Bază: cauciuc natural; Format: large',
    price: 149.99, stock: 75,
    category: 'Mousepad-uri', supplier: 'Logitech', deliveryMethod: 'Ridicare personală din magazin',
  },
  {
    name: 'SteelSeries QcK Prism XL',
    description: 'Mousepad cu două zone de iluminare RGB independente și suprafață duală (viteză/control). Sincronizare prin SteelSeries Engine.',
    specifications: 'Dimensiuni: 900×300×4 mm; Iluminare: dual-zone RGB; Suprafață: duală (viteză/control); Sincronizare: SteelSeries Engine',
    price: 349.00, stock: 3,
    category: 'Mousepad-uri', supplier: 'SteelSeries', deliveryMethod: 'Curier rapid',
  },

  // ── Scaune gaming ─────────────────────────────────────────────────────────
  {
    name: 'Arozzi Torretta SuperSoft',
    description: 'Scaun gaming cu tapițerie din piele PU SuperSoft moale la atingere, suport lombar și pernă de gât incluse. Spătar reglabil 165°.',
    specifications: 'Material: PU SuperSoft; Spătar: 165°; Înălțime scaun: 46–54 cm; Sarcină maximă: 130 kg; Roți: nailon',
    price: 1499.00, stock: 12,
    category: 'Scaune gaming', supplier: 'Arozzi', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Arozzi Vernazza SoftFabric',
    description: 'Scaun gaming premium cu tapițerie din material textil respirabil, mecanism de balansare și brațe reglabile 4D.',
    specifications: 'Material: SoftFabric; Brațe: 4D reglabile; Spătar: 165°; Înălțime scaun: 43–55 cm; Garanție: 5 ani',
    price: 1999.00, stock: 5,
    category: 'Scaune gaming', supplier: 'Arozzi', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Corsair TC100 Relaxed',
    description: 'Scaun gaming entry-level cu tapițerie din PU și design larg pentru confort extins. Include pernă lombară și pernă de gât.',
    specifications: 'Material: PU; Spătar: 180°; Înălțime scaun: 42–52 cm; Sarcină maximă: 120 kg; Brațe: fixe',
    price: 899.00, stock: 20,
    category: 'Scaune gaming', supplier: 'Corsair', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Razer Iskur V2',
    description: 'Scaun gaming cu suport lombar reglabil integrat în structura spătarului și tapițerie din piele ecologică rezistentă.',
    specifications: 'Material: piele eco; Suport lombar: integrat reglabil; Spătar: 152°; Sarcină maximă: 136 kg; Brațe: 4D',
    price: 2299.00, stock: 8,
    category: 'Scaune gaming', supplier: 'Razer', deliveryMethod: 'Livrare voluminoasă',
  },
  {
    name: 'Arozzi Mezzo V2',
    description: 'Scaun gaming mid-size cu tapițerie textilă, potrivit pentru utilizatori de statură medie. Spătar cu suport lombar fix.',
    specifications: 'Material: textil; Spătar: 165°; Înălțime scaun: 42–52 cm; Sarcină maximă: 105 kg; Roți: poliuretan',
    price: 1099.00, stock: 0,
    category: 'Scaune gaming', supplier: 'Arozzi', deliveryMethod: 'Livrare voluminoasă',
  },

  // ── Controllere ───────────────────────────────────────────────────────────
  {
    name: 'Razer Wolverine V2 Chroma',
    description: 'Controller pentru Xbox și PC cu 6 butoane acționale suplimentare, trigger-e multi-funcționale și iluminare Chroma RGB.',
    specifications: 'Compatibil: Xbox Series X|S / Xbox One / PC; Butoane extra: 6; Declanșatoare: multi-funcționale; Conexiune: USB cu fir; Iluminare: Chroma RGB',
    price: 699.99, stock: 17,
    category: 'Controllere', supplier: 'Razer', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Corsair Nightsabre Wireless',
    description: 'Gamepad wireless pentru PC cu baterie de 30 de ore, deconectare rapidă și butoane personalizabile prin iCUE.',
    specifications: 'Compatibil: PC; Conexiune: wireless 2.4 GHz / Bluetooth / USB; Autonomie: 30 ore; Software: iCUE; Iluminare: RGB',
    price: 499.00, stock: 0,
    category: 'Controllere', supplier: 'Corsair', deliveryMethod: 'Curier standard',
  },
  {
    name: 'Logitech F310 Gamepad',
    description: 'Gamepad clasic cu fir, compatibil PC și Android, cu trigger-e analogice și vibrații în doi motori. Ușor și fiabil.',
    specifications: 'Compatibil: PC / Android; Conexiune: USB cu fir; Vibrații: dual-motor; Greutate: 270 g; Cablu: 1.8 m',
    price: 149.99, stock: 55,
    category: 'Controllere', supplier: 'Logitech', deliveryMethod: 'Ridicare personală din magazin',
  },
  {
    name: 'Razer Kishi V2 Pro (Android)',
    description: 'Controller telescopic pentru telefoane Android cu microdeclanșatoare fără hapsânire și conectivitate USB-C directă. Profil ultra-subțire.',
    specifications: 'Compatibil: Android (USB-C); Trigger: micro-tactile; Conexiune: USB-C direct; Greutate: 168 g; Aplicație: Razer Nexus',
    price: 599.99, stock: 21,
    category: 'Controllere', supplier: 'Razer', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'SteelSeries Stratus Duo',
    description: 'Controller wireless cu dual-connectivity (2.4 GHz + Bluetooth) pentru PC, Android și VR. Grips cauciucate și autonomie de 20 ore.',
    specifications: 'Compatibil: PC / Android / VR; Conexiune: 2.4 GHz + Bluetooth; Autonomie: 20 ore; Grips: cauciucate; Baterie: AA',
    price: 329.99, stock: 33,
    category: 'Controllere', supplier: 'SteelSeries', deliveryMethod: 'Curier standard',
  },
  {
    name: 'ASUS ROG Raikiri Pro',
    description: 'Controller pentru PC și Xbox cu dongle tri-mode (wireless/Bluetooth/USB), OLED de configurare și 4 butoane programabile pe spate.',
    specifications: 'Compatibil: PC / Xbox; Conexiune: 2.4 GHz / Bluetooth / USB; Butoane extra: 4; Display: OLED; ESS DAC integrat: da',
    price: 799.99, stock: 9,
    category: 'Controllere', supplier: 'ASUS ROG', deliveryMethod: 'Curier rapid',
  },

  // ── Microfoane și webcam-uri ───────────────────────────────────────────────
  {
    name: 'HyperX QuadCast S',
    description: 'Microfon USB cu iluminare RGB animată, anti-vibrations internă, filtru pop integrat și selector de pattern polar rotativ.',
    specifications: 'Pattern: cardioid / bidirecțional / omni / stereo; Conexiune: USB-C; Frecvență: 20–20000 Hz; Iluminare: RGB; Filtru pop: integrat',
    price: 599.99, stock: 28,
    category: 'Microfoane și webcam-uri', supplier: 'HyperX', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Razer Seiren V3 Chroma',
    description: 'Microfon USB condenser cu senzor de soundclip, indicator de volum luminat și suprafață tactilă de control al câștigului.',
    specifications: 'Pattern: super-cardioid; Conexiune: USB; Frecvență: 20–20000 Hz; Soundclip Guard: da; Iluminare: Chroma RGB',
    price: 699.99, stock: 16,
    category: 'Microfoane și webcam-uri', supplier: 'Razer', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Logitech G Yeti GX',
    description: 'Microfon USB dinamic cu tehnologie LIGHTSYNC RGB și captura audio cu zgomot redus. Ideal pentru streaming și gaming.',
    specifications: 'Tip: dinamic; Pattern: super-cardioid; Conexiune: USB; Frecvență: 50–16000 Hz; Iluminare: LIGHTSYNC RGB',
    price: 549.99, stock: 37,
    category: 'Microfoane și webcam-uri', supplier: 'Logitech', deliveryMethod: 'Curier standard',
  },
  {
    name: 'SteelSeries Alias Pro',
    description: 'Microfon USB XLR hybrid cu mixer digital și panou de control DAC/ADC de înaltă fidelitate. Compatibil cu interfețe audio.',
    specifications: 'Tip: condenser; Pattern: cardioid; Conexiune: USB / XLR; Bit depth: 24-bit; Frecvență eșantionare: 96 kHz',
    price: 899.99, stock: 1,
    category: 'Microfoane și webcam-uri', supplier: 'SteelSeries', deliveryMethod: 'Curier rapid',
  },
  {
    name: 'Razer Kiyo Pro Ultra',
    description: 'Webcam streaming 4K cu senzor Sony STARVIS 2 de 1", apertura f/1.7 și tracking AI al feței. Microfon beamforming integrat.',
    specifications: 'Rezoluție: 4K 30 fps / 1080p 60 fps; Senzor: Sony STARVIS 2 1"; Apertura: f/1.7; Microfon: beamforming AI; HDR: da',
    price: 1099.99, stock: 11,
    category: 'Microfoane și webcam-uri', supplier: 'Razer', deliveryMethod: 'Curier standard',
  },
  {
    name: 'Logitech Brio 4K',
    description: 'Webcam 4K Ultra HD cu HDR, autofocus și recunoaștere facială Windows Hello. Include ocluzie magnetică pentru confidențialitate.',
    specifications: 'Rezoluție: 4K 30 fps / 1080p 60 fps; FOV: 65–90° (reglabil); HDR: da; Windows Hello: da; Conexiune: USB-A',
    price: 879.99, stock: 2,
    category: 'Microfoane și webcam-uri', supplier: 'Logitech', deliveryMethod: 'Curier rapid',
  },
];

// ─── Utilitar HTTP ───────────────────────────────────────────────────────────

async function request(method, path, body, token) {
  const url = `${API_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (
      err?.cause?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
      err?.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
      err?.cause?.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
      String(err).toLowerCase().includes('cert') ||
      String(err).toLowerCase().includes('ssl')
    ) {
      console.error('\n❌ EROARE SSL: Certificatul HTTPS de dezvoltare nu este de încredere.');
      console.error('   Rulează scriptul astfel (PowerShell):');
      console.error('   $env:NODE_TLS_REJECT_UNAUTHORIZED=0; node scripts/seed.mjs\n');
    } else {
      console.error(`❌ Eroare rețea la ${method} ${url}:`, err.message ?? err);
    }
    process.exit(1);
  }

  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, data };
}

// ─── Funcții helpers ─────────────────────────────────────────────────────────

function normalize(str) {
  return str.trim().toLowerCase();
}

/** Verifică dacă un nume există deja (case-insensitive) */
function alreadyExists(existingList, name) {
  return existingList.some((item) => normalize(item.name) === normalize(name));
}

/**
 * Creează un element dacă nu există deja.
 * @returns {{ id: number, created: boolean, name: string }}
 */
async function ensureExists(resourcePath, existingList, payload, token, label) {
  const name = payload.name;
  const existing = existingList.find((item) => normalize(item.name) === normalize(name));
  if (existing) {
    return { id: existing.id, created: false, name };
  }

  const { status, data } = await request('POST', resourcePath, payload, token);
  if (status === 201) {
    console.log(`  ✅ Creat ${label}: "${name}" (id=${data.id})`);
    return { id: data.id, created: true, name };
  } else {
    console.error(`  ⚠️  Eroare la crearea ${label} "${name}": HTTP ${status} – ${JSON.stringify(data)}`);
    return { id: null, created: false, name };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  LagStore – Populare bază de date (seed)');
  console.log(`  API: ${API_URL}`);
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Autentificare
  console.log('🔐 Autentificare ca admin…');
  const { status: loginStatus, data: loginData } = await request('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });

  if (loginStatus !== 200 || !loginData?.token) {
    console.error(`❌ Autentificare eșuată (HTTP ${loginStatus}):`, JSON.stringify(loginData));
    process.exit(1);
  }

  const token = loginData.token;
  console.log(`   Autentificat ca: ${loginData.fullName} (${loginData.role})\n`);

  // 2. Categorii
  console.log('📂 Categorii…');
  const { status: catListStatus, data: existingCats } = await request('GET', '/categories');
  if (catListStatus !== 200) {
    console.error('❌ Nu pot citi categoriile existente:', JSON.stringify(existingCats));
    process.exit(1);
  }

  let catCreated = 0, catSkipped = 0;
  const categoryMap = {}; // name -> id

  for (const name of CATEGORIES) {
    const result = await ensureExists('/categories', existingCats, { name }, token, 'categorie');
    if (result.id !== null) categoryMap[normalize(name)] = result.id;
    result.created ? catCreated++ : catSkipped++;
  }

  // 3. Furnizori
  console.log('\n🏭 Furnizori…');
  const { status: supListStatus, data: existingSups } = await request('GET', '/suppliers');
  if (supListStatus !== 200) {
    console.error('❌ Nu pot citi furnizorii existenți:', JSON.stringify(existingSups));
    process.exit(1);
  }

  let supCreated = 0, supSkipped = 0;
  const supplierMap = {}; // name -> id

  for (const sup of SUPPLIERS) {
    const result = await ensureExists('/suppliers', existingSups, sup, token, 'furnizor');
    if (result.id !== null) supplierMap[normalize(sup.name)] = result.id;
    result.created ? supCreated++ : supSkipped++;
  }

  // 4. Metode de livrare
  console.log('\n🚚 Metode de livrare…');
  const { status: dmListStatus, data: existingDMs } = await request('GET', '/deliverymethods');
  if (dmListStatus !== 200) {
    console.error('❌ Nu pot citi metodele de livrare:', JSON.stringify(existingDMs));
    process.exit(1);
  }

  let dmCreated = 0, dmSkipped = 0;
  const deliveryMap = {}; // name -> id

  for (const dm of DELIVERY_METHODS) {
    const result = await ensureExists('/deliverymethods', existingDMs, dm, token, 'metodă livrare');
    if (result.id !== null) deliveryMap[normalize(dm.name)] = result.id;
    result.created ? dmCreated++ : dmSkipped++;
  }

  // 5. Produse
  console.log('\n📦 Produse…');
  const { status: prodListStatus, data: existingProds } = await request('GET', '/products');
  if (prodListStatus !== 200) {
    console.error('❌ Nu pot citi produsele existente:', JSON.stringify(existingProds));
    process.exit(1);
  }

  let prodCreated = 0, prodSkipped = 0, prodFailed = 0;

  for (const p of PRODUCTS) {
    if (alreadyExists(existingProds, p.name)) {
      prodSkipped++;
      continue;
    }

    const categoryId      = categoryMap[normalize(p.category)];
    const supplierId      = supplierMap[normalize(p.supplier)];
    const deliveryMethodId = deliveryMap[normalize(p.deliveryMethod)];

    if (!categoryId || !supplierId || !deliveryMethodId) {
      console.error(`  ⚠️  Produs "${p.name}" – id lipsă (categorie/furnizor/livrare). Sărit.`);
      prodFailed++;
      continue;
    }

    const payload = {
      name:             p.name,
      description:      p.description,
      specifications:   p.specifications,
      price:            p.price,
      stock:            p.stock,
      categoryId,
      supplierId,
      deliveryMethodId,
    };

    const { status, data } = await request('POST', '/products', payload, token);
    if (status === 201) {
      console.log(`  ✅ Produs creat: "${p.name}" (id=${data.id})`);
      prodCreated++;
    } else {
      console.error(`  ⚠️  Eroare produs "${p.name}": HTTP ${status} – ${JSON.stringify(data)}`);
      prodFailed++;
    }
  }

  // 6. Rezumat final
  const totalProds = (existingProds?.length ?? 0) + prodCreated;
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  REZUMAT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Categorii       : ${catCreated} create, ${catSkipped} existente`);
  console.log(`  Furnizori       : ${supCreated} create, ${supSkipped} existente`);
  console.log(`  Metode livrare  : ${dmCreated} create, ${dmSkipped} existente`);
  console.log(`  Produse         : ${prodCreated} create, ${prodSkipped} existente${prodFailed > 0 ? `, ${prodFailed} eșuate` : ''}`);
  console.log(`  Total produse în catalog: ${totalProds}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (prodFailed > 0) {
    console.warn(`⚠️  ${prodFailed} produs(e) nu au putut fi create. Verifică erorile de mai sus.`);
    process.exit(1);
  }

  console.log('✅ Seed finalizat cu succes!');
}

main().catch((err) => {
  console.error('Eroare neașteptată:', err);
  process.exit(1);
});
