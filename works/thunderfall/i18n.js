// Thunderfall i18n: Arabic (default) / Chinese / English. No external dependencies.
// data.js remains the Chinese source of truth (tests import it); this module
// provides localized views keyed by id so gameplay logic never breaks.
const STORE_KEY = 'thunderfall:lang';
export const LANGS = ['ar', 'zh', 'en'];

function storedLang() {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(STORE_KEY) : null;
    if (v === '"ar"' || v === '"zh"' || v === '"en"') return JSON.parse(v);
    if (v === 'ar' || v === 'zh' || v === 'en') return v;
  } catch { /* storage blocked: fall through to default */ }
  return 'ar';
}

let lang = storedLang();
const listeners = new Set();

export function getLang() { return lang; }
export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* keep playing */ }
  applyDocumentLang();
  for (const fn of listeners) { try { fn(next); } catch { /* keep UI alive */ } }
}
export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function applyDocumentLang() {
  try {
    const html = document.documentElement;
    html.lang = lang === 'zh' ? 'zh-CN' : lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  } catch { /* non-DOM (tests) */ }
}

// ---- Localized game data (ids match data.js) ----
const SHIPS = [
  {
    name: { ar: 'الصقر', zh: '鹰隼', en: 'Falcon' },
    role: { ar: 'طراز اعتراضي سريع متوازن', zh: '高速均衡型', en: 'Fast balanced interceptor' },
    description: { ar: 'مناورة مرنة ونيران متوازنة. مثالي لاختراق وابل الرصاص ومطاردة الإمدادات.', zh: '灵活转向，均衡火力。适合穿梭弹幕、追逐补给。', en: 'Agile handling, balanced firepower. Built for weaving through bullets and chasing supplies.' },
  },
  {
    name: { ar: 'المنشور', zh: '棱镜', en: 'Prism' },
    role: { ar: 'طراز هجومي عالي الطاقة', zh: '高能突击型', en: 'High-energy striker' },
    description: { ar: 'نيران أقوى ودرع أخف. اغتنم نوافذ الهجوم لاختراق أسراب العدو.', zh: '火力更强，装甲较轻。把握攻击窗口击穿机群。', en: 'Stronger firepower, lighter armor. Seize attack windows to pierce enemy packs.' },
  },
  {
    name: { ar: 'الحصن', zh: '堡垒', en: 'Bastion' },
    role: { ar: 'طراز بقاء مدرّع ثقيل', zh: '重装生存型', en: 'Heavy survival armor' },
    description: { ar: 'درع سميك وقنبلة إضافية. قايض البقاء الطويل بفرص الهجوم المرتد.', zh: '厚重装甲，额外炸弹。用持久生存换取反击机会。', en: 'Thick armor and a bonus bomb. Trade endurance for counterattack chances.' },
  },
];

const WEAPONS = {
  pulse: {
    name: { ar: 'نبضة العاصفة', zh: '风暴脉冲', en: 'Storm Pulse' },
    rarity: { ar: 'أزرق', zh: '蓝色', en: 'Blue' },
    tier: { ar: 'أزرق', zh: '蓝色', en: 'BLUE' },
    colorName: 'BLUE',
    description: { ar: 'تشتت مروحي يغطي مساحة واسعة، مثالي لتنظيف الأعداء المتباعدين.', zh: '扇形散射覆盖宽阔空域，适合清理分散敌机。', en: 'Fan-shaped spread covering wide airspace. Great against scattered enemies.' },
    short: { ar: 'تشتت', zh: '散射', en: 'Spread' },
  },
  laser: {
    name: { ar: 'شعاع الزمرد', zh: '翡翠光束', en: 'Emerald Beam' },
    rarity: { ar: 'أخضر', zh: '绿色', en: 'Green' },
    tier: { ar: 'أخضر', zh: '绿色', en: 'GREEN' },
    colorName: 'GREEN',
    description: { ar: 'ليزر عالي الطاقة يخترق الأهداف الأمامية والخلفية، مثالي للأسراب الطولية والزعماء.', zh: '高能激光穿透前后目标，适合纵向机群与首领。', en: 'High-energy laser piercing front and rear targets. Ideal for columns and bosses.' },
    short: { ar: 'اختراق', zh: '穿透', en: 'Pierce' },
  },
  arc: {
    name: { ar: 'مطارِد البرق البنفسجي', zh: '紫电追猎', en: 'Violet Hunter' },
    rarity: { ar: 'بنفسجي', zh: '紫色', en: 'Purple' },
    tier: { ar: 'بنفسجي', zh: '紫色', en: 'PURPLE' },
    colorName: 'PURPLE',
    description: { ar: 'قذائف موجّهة تلاحق الأعداء، لتواصل إلحاق الضرر أثناء المناورة.', zh: '追踪弹转向寻找敌机，让闪避时也能持续输出。', en: 'Homing rounds seek enemies, so you keep dealing damage while dodging.' },
    short: { ar: 'تعقّب', zh: '追踪', en: 'Homing' },
  },
  nova: {
    name: { ar: 'نوفا الهالة', zh: '日冕新星', en: 'Corona Nova' },
    rarity: { ar: 'ذهبي', zh: '金色', en: 'Gold' },
    tier: { ar: 'ذهبي', zh: '金色', en: 'GOLD' },
    colorName: 'GOLD',
    description: { ar: 'قذائف انفجارية تُلحق ضرر منطقة، مثالية لتفكيك التشكيلات الكثيفة.', zh: '爆裂弹制造范围伤害，适合击破密集阵列。', en: 'Explosive rounds deal area damage. Ideal for breaking dense formations.' },
    short: { ar: 'انفجار', zh: '爆裂', en: 'Blast' },
  },
};

const STAGES = [
  {
    name: { ar: 'ميناء الفجر', zh: '晨曦海港', en: 'Dawn Harbor' },
    bossName: { ar: 'طراد الأجنحة المشقوقة', zh: '裂翼巡航舰', en: 'Riftwing Cruiser' },
    description: { ar: 'أقلع من ميناء فيروزي عميق، واشق طريقك بين أسراب الاستطلاع ووابل الرصاص المروحي.', zh: '从深青色海港升空，在斥候编队与扇形弹幕中打开航路。', en: 'Launch from a deep-teal harbor and cut a path through scout wings and fan barrages.' },
    tip: { ar: 'النقطة المضيئة في وسط جسم الطائرة هي نواة الإصابة. ركّز على الحركة أثناء إطلاق النار التلقائي.', zh: '机身中央的小光点才是受击核心。自动开火时专注移动。', en: 'The small glowing dot at your hull center is the hit core. Focus on movement while auto-fire runs.' },
  },
  {
    name: { ar: 'وادي الزمرد', zh: '翡翠峡谷', en: 'Emerald Canyon' },
    bossName: { ar: 'ناسج الوادي', zh: '峡谷织网者', en: 'Canyon Weaver' },
    description: { ar: 'اعبر وديانًا خضراء متطبقة، وتعرّف على قذائف القوس المنحرفة جانبيًا.', zh: '穿越层叠绿谷，辨认会横向漂移的电弧弹。', en: 'Cross layered green valleys and learn to read sideways-drifting arc shots.' },
    tip: { ar: 'القذائف المنحرفة تغيّر موضعها الأفقي. احتفظ بمساحة جانبية ولا تلتصق بالحافة.', zh: '漂移弹会改变横向位置。保留侧向空间，避免贴死边缘。', en: 'Drifting shots change lateral position. Keep side room and avoid hugging the edge.' },
  },
  {
    name: { ar: 'مصفوفة الجليد', zh: '冰川阵列', en: 'Frost Array' },
    bossName: { ar: 'قاضي الصقيع', zh: '寒霜裁决者', en: 'Frost Arbiter' },
    description: { ar: 'حلّق فوق مصفوفة زرقاء جليدية، وتفادَ قفل الليزر عندما تضيء خطوط التحذير.', zh: '掠过冰蓝色阵列，在预警线亮起时躲开激光封锁。', en: 'Skim an ice-blue array and dodge the laser lockdown once warning lines light up.' },
    tip: { ar: 'الليزر يُحذّر أولًا ثم يُطلق؛ غادر خط الأشعة أثناء التحذير ولا تنتظر اشتعال الشعاع.', zh: '激光先预警再发射；预警期间离开射线，别等光束点亮。', en: 'Lasers warn before firing; leave the beam line during the warning, not after it lights.' },
  },
  {
    name: { ar: 'مصنع النواة المنصهرة', zh: '熔核工厂', en: 'Molten Foundry' },
    bossName: { ar: 'توأم النواة', zh: '熔核双生体', en: 'Molten Twins' },
    description: { ar: 'اقتحم مصنع النواة البرتقالي المحمر، وشق طريقك بين وابل الرصاص المتسارع والقذائف المنحرفة المتقاطعة.', zh: '冲入橘红色熔核工厂，在加速弹阵与交错漂移弹之间寻路。', en: 'Push into the orange-red molten foundry and thread accelerating and crossing drift shots.' },
    tip: { ar: 'ليزر الزعيم في هذا القطاع يمسح المنطقة. واصل مراقبة اتجاه الشعاع بعد التحذير واحتفظ بمساحة للانحراف.', zh: '本关首领的激光会扫动。预警后继续观察光束方向，保留侧移空间。', en: 'This boss sweeps its lasers. Keep watching beam direction after the warning and keep side room.' },
  },
  {
    name: { ar: 'نواة القبة السماوية', zh: '天穹核心', en: 'Sky Reactor' },
    bossName: { ar: 'محرك الفناء السماوي', zh: '天穹·终焉引擎', en: 'Skyfall Final Engine' },
    description: { ar: 'ادخل نواة الفضاء العميق الذهبية الداكنة، وواجه تطويق الليزر والقذائف المنحرفة وزعيم متعدد المراحل.', zh: '驶入暗金色深空核心，应对激光、漂移弹与多阶段首领的合围。', en: 'Enter the dark-golden deep-space core against lasers, drift shots and a multi-phase boss.' },
    tip: { ar: 'القنابل تُنقذك من الحصار. راقب الشحن والدرع وركّز النيران في النوافذ الآمنة.', zh: '炸弹可以解围。留意充能与护盾，在安全窗口集中输出。', en: 'Bombs break sieges. Watch charge and shields, and focus damage in safe windows.' },
  },
];

const UPGRADES = {
  damage: { name: { ar: 'رؤوس عالية الطاقة', zh: '高能弹头', en: 'High-Energy Warheads' }, description: { ar: 'ضرر السلاح +15%.', zh: '武器伤害 +15%。', en: '+15% weapon damage.' }, tag: { ar: 'نيران', zh: '火力', en: 'Firepower' } },
  fireRate: { name: { ar: 'مدافع فائقة التردد', zh: '超频炮组', en: 'Overclocked Batteries' }, description: { ar: 'معدل الرماية +12%.', zh: '射速 +12%。', en: '+12% fire rate.' }, tag: { ar: 'نيران', zh: '火力', en: 'Firepower' } },
  hull: { name: { ar: 'درع مركّب', zh: '复合装甲', en: 'Composite Armor' }, description: { ar: 'الحد الأقصى للجسم +1، وإصلاح نقطتين من الجسم.', zh: '机体上限 +1，并修复 2 点机体。', en: '+1 max hull and repair 2 hull.' }, tag: { ar: 'بقاء', zh: '生存', en: 'Survival' } },
  shield: { name: { ar: 'درع طوري', zh: '相位护盾', en: 'Phase Shield' }, description: { ar: 'الحد الأقصى للدرع +1، وملء الدرع بالكامل.', zh: '护盾上限 +1，并补满护盾。', en: '+1 max shield and refill shields.' }, tag: { ar: 'بقاء', zh: '生存', en: 'Survival' } },
  magnet: { name: { ar: 'حقل الجذب', zh: '牵引力场', en: 'Tractor Field' }, description: { ar: 'نطاق جذب الإمدادات +32 بكسل.', zh: '补给吸附范围 +32 像素。', en: '+32 px supply pickup radius.' }, tag: { ar: 'إمداد', zh: '补给', en: 'Supply' } },
  wingmen: { name: { ar: 'سرب المرافقة', zh: '僚机编队', en: 'Wingman Formation' }, description: { ar: 'أضف طائرة مرافقة تُطلق معك، بحد أقصى طائرتين.', zh: '增加 1 架协同射击的僚机，最多 2 架。', en: 'Add one co-firing wingman, up to 2.' }, tag: { ar: 'دعم', zh: '支援', en: 'Support' } },
  bomb: { name: { ar: 'عتاد الطوارئ', zh: '应急军备', en: 'Emergency Stock' }, description: { ar: 'تزوّد بقنبلتين، والمخزون بحد أقصى 5 قنابل.', zh: '补充 2 枚炸弹，库存最多 5 枚。', en: 'Restock 2 bombs, up to 5 in stock.' }, tag: { ar: 'دعم', zh: '支援', en: 'Support' } },
  reactor: { name: { ar: 'مفاعل التركيز', zh: '聚能反应堆', en: 'Focus Reactor' }, description: { ar: 'الشحن المكتسب من الاحتكاك والقتل +30%.', zh: '擦弹与击杀获得的充能 +30%。', en: '+30% charge from grazes and kills.' }, tag: { ar: 'شحن', zh: '充能', en: 'Charge' } },
};

export function locShip(id) { const s = SHIPS[id] || SHIPS[0]; return { name: s.name[lang], role: s.role[lang], description: s.description[lang] }; }
export function locWeapon(id) { const w = WEAPONS[id] || WEAPONS.pulse; return { name: w.name[lang], rarity: w.rarity[lang], tier: w.tier[lang], colorName: w.colorName, description: w.description[lang], short: w.short[lang] }; }
export function locStage(i) { const s = STAGES[i] || STAGES[0]; return { name: s.name[lang], bossName: s.bossName[lang], description: s.description[lang], tip: s.tip[lang] }; }
export function locUpgrade(id) { const u = UPGRADES[id]; if (!u) return { name: id, description: '', tag: '' }; return { name: u.name[lang], description: u.description[lang], tag: u.tag[lang] }; }

// Floating pickup labels drawn on canvas / shown as toasts (engine + app share these).
export function pickupLabel(kind, weaponId, level) {
  const L = lang;
  if (kind === 'weapon') {
    const w = WEAPONS[weaponId] || WEAPONS.pulse;
    return `${w.name[L]} Lv.${level}`;
  }
  if (kind === 'repair') return L === 'ar' ? 'إصلاح الجسم +2' : L === 'zh' ? '机体修复 +2' : 'Hull repair +2';
  if (kind === 'shield') return L === 'ar' ? 'استعادة الدرع' : L === 'zh' ? '护盾恢复' : 'Shield restored';
  return L === 'ar' ? 'قنبلة صدمية +1' : L === 'zh' ? '震荡炸弹 +1' : 'Shock bomb +1';
}

export function bossShieldText(entering) {
  if (lang === 'ar') return entering ? 'درع الدخول · ضرر موقوف مؤقتًا' : 'درع طوري · ضرر موقوف مؤقتًا';
  if (lang === 'en') return entering ? 'ENTRY SHIELD · DAMAGE BLOCKED' : 'PHASE SHIELD · DAMAGE BLOCKED';
  return entering ? '入场护盾 · 暂时免伤' : '相位护盾 · 暂时免伤';
}

// ---- UI strings (keys used by app.js + static HTML) ----
const UI = {
  ar: {
    'meta.description': 'صواعق الرعد · حملة القبة السماوية: ثلاث طائرات وخمسة قطاعات ووابل رصاص منحنٍ وزعماء متعددو المراحل وأربعة أسلحة ملوّنة. حملة أركيد أصلية لعشر دقائق تدعم لمس الجوال.',
    'brand.home': 'الصفحة الرئيسية لصواعق الرعد',
    'brand.sub': 'حملة القبة السماوية / قيادة الطيران',
    'sound.on.aria': 'كتم الصوت', 'sound.off.aria': 'تشغيل الصوت',
    'sound.on.label': 'صوت', 'sound.off.label': 'صامت',
    'help.aria': 'تعليمات التشغيل وأسلوب اللعب',
    'help.button': '?',
    'left.eyebrow': 'السرب الأخير',
    'left.title.cn': 'صواعق الرعد · حملة القبة السماوية',
    'left.intro': 'اعبر وابل الرصاص وحطّم القبة السماوية.<br>خط الدفاع الأخير تحميه أنت.',
    'route.title': 'مسار الحملة', 'route.sub': '5 قطاعات / +10 دقائق',
    'best.label': 'أعلى نتيجة للحملة على هذا الجهاز', 'best.note': 'تُحفظ في هذا المتصفح فقط · التدريب لا يُحتسب',
    'cabinet.live': 'طيران مباشر', 'cabinet.hangar': 'الحظيرة 01', 'cabinet.size': '480 : 800',
    'canvas.aria': 'ساحة المعركة. اسحب الطائرة من أي موضع للتحرك، أو استخدم الأسهم و WASD؛ إطلاق النار تلقائي. المسافة للقنبلة، و E للانفجار، و P للإيقاف.',
    'hud.score': 'النتيجة', 'hud.sector': 'القطاع',
    'hull.aria': 'متانة الجسم', 'shield.aria': 'الدرع',
    'pause.aria': 'إيقاف المعركة مؤقتًا',
    'hangar.kicker': 'المهمة 001 — السماء تناديك',
    'hangar.title': 'اختر طائرتك',
    'hangar.sub': 'ثلاثة طرازات. ومسار واحد نحو القبة السماوية.',
    'hangar.ready': 'جاهز للانطلاق',
    'ship.stats.hull': 'الجسم', 'ship.stats.shield': 'الدرع', 'ship.stats.speed': 'السرعة', 'ship.stats.bombs': 'القنابل',
    'difficulty.label': 'الصعوبة',
    'difficulty.normal': 'قياسي · قنبلة تلقائية عند الضربة القاتلة',
    'difficulty.arcade': 'أركيد · وابل أكثف وقنابل يدوية',
    'run.label': 'مسار الرحلة',
    'run.campaign': 'حملة كاملة · 5 قطاعات / من 10 دقائق',
    'run.s0': 'تدريب · 01 ميناء الفجر', 'run.s1': 'تدريب · 02 وادي الزمرد', 'run.s2': 'تدريب · 03 مصفوفة الجليد', 'run.s3': 'تدريب · 04 مصنع النواة', 'run.s4': 'تدريب · 05 نواة القبة',
    'start': 'ابدأ الحملة', 'start.auto': 'إطلاق تلقائي مفعّل',
    'start.hint': 'السحب للحركة / WASD · إطلاق تلقائي · قابل للعب على الجوال',
    'bomb': 'قنبلة صدمية', 'bomb.unit': 'قنبلة', 'overdrive': 'انفجار الرعد', 'focus': 'حركة دقيقة', 'focus.sub': 'SHIFT · سرعة منخفضة',
    'bottom.hangar': 'إطلاق تلقائي / اسحب للطيران',
    'bottom.reward': 'تمشيط الغنائم · التقط الإمدادات', 'bottom.boss': 'الزعيم مشتبك', 'bottom.normal': 'احتكاك +25 / تضاعف أقصى ×5',
    'loadout.title': 'العتاد الحالي', 'loadout.sub': 'العتاد',
    'supply.title': 'إمدادات الميدان', 'supply.sub': '10 ثوانٍ للالتقاط',
    'supply.note': 'أسقط الأعداء وطارد الإمدادات العائمة.<br>نفس النوع يرقّي، والنوع المختلف يبدّل مع حفظ المستوى.',
    'manual.title': 'دليل الطيران', 'manual.sub': 'ملاحظات ميدانية',
    'manual.1t': 'انتبه لخطوط التحذير', 'manual.1d': 'الليزر لا يضر إلا بعد خط التحذير المتقطع.',
    'manual.2t': 'الاحتكاك يشحن طاقتك', 'manual.2d': 'اقترب من الرصاص لتشحن انفجارًا ناريًا لـ 8 ثوانٍ.',
    'manual.3t': 'احتفظ بقنبلة', 'manual.3d': 'تمسح وابل الرصاص وتمنحك حصانة قصيرة.',
    'project.note': 'تجربة أركيد أصلية', 'project.sub': 'رسوم وأصوات مولّدة برمجيًا<br>صُنعت مع GPT-6 Astra',
    'reduced.off': 'تقليل الحركة الزخرفية: متوقف', 'reduced.on': 'تقليل الحركة الزخرفية: مفعّل',
    'footer.1': 'نقطة إصابة صغيرة. وسماء شاسعة جدًا.', 'footer.2': 'لعب مجاني / بلا تسجيل / بلا إعلانات',
    'help.kicker': 'دليل الطيران',
    'help.title': 'عشر دقائق تعبر خمسة قطاعات.',
    'help.intro': 'كل قطاع 120 ثانية على الأقل، ويجب إسقاط زعيمه للتقدم؛ واختيار التعزيز بين القطاعات لا يُحتسب ضمن زمن القتال. ضعف النيران يطيل معارك الزعماء. التدريب قطاع واحد ولا يُحتسب في سجل الحملة.',
    'help.m1t': 'الجوال / الفأرة', 'help.m1d': 'اضغط واسحب في أي موضع من ساحة المعركة. الطائرة تطلق تلقائيًا والحركة نسبية فلا تقفز نحو إصبعك. الأزرار الثلاثة السفلية متاحة دائمًا.',
    'help.m2t': 'لوحة المفاتيح', 'help.m2d': 'التحرك بـ WASD / الأسهم؛ و Shift للبطء؛ والمسافة للقنبلة؛ و E للانفجار؛ و P / Esc للإيقاف.',
    'help.m3t': 'الدرع والبقاء', 'help.m3d': 'النقطة المضيئة الوسطى هي نواة الإصابة. حصانة ~ثانيتين بعد الإصابة؛ وتجنّب الرصاص 13 ثانية يبدأ استعادة الدرع. بين القطاعات: إصلاح نقطتي جسم وملء الدرع وقنبلة +1.',
    'help.m4t': 'إمدادات الأسلحة', 'help.m4d': 'أزرق مشتت، أخضر خارق، بنفسجي موجّه، ذهبي انفجاري. الإمداد يرتد 10 ثوانٍ؛ ونفس النوع يرقّي حتى Lv.5، والنوع المختلف يبدّل مع حفظ المستوى.',
    'help.m5t': 'احصد نقاطًا عالية', 'help.m5d': 'القتل المتواصل يرفع التضاعف حتى ×5؛ والاحتكاك يزيد النقاط وشحن الانفجار. انفجار الرعد 8 ثوانٍ يمسح الرصاص عند التفعيل لكن الرصاص الجديد خطير.',
    'help.m6t': 'الإيقاف والمتابعة', 'help.m6d': 'الانتقال للخلفية يوقف اللعب تلقائيًا. حتى 3 متابعات تُعيد القطاع الحالي مع خصم 35% من النقاط والاحتفاظ بالترقيات. أعلى نتيجة للحملة تُحفظ على جهازك.',
    'help.ok': 'فهمت، جاهز للانطلاق',
    'help.close': 'إغلاق تعليمات اللعب',
    'noscript': 'هذه اللعبة تحتاج JavaScript. فعّلها ثم أعد التحميل.',
    'pause.default': 'المسار متجمد، وتوقيتات الإمدادات والقتال متوقفة معه.',
    'pause.away': 'غادرتَ ساحة المعركة للتو. كل التوقيتات متوقفة، تابع عندما تجهز.',
    'pause.blur': 'فقدت النافذة التركيز، توقفت المعركة تلقائيًا.',
    'pause.help': 'دليل اللعب مفتوح. أغلقه لمواصلة القتال.',
    'overlay.paused.kicker': 'الطيران متوقف مؤقتًا', 'overlay.paused.title': 'خذ نفسًا ثم انطلق مجددًا.',
    'overlay.resume': 'واصل القتال', 'overlay.quit': 'إنهاء الحملة والعودة للحظيرة',
    'overlay.upgrade.title': 'الطريق انفتح.', 'overlay.upgrade.desc': 'اختر تعزيزًا واحدًا لهذه الجولة. ومعه تموين العبور: جسم +2 وملء الدرع وقنبلة +1.',
    'overlay.training': 'تقرير التدريب', 'overlay.won': 'المهمة اكتملت', 'overlay.lost': 'الإشارة فُقدت',
    'overlay.practice.done': 'اكتمل التدريب.', 'overlay.victory': 'القبة السماوية عادت للفجر.',
    'overlay.retry': 'هذه ليست آخر طلعة لك.',
    'overlay.practice.desc': 'انتهى تدريب القطاع الواحد. عندما تجهز جرّب حملة القطاعات الخمسة الكاملة.',
    'overlay.victory.desc': 'تحررت القطاعات الخمسة. {continues}',
    'overlay.victory.clean': 'رحلة بلا متابعة من البداية للنهاية.', 'overlay.victory.used': 'تابعتَ القتال {n} مرة في هذه الجولة.',
    'overlay.defeat.desc': 'بلغتَ القطاع {i} · {name}. {extra}',
    'overlay.defeat.can': 'يمكن المتابعة لإعادة القطاع الحالي مع الاحتفاظ بالتعزيزات وخصم 35% من النقاط.', 'overlay.defeat.out': 'استنفدتَ فرص المتابعة، عُد للحظيرة وحاول مجددًا.',
    'overlay.score': 'نتيجة المعركة', 'overlay.time': 'زمن القتال الفعلي', 'overlay.kills': 'إسقاطات العدو', 'overlay.grazes': 'مرات الاحتكاك',
    'overlay.continue': 'واصل القتال', 'overlay.chances': '{n} فرص متبقية', 'overlay.back': 'عودة للحظيرة',
    'hud.practice': 'تدريب', 'hud.hull': 'الجسم', 'hud.shield': 'الدرع',
    'overdrive.active.aria': 'انفجار الرعد نشط، المتبقي {n} ثانية', 'overdrive.ready.aria': 'انفجار الرعد، الشحن {n}%، متاح عند 100%',
    'overdrive.active.label': 'الانفجار نشط · {n} ث', 'overdrive.charge.label': 'E · {n}%',
    'flight.hangar': 'الحظيرة 01', 'flight.training': 'تدريب', 'flight.sector': 'القطاع',
    'announce.warning': 'تحذير / سفينة العدو الرئيسية', 'announce.warning.sub': 'نيران متعددة المراحل · انتبه لتحذير الليزر',
    'announce.cleared': 'تم تدمير السفينة الرئيسية', 'announce.cleared.title': 'تم إخضاع القطاع', 'announce.cleared.sub': 'واصل التمشيط واجمع غنائم الزعيم',
    'announce.phase': 'الزعيم في المرحلة {n} · درع قصير ثم يبدّل النيران',
    'toast.autobomb': 'حماية الضربة القاتلة · استُهلكت قنبلة تلقائيًا', 'toast.overdrive': 'انفجار الرعد / نيران معززة 8 ثوانٍ · وما زال عليك تفادي الرصاص الجديد',
    'toast.charge': 'الاحتكاك والقتل والتقاط الأسلحة يمنح شحنًا',
    'canvas.unsupported': 'هذا المتصفح لا يدعم Canvas 2D',
    'lang.label': 'اللغة', 'lang.name': 'العربية',
  },
  zh: {
    'meta.description': '雷霆战机·天穹远征：三种战机、五大空域、漂移弹幕、多阶段Boss与四色武器。支持手机触控的十分钟原创街机战役。',
    'brand.home': '雷霆战机首页', 'brand.sub': '天穹远征 / FLIGHT COMMAND',
    'sound.on.aria': '关闭声音', 'sound.off.aria': '开启声音', 'sound.on.label': '声音', 'sound.off.label': '静音',
    'help.aria': '操作与玩法说明', 'help.button': '?',
    'left.eyebrow': 'THE LAST SQUADRON', 'left.title.cn': '雷霆战机 · 天穹远征',
    'left.intro': '穿过弹幕，击碎天穹。<br>最后一道防线，由你守住。',
    'route.title': '作战航线', 'route.sub': '5 SECTORS / 10 MIN+',
    'best.label': '本机战役最高分', 'best.note': '仅保存在此浏览器 · 演练不计入',
    'cabinet.live': 'LIVE FLIGHT', 'cabinet.hangar': 'HANGAR 01', 'cabinet.size': '480 : 800',
    'canvas.aria': '战场。在任意位置按住拖动战机，或用方向键及 WASD 移动；自动开火。空格使用炸弹，E 开启爆发，P 暂停。',
    'hud.score': 'SCORE', 'hud.sector': '01 / 05',
    'hull.aria': '机体耐久', 'shield.aria': '护盾',
    'pause.aria': '暂停战斗',
    'hangar.kicker': 'MISSION 001 — THE SKY IS CALLING', 'hangar.title': '选择你的战机', 'hangar.sub': '三种机体。一条通往天穹的航线。',
    'hangar.ready': 'READY TO DEPLOY',
    'ship.stats.hull': '机体', 'ship.stats.shield': '护盾', 'ship.stats.speed': '速度', 'ship.stats.bombs': '炸弹',
    'difficulty.label': '难度', 'difficulty.normal': '标准 · 致命一击自动炸弹', 'difficulty.arcade': '街机 · 更密弹幕，手动炸弹',
    'run.label': '航程', 'run.campaign': '完整战役 · 5 关 / 10 分钟起',
    'run.s0': '演练 · 01 晨曦海港', 'run.s1': '演练 · 02 翡翠峡谷', 'run.s2': '演练 · 03 冰川阵列', 'run.s3': '演练 · 04 熔核工厂', 'run.s4': '演练 · 05 天穹核心',
    'start': '开始远征', 'start.auto': 'AUTO FIRE ON', 'start.hint': '拖动移动 / WASD · 自动开火 · 手机可玩',
    'bomb': '震荡炸弹', 'bomb.unit': '枚', 'overdrive': '雷霆爆发', 'focus': '精密移动', 'focus.sub': 'SHIFT · 低速',
    'bottom.hangar': 'AUTO FIRE / DRAG TO FLY', 'bottom.reward': '奖励清场 · 拾取补给', 'bottom.boss': 'BOSS ENGAGED', 'bottom.normal': 'GRAZE +25 / MAX COMBO ×5',
    'loadout.title': '当前装载', 'loadout.sub': 'LOADOUT',
    'supply.title': '战场补给', 'supply.sub': '10s TO CLAIM',
    'supply.note': '击落敌机，追逐漂浮补给。<br>同款升级，异款切换，等级保留。',
    'manual.title': '飞行手册', 'manual.sub': 'FIELD NOTES',
    'manual.1t': '看清预警线', 'manual.1d': '虚线预警后，激光才有伤害。',
    'manual.2t': '擦弹获得充能', 'manual.2d': '贴近弹幕，蓄满 8 秒火力爆发。',
    'manual.3t': '留一枚炸弹', 'manual.3d': '清除弹幕，换取短暂无敌。',
    'project.note': 'ORIGINAL ARCADE EXPERIMENT', 'project.sub': '原创程序画面与合成声音<br>Created with GPT-6 Astra',
    'reduced.off': '减少装饰动态：关闭', 'reduced.on': '减少装饰动态：开启',
    'footer.1': 'A SMALL HITBOX. A VERY BIG SKY.', 'footer.2': 'FREE TO PLAY / NO LOGIN / NO ADS',
    'help.kicker': 'FLIGHT MANUAL', 'help.title': '十分钟，穿越五大空域。',
    'help.intro': '每关至少 120 秒，击破该关 Boss 才能前进；关间选择强化不计入战斗时间。火力不足时 Boss 战会延长。演练只挑战一关，不计入战役纪录。',
    'help.m1t': '手机 / 鼠标', 'help.m1d': '在战场任意位置按住拖动。战机自动开火，移动采用相对位移，不会瞬移到手指处。底部三个按钮可随时使用。',
    'help.m2t': '键盘', 'help.m2d': 'WASD / 方向键移动；Shift 低速；空格炸弹；E 爆发；P / Esc 暂停。',
    'help.m3t': '护盾与生存', 'help.m3d': '中央的小光点是受击核心。受伤后约 2 秒无敌；持续避弹 13 秒开始恢复护盾。关间修复 2 点机体、补满护盾并补 1 枚炸弹。',
    'help.m4t': '武器补给', 'help.m4d': '蓝色散射、绿色穿透、紫色追踪、金色爆裂。补给在场内反弹 10 秒；同款拾取升级到最高 Lv.5，异款切换时保留等级。',
    'help.m5t': '打出高分', 'help.m5d': '持续击杀叠加最高 ×5 连击分；擦弹增加分数与爆发充能。雷霆爆发持续 8 秒，启动时清弹，期间仍要躲避新弹幕。',
    'help.m6t': '暂停与续战', 'help.m6d': '切到后台会自动暂停。最多可续战 3 次，重开当前关并扣除 35% 分数，已有升级保留。战役最高分仅存本机。',
    'help.ok': '明白，准备出击', 'help.close': '关闭玩法说明', 'noscript': '此游戏需要 JavaScript。请开启后重新加载。',
    'pause.default': '航线已冻结，补给与战斗计时也一起暂停。',
    'pause.away': '你刚离开了战场。所有计时已暂停，准备好再继续。',
    'pause.blur': '窗口已失去焦点，战斗自动暂停。',
    'pause.help': '玩法说明已打开。关闭说明后，可继续战斗。',
    'overlay.paused.kicker': 'FLIGHT ON HOLD', 'overlay.paused.title': '呼吸一下，再出发。',
    'overlay.resume': '继续战斗', 'overlay.quit': '结束本次战役，返回机库',
    'overlay.upgrade.title': '航路已打开。', 'overlay.upgrade.desc': '选择一项本局强化。另附过关补给：机体 +2、护盾补满、炸弹 +1。',
    'overlay.training': 'TRAINING REPORT', 'overlay.won': 'MISSION ACCOMPLISHED', 'overlay.lost': 'SIGNAL LOST',
    'overlay.practice.done': '演练完成。', 'overlay.victory': '天穹，重归黎明。', 'overlay.retry': '这不是最后一次出击。',
    'overlay.practice.desc': '单关练习已结束。准备好后，尝试完整五关战役。',
    'overlay.victory.desc': '五大空域已全部解放。{continues}',
    'overlay.victory.clean': '一命航程，一路到底。', 'overlay.victory.used': '本次续战 {n} 次。',
    'overlay.defeat.desc': '抵达第 {i} 空域 · {name}。{extra}',
    'overlay.defeat.can': '可续战重开当前关，保留强化，分数扣除 35%。', 'overlay.defeat.out': '本局续战次数已用完，返回机库再挑战。',
    'overlay.score': '作战得分', 'overlay.time': '有效战斗时间', 'overlay.kills': '击落敌机', 'overlay.grazes': '擦弹次数',
    'overlay.continue': '继续作战', 'overlay.chances': '{n} 次机会', 'overlay.back': '返回机库',
    'hud.practice': '演练', 'hud.hull': '机体', 'hud.shield': '护盾',
    'overdrive.active.aria': '雷霆爆发中，剩余{n}秒', 'overdrive.ready.aria': '雷霆爆发，充能{n}%，100%可用',
    'overdrive.active.label': '爆发中 · {n}s', 'overdrive.charge.label': 'E · {n}%',
    'flight.hangar': 'HANGAR 01', 'flight.training': 'TRAINING', 'flight.sector': 'SECTOR',
    'announce.warning': 'WARNING / HOSTILE FLAGSHIP', 'announce.warning.sub': '多阶段火力 · 注意激光预警',
    'announce.cleared': 'FLAGSHIP DESTROYED', 'announce.cleared.title': '空域已压制', 'announce.cleared.sub': '继续清场，抢收首领补给',
    'announce.phase': 'Boss 第 {n} 阶段 · 短暂护盾后切换火力',
    'toast.autobomb': '致命一击保护 · 自动消耗 1 枚炸弹', 'toast.overdrive': '雷霆爆发 / 8 秒强化火力 · 仍需躲弹',
    'toast.charge': '擦弹、击杀和拾取武器可获得充能',
    'canvas.unsupported': '此浏览器不支持 Canvas 2D',
    'lang.label': '语言', 'lang.name': '中文',
  },
  en: {
    'meta.description': 'THUNDERFALL Sky Expedition: three fighters, five sectors, drifting barrages, multi-phase bosses and four color-coded weapons. A ten-minute original arcade campaign with touch support.',
    'brand.home': 'Thunderfall home', 'brand.sub': 'SKY EXPEDITION / FLIGHT COMMAND',
    'sound.on.aria': 'Mute sound', 'sound.off.aria': 'Enable sound', 'sound.on.label': 'Sound', 'sound.off.label': 'Muted',
    'help.aria': 'Controls and gameplay guide', 'help.button': '?',
    'left.eyebrow': 'THE LAST SQUADRON', 'left.title.cn': 'Thunderfall · Sky Expedition',
    'left.intro': 'Fly through the barrage and shatter the firmament.<br>You hold the last line of defense.',
    'route.title': 'Campaign route', 'route.sub': '5 SECTORS / 10 MIN+',
    'best.label': 'Best campaign score on this device', 'best.note': 'Stored in this browser only · practice excluded',
    'cabinet.live': 'LIVE FLIGHT', 'cabinet.hangar': 'HANGAR 01', 'cabinet.size': '480 : 800',
    'canvas.aria': 'Battlefield. Press and drag anywhere to move, or use arrows / WASD; auto-fire is on. Space for bomb, E for overdrive, P to pause.',
    'hud.score': 'SCORE', 'hud.sector': '01 / 05',
    'hull.aria': 'Hull integrity', 'shield.aria': 'Shield',
    'pause.aria': 'Pause battle',
    'hangar.kicker': 'MISSION 001 — THE SKY IS CALLING', 'hangar.title': 'Choose your fighter', 'hangar.sub': 'Three airframes. One route to the firmament.',
    'hangar.ready': 'READY TO DEPLOY',
    'ship.stats.hull': 'Hull', 'ship.stats.shield': 'Shield', 'ship.stats.speed': 'Speed', 'ship.stats.bombs': 'Bombs',
    'difficulty.label': 'Difficulty', 'difficulty.normal': 'Standard · auto-bomb on fatal hit', 'difficulty.arcade': 'Arcade · denser barrages, manual bombs',
    'run.label': 'Route', 'run.campaign': 'Full campaign · 5 sectors / 10+ min',
    'run.s0': 'Practice · 01 Dawn Harbor', 'run.s1': 'Practice · 02 Emerald Canyon', 'run.s2': 'Practice · 03 Frost Array', 'run.s3': 'Practice · 04 Molten Foundry', 'run.s4': 'Practice · 05 Sky Reactor',
    'start': 'Launch expedition', 'start.auto': 'AUTO FIRE ON', 'start.hint': 'Drag to move / WASD · auto-fire · mobile ready',
    'bomb': 'Shock bomb', 'bomb.unit': 'left', 'overdrive': 'Thunder overdrive', 'focus': 'Precision move', 'focus.sub': 'SHIFT · slow',
    'bottom.hangar': 'AUTO FIRE / DRAG TO FLY', 'bottom.reward': 'Salvage sweep · grab supplies', 'bottom.boss': 'BOSS ENGAGED', 'bottom.normal': 'GRAZE +25 / MAX COMBO ×5',
    'loadout.title': 'Current loadout', 'loadout.sub': 'LOADOUT',
    'supply.title': 'Field supplies', 'supply.sub': '10s TO CLAIM',
    'supply.note': 'Down enemies and chase drifting supplies.<br>Same type upgrades, different type swaps keeping levels.',
    'manual.title': 'Flight manual', 'manual.sub': 'FIELD NOTES',
    'manual.1t': 'Read the warning lines', 'manual.1d': 'Lasers only hurt after the dashed warning.',
    'manual.2t': 'Graze to charge', 'manual.2d': 'Skim bullets to charge an 8-second firepower burst.',
    'manual.3t': 'Keep one bomb', 'manual.3d': 'Clears bullets for brief invincibility.',
    'project.note': 'ORIGINAL ARCADE EXPERIMENT', 'project.sub': 'Procedural visuals and synthesized sound<br>Created with GPT-6 Astra',
    'reduced.off': 'Reduce decorative motion: off', 'reduced.on': 'Reduce decorative motion: on',
    'footer.1': 'A SMALL HITBOX. A VERY BIG SKY.', 'footer.2': 'FREE TO PLAY / NO LOGIN / NO ADS',
    'help.kicker': 'FLIGHT MANUAL', 'help.title': 'Ten minutes across five sectors.',
    'help.intro': 'Each sector needs at least 120 seconds; defeat its boss to advance. Between-sector upgrades do not count as battle time. Weak firepower prolongs boss fights. Practice covers one sector and never counts toward campaign records.',
    'help.m1t': 'Touch / mouse', 'help.m1d': 'Press and drag anywhere on the battlefield. Auto-fire is on with relative movement that never jumps to your finger. The three bottom buttons are always available.',
    'help.m2t': 'Keyboard', 'help.m2d': 'Move with WASD / arrows; Shift for slow; Space for bomb; E for overdrive; P / Esc to pause.',
    'help.m3t': 'Shields & survival', 'help.m3d': 'The small central dot is the hit core. Brief invincibility after a hit; dodging for 13s starts shield recovery. Between sectors: +2 hull, full shields, +1 bomb.',
    'help.m4t': 'Weapon supplies', 'help.m4d': 'Blue spread, green pierce, purple homing, gold blast. Supplies bounce for 10s; same type upgrades to Lv.5, swapping keeps levels.',
    'help.m5t': 'Score high', 'help.m5d': 'Chained kills stack up to a ×5 combo; grazing adds score and overdrive charge. Thunder overdrive lasts 8s, clears bullets on launch, but new bullets still hurt.',
    'help.m6t': 'Pause & continue', 'help.m6d': 'Backgrounding auto-pauses. Up to 3 continues replay the current sector with a 35% score cut, keeping upgrades. Best campaign score stays on your device.',
    'help.ok': 'Understood, ready to launch', 'help.close': 'Close gameplay guide', 'noscript': 'This game needs JavaScript. Please enable it and reload.',
    'pause.default': 'The route is frozen; supply and battle timers are paused too.',
    'pause.away': 'You just left the battlefield. All timers are paused; resume when ready.',
    'pause.blur': 'The window lost focus, so battle paused automatically.',
    'pause.help': 'The guide is open. Close it to resume the fight.',
    'overlay.paused.kicker': 'FLIGHT ON HOLD', 'overlay.paused.title': 'Catch your breath, then launch again.',
    'overlay.resume': 'Resume battle', 'overlay.quit': 'End campaign and return to hangar',
    'overlay.upgrade.title': 'The route is open.', 'overlay.upgrade.desc': 'Pick one upgrade for this run. Plus crossing supplies: +2 hull, full shields, +1 bomb.',
    'overlay.training': 'TRAINING REPORT', 'overlay.won': 'MISSION ACCOMPLISHED', 'overlay.lost': 'SIGNAL LOST',
    'overlay.practice.done': 'Practice complete.', 'overlay.victory': 'The firmament returns to dawn.',
    'overlay.retry': 'This is not your last sortie.',
    'overlay.practice.desc': 'Single-sector practice is over. When ready, try the full five-sector campaign.',
    'overlay.victory.desc': 'All five sectors liberated. {continues}',
    'overlay.victory.clean': 'A no-continue run, start to finish.', 'overlay.victory.used': '{n} continue(s) used this run.',
    'overlay.defeat.desc': 'Reached sector {i} · {name}. {extra}',
    'overlay.defeat.can': 'You can continue to replay this sector, keeping upgrades with a 35% score cut.', 'overlay.defeat.out': 'No continues left this run; return to the hangar and retry.',
    'overlay.score': 'Battle score', 'overlay.time': 'Active battle time', 'overlay.kills': 'Enemies downed', 'overlay.grazes': 'Grazes',
    'overlay.continue': 'Continue fighting', 'overlay.chances': '{n} chances left', 'overlay.back': 'Back to hangar',
    'hud.practice': 'Practice', 'hud.hull': 'Hull', 'hud.shield': 'Shield',
    'overdrive.active.aria': 'Thunder overdrive active, {n}s left', 'overdrive.ready.aria': 'Thunder overdrive, {n}% charged, ready at 100%',
    'overdrive.active.label': 'Burst · {n}s', 'overdrive.charge.label': 'E · {n}%',
    'flight.hangar': 'HANGAR 01', 'flight.training': 'TRAINING', 'flight.sector': 'SECTOR',
    'announce.warning': 'WARNING / HOSTILE FLAGSHIP', 'announce.warning.sub': 'Multi-phase firepower · watch laser warnings',
    'announce.cleared': 'FLAGSHIP DESTROYED', 'announce.cleared.title': 'Sector suppressed', 'announce.cleared.sub': 'Keep sweeping and collect boss supplies',
    'announce.phase': 'Boss phase {n} · brief shield, then new fire pattern',
    'toast.autobomb': 'Fatal-hit protection · 1 bomb auto-spent', 'toast.overdrive': 'Thunder overdrive / 8s boosted fire · still dodge new bullets',
    'toast.charge': 'Grazes, kills and weapon pickups grant charge',
    'canvas.unsupported': 'This browser does not support Canvas 2D',
    'lang.label': 'Language', 'lang.name': 'English',
  },
};

export function t(key, vars) {
  const table = UI[lang] || UI.ar;
  let s = table[key] ?? UI.zh[key] ?? UI.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

applyDocumentLang();
