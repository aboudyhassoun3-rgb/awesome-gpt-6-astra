// APEX CLUB i18n dictionary — Arabic (default) + English. No external libraries.
export const LANG_KEY = 'apex-lang';
export const SUPPORTED = ['ar', 'en'];

export function getLang() {
  try {
    const v = globalThis.localStorage?.getItem(LANG_KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch {}
  return 'ar';
}

export function setLang(lang) {
  const next = lang === 'en' ? 'en' : 'ar';
  try { globalThis.localStorage?.setItem(LANG_KEY, next); } catch {}
  applyDocumentLang(next);
  return next;
}

export function applyDocumentLang(lang) {
  const l = lang || getLang();
  try {
    const doc = globalThis.document?.documentElement;
    if (doc) {
      doc.lang = l;
      doc.dir = l === 'ar' ? 'rtl' : 'ltr';
    }
  } catch {}
  return l;
}

export function t(key, lang) {
  const l = lang || getLang();
  const table = STRINGS[l] || STRINGS.ar;
  if (table[key] !== undefined) return table[key];
  if (STRINGS.en[key] !== undefined) return STRINGS.en[key];
  return key;
}

export function pilotDisplay(name, lang) {
  const l = lang || getLang();
  if (l !== 'ar') return name;
  return PILOT_AR[name] || name;
}

export const PILOT_AR = {
  You: 'أنت',
  NOVA: 'نوفا',
  MILO: 'ميلو',
  KIRA: 'كيرا',
  AXEL: 'أكسل',
  LUNA: 'لونا',
  ZEKE: 'زيك',
  ECHO: 'إيكو',
};

export const STRINGS = {
en: {
  loadingTitle: 'APEX CLUB', loadingSub: 'Preparing Bay Circuit…',
  errTitle: 'Unable to start the race', errText: 'Your browser needs WebGL 2. Try reloading or enabling hardware acceleration.', errReload: 'Reload game',
  navGarage: 'Garage', navSettings: 'Settings', langToggle: 'العربية',
  lobbyEyebrow: 'BAY CIRCUIT / 3 LAPS', lobbyH1a: 'Make every', lobbyH1b: 'corner count.',
  lobbyP: 'One driver. Seven rivals. Your racing line.',
  quickRace: 'QUICK RACE', readyToRace: 'Ready to race?', raceMode: 'Race mode',
  teamRace: 'Team Race', teamRaceSub: '4 VS 4 · TEAM POINTS', soloRace: 'Solo Race', soloRaceSub: '8 RACERS · ONE WINNER',
  yourTeam: 'Your team', blueTide: 'Blue Tide', blueSub: 'YOU + 3 AI', redRush: 'Red Rush', redSub: 'YOU + 3 AI',
  yourKart: 'Your kart', kartSpecs: 'Car specifications',
  kartSpecsNote: 'Acceleration, handling and drift use APEX as the 100% baseline. Team races use team colors.',
  raceStart: 'Let’s race', raceDisclosure: 'Local race · You + 7 AI · Auto throttle on by default',
  modeTeam: '4V4 TEAM RACE', modeSolo: 'SOLO / 7 AI RIVALS',
  trackTitle: 'Bay Circuit', lap: 'LAP', sector: 'SECTOR', raceTime: 'RACE TIME',
  position: 'POSITION', livePoints: 'LIVE POINTS', blue: 'BLUE', red: 'RED',
  liveMap: 'BAY CIRCUIT / LIVE MAP', yourKartLabel: 'YOUR KART',
  speed: 'SPEED', kmh: 'KM/H', rev: 'REV',
  barNitro: 'SHIFT · NITRO STOCK', barShield: 'SHIELD', barWeapon: 'Q · EMP · NO FRIENDLY FIRE',
  driftDefault: 'CORNER + SPACE + STEER → DRIFT', driftHintDefault: 'Charge, then release SPACE for a mini turbo.',
  steering: 'STEERING', left: 'LEFT', right: 'RIGHT', brakeRev: 'BRAKE / REV', go: 'GO', autoDrive: 'AUTO THROTTLE',
  emp: 'EMP', ready: 'READY', nitro: 'NITRO', drift: 'DRIFT', holdToSlide: 'HOLD TO SLIDE',
  centerTilt: 'CENTER TILT', rotateHint: '↻ Rotate your phone for a wider view',
  controlsToggle: 'H · PAUSE / HELP',
  helpAccel: 'Accel.', helpSteer: 'Steer', helpDrift: 'Drift', helpNitro: 'Nitro', helpEmp: 'EMP', helpRestart: 'Restart',
  boostActive: 'BOOST ACTIVE', pitstop: 'PIT STOP', takeBreather: 'Take a breather.',
  controlsDescA: 'W / ↑ to accelerate, S / ↓ to brake / reverse, A / D or ← / → to steer.',
  controlsDescB: 'Press H at any time to pause or resume.',
  cgDrift: 'Drift through a corner', cgRelease: 'Mini turbo', cgNitro: 'Use 1 nitro charge',
  cgEmp: 'Disrupt nearby opponents', cgRestart: 'Restart the entire race',
  pointsNote: 'Points by position: 15 / 12 / 10 / 8 / 6 / 4 / 2 / 1. Racing ends 20 seconds after the first finish. DNF racers score zero; equal team scores result in a draw.',
  recover: 'Recover car to track', resume: 'Resume race', backLobby: 'Back to lobby', backLobbyChange: 'Back to lobby / Change team',
  chequered: 'CHEQUERED FLAG / FINAL RESULTS', raceComplete: 'Race complete',
  thPlace: 'Place', thRacer: 'Racer', thTime: 'Finish time', thPoints: 'Points', raceAgain: 'Race again',
  pitGarage: 'PIT GARAGE', settings: 'Settings', done: 'Done',
  tabControls: 'Controls', tabDisplay: 'Sound & display', tabDriver: 'Driver',
  autoAccel: 'Auto-accelerate', autoAccelSub: 'Acceleration only. You must steer.',
  phoneControls: 'PHONE CONTROLS', phoneControlsDesc: 'Auto-accelerate is recommended. Hold arrows to steer and DRIFT to slide; release DRIFT for a mini turbo.',
  fullscreen: 'Fullscreen / landscape ↗', screenHint: 'Play sideways for the best view.',
  enableTilt: 'Enable tilt steering', disableTilt: 'Disable tilt steering', centerSteering: 'Center steering',
  tiltDefault: 'Optional: steer by tilting your phone. Touch arrows always override tilt.',
  tiltReady: 'Tilt ready · Hold comfortably, then lean left / right.',
  tiltWaiting: 'Hold the phone comfortably. Waiting for sensor…',
  tiltNoData: 'No motion data. Use touch controls or allow Motion & Orientation in browser settings.',
  tiltDenied: 'Motion unavailable or permission denied. Touch steering is ready.',
  tiltTouchActive: 'Touch steering active.', tiltHoldStill: 'Hold still to center steering…',
  tiltEnableFirst: 'Enable tilt steering first, or use the arrow buttons.',
  screenHintLandscape: 'Rotate your phone sideways. If needed, turn off rotation lock.',
  driftTip: '↝ DRIFT TIP', driftTipDesc: 'At speed, hold SPACE + STEER. Keep SPACE held while countersteering. Release for a mini turbo.',
  settingsHelp: 'Keyboard: W accelerate · S brake / reverse · A / D steer · Shift nitro · Q EMP. Hold S or BRAKE at rest to reverse. Brake overrides auto throttle. Pause to recover if stuck.',
  engineSounds: 'Engine & race sounds', toggleDrift: 'Toggle drift key (tap SPACE twice)', reducedMotion: 'Reduced camera motion',
  graphics: 'Graphics', quality: 'Quality', performance: 'Performance',
  settingsSaveNote: 'Keyboard or mobile touch controls. Settings save on this device.',
  driverProfile: 'DRIVER PROFILE', aceRookie: 'ACE / CLUB ROOKIE', standingBy: 'STANDING BY',
  dragRotate: 'DRAG TO ROTATE', actStand: 'Stand', actDance: '♫ Dance', actVictory: '★ Victory',
  danceLabel: 'DANCE / STREET GROOVE', victoryLabel: 'VICTORY / CELEBRATE',
  statSpeed: 'Speed', statAccel: 'Accel.', statHandling: 'Handling', statDrift: 'Drift',
  msgRecovered: 'CAR RECOVERED / NO PROGRESS GAIN', msgNitro: 'NITRO ENGAGED',
  msgSuperMini: 'SUPER MINI TURBO', msgMini: 'MINI TURBO', msgFinalLap: 'FINAL LAP', msgLap2: 'LAP 2',
  msgFinishWait: 'FINISH / WAITING FOR RACERS', msgEmp: 'EMP BURST',
  msgBoostPickup: 'BOOST OVERCHARGE', msgShield: 'PHASE SHIELD', msgWeapon: 'EMP ARMED',
  msgGo: 'GO! / FULL THROTTLE', hudNitro: 'NITRO', hudMini: 'MINI TURBO', hudTurbo: 'TURBO',
  driftNitroBoost: 'NITRO BOOST', driftSuperReady: 'SUPER TURBO READY', driftTurboReady: 'TURBO READY',
  driftCharging: 'DRIFT / CHARGING', driftHoldTouch: 'HOLD DRIFT + STEER', driftHoldKey: 'HOLD SPACE + STEER',
  driftSuperHint: 'Super turbo ready · Release SPACE', driftSuperHintToggle: 'Super turbo ready · Tap SPACE',
  driftTurboHint: 'Turbo ready · Keep charging to upgrade',
  driftHoldHint: 'Hold SPACE to slide · Release to boost', driftHoldHintToggle: 'Tap SPACE again to release boost',
  driftFinished: 'FINISHED / AWAITING RESULTS', driftWaiting: 'Waiting for racers',
  lbYou: 'YOU', lbAi: 'AI', lbFinish: 'FINISH', lbTeammate: 'TEAMMATE', lbRival: 'RIVAL',
  resDraw: 'DRAW', resBlueWins: 'BLUE TEAM WINS', resRedWins: 'RED TEAM WINS', resYouWin: 'YOU WIN!',
  resSubtitleTeam: 'Points awarded to finishers', resSubtitleSolo: 'Your position: P{rank} · Bay Circuit / 3 laps',
  resDnf: 'DNF', resYouSuffix: ' / YOU', resAiSuffix: ' / AI',
  touchTapBoost: 'TAP TO BOOST', touchDriftFill: 'DRIFT TO FILL', touchCharging: 'CHARGING', touchRelease: 'RELEASE TO BOOST',
  touchEmpWait: '{n}s', canvasRaceAria: '3D kart racing. WASD to drive, SPACE plus steering to drift, H to pause.',
  // garage
  garageTitle: 'TITAN — APEX CLUB Garage', garageBrand: 'APEX CLUB / GARAGE', garageBack: 'Back to race ↗',
  garageIntro: 'ENGINEERED FOR THE OUTSIDE LINE', garageH1sub: '01 / ARMORED SERIES',
  viewOverview: 'Overview', viewFront: 'Front', viewSide: 'Side', viewRear: 'Rear', viewTop: 'Top',
  garageHint: 'DRAG TO ORBIT · SCROLL TO ZOOM · ARROW KEYS TO ROTATE',
  garageEyebrow: 'HEAVYWEIGHT. LIGHT ON ITS FEET.', garageH2a: 'Built to', garageH2b: 'take the line.',
  garageDesc: 'A wide-track machine with layered armor, exposed suspension and an unmistakable mechanical silhouette.',
  specChassis: 'CHASSIS', specChassisV: 'Reinforced spaceframe', specSusp: 'SUSPENSION', specSuspV: 'Independent double wishbone',
  specWheels: 'WHEELS', specWheelsV: 'Deep-tread / six-spoke alloy', specPower: 'POWERTRAIN', specPowerV: 'Rear-mounted / twin exhaust',
  optRotate: 'Auto rotate', optDriver: 'Show driver', optWire: 'Wireframe',
  garageCta: 'Take it to the circuit ↗',
  garageNote: 'Original procedural vehicle inspired by the supplied racing reference. Every angle is rendered in 3D.',
  garageError: 'Unable to load the 3D garage. Please use a browser with WebGL 2.',
  colorTeal: 'Glacier teal', colorCopper: 'Desert copper', colorSilver: 'Arctic silver',
  canvasGarageAria: 'TITAN 3D vehicle. Drag to rotate, scroll to zoom, arrow keys to rotate.',
  driverUnavailable: '3D preview unavailable on this device',
},
ar: {
  loadingTitle: 'نادي أبيكس', loadingSub: 'نجهّز حلبة الخليج…',
  errTitle: 'تعذّر بدء السباق', errText: 'متصفحك يحتاج إلى WebGL 2. حاول إعادة التحميل أو تفعيل تسريع العتاد.', errReload: 'إعادة تحميل اللعبة',
  navGarage: 'الكراج', navSettings: 'الإعدادات', langToggle: 'EN',
  lobbyEyebrow: 'حلبة الخليج / ٣ لفات', lobbyH1a: 'اجعل كل', lobbyH1b: 'منعطف في صالحك.',
  lobbyP: 'سائق واحد. سبعة منافسين. وخطّك الخاص في السباق.',
  quickRace: 'سباق سريع', readyToRace: 'جاهز للسباق؟', raceMode: 'نمط السباق',
  teamRace: 'سباق فرق', teamRaceSub: '٤ ضد ٤ · نقاط الفريق', soloRace: 'سباق فردي', soloRaceSub: '٨ متسابقين · فائز واحد',
  yourTeam: 'فريقك', blueTide: 'الموج الأزرق', blueSub: 'أنت + ٣ ذكاء اصطناعي', redRush: 'الاندفاع الأحمر', redSub: 'أنت + ٣ ذكاء اصطناعي',
  yourKart: 'عربتك', kartSpecs: 'مواصفات العربة',
  kartSpecsNote: 'التسارع والتحكم والانجراف تُقاس بالنسبة لعربة APEX كأساس ١٠٠٪. سباقات الفرق تستخدم ألوان الفريق.',
  raceStart: 'هيّا إلى السباق', raceDisclosure: 'سباق محلي · أنت + ٧ ذكاء اصطناعي · التسارع التلقائي مفعّل افتراضيًا',
  modeTeam: 'سباق فرق ٤ ضد ٤', modeSolo: 'فردي / ٧ منافسين',
  trackTitle: 'حلبة الخليج', lap: 'لفة', sector: 'قطاع', raceTime: 'زمن السباق',
  position: 'المركز', livePoints: 'نقاط مباشرة', blue: 'الأزرق', red: 'الأحمر',
  liveMap: 'حلبة الخليج / خريطة مباشرة', yourKartLabel: 'عربتك',
  speed: 'السرعة', kmh: 'كم/س', rev: 'رجوع',
  barNitro: 'نيترو · المخزون', barShield: 'الدرع', barWeapon: 'زر Q · نبضة كهرومغناطيسية · بلا نيران صديقة',
  driftDefault: 'منعطف + مسافة + توجيه ← انجراف', driftHintDefault: 'اشحن ثم أفلت زر المسافة لدفعة توربو مصغّرة.',
  steering: 'التوجيه', left: 'يسار', right: 'يمين', brakeRev: 'فرامل / رجوع', go: 'انطلق', autoDrive: 'تسارع تلقائي',
  emp: 'نبضة', ready: 'جاهز', nitro: 'نيترو', drift: 'انجراف', holdToSlide: 'استمر للانزلاق',
  centerTilt: 'توسيط الميل', rotateHint: '↻ أدر هاتفك لعرض أوسع',
  controlsToggle: 'ح · إيقاف / مساعدة',
  helpAccel: 'تسارع.', helpSteer: 'توجيه', helpDrift: 'انجراف', helpNitro: 'نيترو', helpEmp: 'نبضة', helpRestart: 'إعادة',
  boostActive: 'الدفع نشط', pitstop: 'توقف الصيانة', takeBreather: 'خذ نفسًا.',
  controlsDescA: 'زر W / ↑ للتسارع، وS / ↓ للفرامل / الرجوع، وA / D أو ← / → للتوجيه.',
  controlsDescB: 'اضغط حرف ح في أي وقت للإيقاف المؤقت أو المتابعة.',
  cgDrift: 'انجرف داخل المنعطف', cgRelease: 'توربو مصغّر', cgNitro: 'استخدم شحنة نيترو واحدة',
  cgEmp: 'شوّش على المنافسين القريبين', cgRestart: 'إعادة السباق كاملًا',
  pointsNote: 'النقاط حسب المركز: ١٥ / ١٢ / ١٠ / ٨ / ٦ / ٤ / ٢ / ١. ينتهي السباق بعد ٢٠ ثانية من أول واصل. من لم يُكمل لا ينال نقاطًا؛ وتساوي الفريقين يعني التعادل.',
  recover: 'إعادة العربة إلى المسار', resume: 'مواصلة السباق', backLobby: 'عودة إلى اللوبي', backLobbyChange: 'عودة إلى اللوبي / تغيير الفريق',
  chequered: 'العلم الشطرنجي / النتائج النهائية', raceComplete: 'اكتمل السباق',
  thPlace: 'المركز', thRacer: 'المتسابق', thTime: 'زمن الوصول', thPoints: 'النقاط', raceAgain: 'سباق جديد',
  pitGarage: 'كراج الصيانة', settings: 'الإعدادات', done: 'تم',
  tabControls: 'التحكم', tabDisplay: 'الصوت والعرض', tabDriver: 'السائق',
  autoAccel: 'تسارع تلقائي', autoAccelSub: 'التسارع فقط. التوجيه عليك.',
  phoneControls: 'تحكم الهاتف', phoneControlsDesc: 'يُنصح بالتسارع التلقائي. استمر على الأسهم للتوجيه وزر الانجراف للانزلاق؛ أفلته لدفعة توربو مصغّرة.',
  fullscreen: 'ملء الشاشة / أفقي ↗', screenHint: 'العب بالوضع الأفقي لأفضل عرض.',
  enableTilt: 'تفعيل التوجيه بالميل', disableTilt: 'إيقاف التوجيه بالميل', centerSteering: 'توسيط التوجيه',
  tiltDefault: 'اختياري: وجّه بإمالة هاتفك. أسهم اللمس تتجاوز الميل دائمًا.',
  tiltReady: 'الميل جاهز · امسك براحة ثم مِل يمينًا / يسارًا.',
  tiltWaiting: 'امسك الهاتف براحة. بانتظار الحساس…',
  tiltNoData: 'لا توجد بيانات حركة. استخدم أزرار اللمس أو اسمح بالحركة في إعدادات المتصفح.',
  tiltDenied: 'الحركة غير متاحة أو رُفض الإذن. التوجيه باللمس جاهز.',
  tiltTouchActive: 'التوجيه باللمس نشط.', tiltHoldStill: 'اثبت لتوسيط التوجيه…',
  tiltEnableFirst: 'فعّل التوجيه بالميل أولًا، أو استخدم أزرار الأسهم.',
  screenHintLandscape: 'أدر هاتفك أفقيًا. أوقف قفل التدوير عند الحاجة.',
  driftTip: '↝ تلميح الانجراف', driftTipDesc: 'أثناء السرعة، استمر بزر المسافة + التوجيه. حافظ على المسافة مع التوجيه المعاكس. أفلت لدفعة توربو مصغّرة.',
  settingsHelp: 'لوحة المفاتيح: W تسارع · S فرامل / رجوع · A / D توجيه · Shift نيترو · Q نبضة. استمر بـ S أو الفرامل عند التوقف للرجوع. الفرامل تتجاوز التسارع التلقائي. أوقف مؤقتًا للاسترداد عند التعثر.',
  engineSounds: 'أصوات المحرك والسباق', toggleDrift: 'زر انجراف تبديلي (اضغط المسافة مرتين)', reducedMotion: 'تقليل حركة الكاميرا',
  graphics: 'الرسوميات', quality: 'جودة', performance: 'أداء',
  settingsSaveNote: 'تحكم بلوحة المفاتيح أو اللمس. تُحفظ الإعدادات على هذا الجهاز.',
  driverProfile: 'ملف السائق', aceRookie: 'آيس / مبتدئ النادي', standingBy: 'في الانتظار',
  dragRotate: 'اسحب للتدوير', actStand: 'وقوف', actDance: '♫ رقص', actVictory: '★ احتفال',
  danceLabel: 'رقص / إيقاع الشارع', victoryLabel: 'احتفال / فوز',
  statSpeed: 'السرعة', statAccel: 'التسارع', statHandling: 'التحكم', statDrift: 'الانجراف',
  msgRecovered: 'تمت استعادة العربة / بلا تقدم إضافي', msgNitro: 'تم تفعيل النيترو',
  msgSuperMini: 'توربو مصغّر خارق', msgMini: 'توربو مصغّر', msgFinalLap: 'اللفة الأخيرة', msgLap2: 'اللفة الثانية',
  msgFinishWait: 'النهاية / بانتظار المتسابقين', msgEmp: 'دفعة كهرومغناطيسية',
  msgBoostPickup: 'شحن نيترو مضاعف', msgShield: 'درع الحماية', msgWeapon: 'النبضة جاهزة',
  msgGo: 'انطلق! / بأقصى سرعة', hudNitro: 'نيترو', hudMini: 'توربو مصغّر', hudTurbo: 'توربو',
  driftNitroBoost: 'دفع نيترو', driftSuperReady: 'توربو خارق جاهز', driftTurboReady: 'التوربو جاهز',
  driftCharging: 'انجراف / شحن', driftHoldTouch: 'استمر بالانجراف + التوجيه', driftHoldKey: 'استمر بالمسافة + التوجيه',
  driftSuperHint: 'توربو خارق جاهز · أفلت المسافة', driftSuperHintToggle: 'توربو خارق جاهز · اضغط المسافة',
  driftTurboHint: 'التوربو جاهز · واصل الشحن للترقية',
  driftHoldHint: 'استمر بالمسافة للانزلاق · أفلت للدفع', driftHoldHintToggle: 'اضغط المسافة مجددًا لإطلاق الدفع',
  driftFinished: 'انتهيت / بانتظار النتائج', driftWaiting: 'بانتظار المتسابقين',
  lbYou: 'أنت', lbAi: 'ذكاء', lbFinish: 'واصل', lbTeammate: 'زميل', lbRival: 'خصم',
  resDraw: 'تعادل', resBlueWins: 'الفريق الأزرق يفوز', resRedWins: 'الفريق الأحمر يفوز', resYouWin: 'فزت!',
  resSubtitleTeam: 'تُمنح النقاط لمن أكملوا السباق', resSubtitleSolo: 'مركزك: P{rank} · حلبة الخليج / ٣ لفات',
  resDnf: 'لم يُكمل', resYouSuffix: ' / أنت', resAiSuffix: ' / ذكاء',
  touchTapBoost: 'اضغط للدفع', touchDriftFill: 'انجرف للشحن', touchCharging: 'شحن', touchRelease: 'أفلت للدفع',
  touchEmpWait: '{n} ث', canvasRaceAria: 'سباق عربات ثلاثي الأبعاد. WASD للقيادة، مسافة مع التوجيه للانجراف، ح للإيقاف.',
  garageTitle: 'تيتان — كراج نادي أبيكس', garageBrand: 'نادي أبيكس / الكراج', garageBack: 'عودة إلى السباق ↗',
  garageIntro: 'مصممة للخط الخارجي', garageH1sub: '٠١ / سلسلة المدرعات',
  viewOverview: 'نظرة عامة', viewFront: 'أمام', viewSide: 'جانب', viewRear: 'خلف', viewTop: 'أعلى',
  garageHint: 'اسحب للتدوير · مرّر للتكبير · الأسهم للتدوير',
  garageEyebrow: 'ثقيلة الوزن. خفيفة الحركة.', garageH2a: 'مصممة', garageH2b: 'لخطف الصدارة.',
  garageDesc: 'آلة واسعة المسار بدروع متعددة ونظام تعليق مكشوف وهيكل ميكانيكي لا يُخطأ.',
  specChassis: 'الهيكل', specChassisV: 'هيكل فضائي مقوّى', specSusp: 'التعليق', specSuspV: 'مستقل مزدوج الترقوة',
  specWheels: 'العجلات', specWheelsV: 'عميقة النقشة / سبيكة سداسية', specPower: 'المحرك', specPowerV: 'خلفي / عادم مزدوج',
  optRotate: 'تدوير تلقائي', optDriver: 'إظهار السائق', optWire: 'شبكي',
  garageCta: 'خذها إلى الحلبة ↗',
  garageNote: 'عربة أصلية مولّدة إجرائيًا مستوحاة من مرجع السباق. كل زاوية تُرسم ثلاثية الأبعاد.',
  garageError: 'تعذّر تحميل الكراج ثلاثي الأبعاد. استخدم متصفحًا يدعم WebGL 2.',
  colorTeal: 'فيروزي جليدي', colorCopper: 'نحاسي صحراوي', colorSilver: 'فضي قطبي',
  canvasGarageAria: 'عربة تيتان ثلاثية الأبعاد. اسحب للتدوير، مرّر للتكبير، الأسهم للتدوير.',
  driverUnavailable: 'المعاينة ثلاثية الأبعاد غير متاحة على هذا الجهاز',
}};

export const KART_AR = {
  COMET: { title: 'خفيفة', tag: 'رشاقة في التوجيه', description: 'خفيفة وسريعة الاستجابة. مصممة لتغيير الاتجاه بسرعة.' },
  APEX: { title: 'متوازنة', tag: 'متوازنة جيدًا', description: 'سرعة وتحكم متوازنان. عربة رائعة لسباقك الأول.' },
  BOLT: { title: 'سرعة قصوى', tag: 'سرعة قصوى', description: 'سرعة قصوى عالية وهيكل عريض. خطط لدخول المنعطفات مبكرًا.' },
  SLIDE: { title: 'متخصصة انجراف', tag: 'خبيرة انجراف', description: 'هيكل منخفض وجناح خلفي مزدوج. شحن الانجراف أسرع من APEX بنسبة ٤٠٪.' },
  TITAN: { title: 'مدرعة', tag: 'آلة ثقيلة', description: 'عربة مدرعة واسعة المسار. إطارات عميقة وتعليق مستقل وفتحات تهوية مكشوفة وقمرة معززة.' },
  VINTAGE: { title: 'كلاسيكية', tag: 'انطلاق سريع', description: 'مصابيح دائرية وشبك كروم. تسارع سريع مع سرعة قصوى أقل.' },
};
