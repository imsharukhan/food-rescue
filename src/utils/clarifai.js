// ─── Clarifai Food Screening (REST, browser-safe) ────────────────────────────
const PAT      = import.meta.env.VITE_CLARIFAI_PAT
const USER_ID  = 'clarifai'
const APP_ID   = 'main'
const MODEL_ID = 'food-item-recognition'

const API_BASE = import.meta.env.DEV
  ? '/clarifai-proxy'
  : 'https://api.clarifai.com'

// ── Comprehensive Indian + common food aliases ───────────────────────────────
// Maps typed words → what Clarifai's model actually labels the image as
const ALIASES = {
  // Indian breads
  porotta:  ['flatbread','bread','paratha','roti','naan','pancake','crepe','dough','pastry'],
  parotta:  ['flatbread','bread','paratha','roti','naan','pancake'],
  paratha:  ['flatbread','bread','roti','naan','dough'],
  roti:     ['flatbread','bread','tortilla','naan'],
  naan:     ['flatbread','bread','naan'],
  chapati:  ['flatbread','bread','tortilla'],
  puri:     ['bread','flatbread','pastry','dough','fried'],

  // Rice dishes
  biryani:  ['rice','pilaf','fried rice','basmati','dish','Indian food','grain'],
  pulao:    ['rice','pilaf','basmati','grain','dish'],
  pongal:   ['rice','porridge','grain','cereal','dish'],

  // South Indian
  idli:     ['dumpling','bread','cake','rice cake','steamed','snack'],
  dosa:     ['crepe','pancake','flatbread','crispy'],
  uttapam:  ['pancake','flatbread','crepe','bread'],
  appam:    ['pancake','flatbread','crepe','bread'],
  upma:     ['porridge','grain','cereal','semolina','snack','dish'],
  vada:     ['fritter','dumpling','bread','fried','snack','ring'],
  sambar:   ['soup','stew','curry','lentil','sauce','gravy','dal'],

  // Curries, gravies & masala dishes
  // These are the critical ones — Clarifai sees them as curry/gravy/sauce/dish
  paneer:   ['cheese','cottage cheese','tofu','curry','gravy','sauce','stew','Indian food','dish','food','vegetarian'],
  masala:   ['curry','sauce','gravy','spice','stew','Indian food','dish','food','seasoning'],
  butter:   ['sauce','cream','dairy','gravy','curry','dish','food'],
  makhani:  ['curry','sauce','gravy','butter','dish','Indian food','cream'],
  tikka:    ['curry','chicken','meat','grilled','roasted','Indian food','dish','sauce','baked'],
  korma:    ['curry','gravy','sauce','stew','dish','Indian food','cream'],
  vindaloo: ['curry','stew','gravy','spicy','dish','sauce'],
  kadai:    ['curry','gravy','sauce','dish','stew','Indian food'],
  karahi:   ['curry','gravy','sauce','dish','stew'],
  palak:    ['spinach','vegetable','curry','gravy','greens','sauce','dish','puree'],
  saag:     ['spinach','vegetable','curry','gravy','greens','sauce','dish'],
  aloo:     ['potato','vegetable','curry','dish','stew','fried'],
  gobi:     ['cauliflower','vegetable','curry','dish','floret'],
  mutter:   ['pea','vegetable','curry','legume','dish','green'],
  rajma:    ['kidney bean','bean','legume','curry','stew','dish','red'],
  chana:    ['chickpea','legume','bean','curry','stew','dish'],
  chole:    ['chickpea','legume','bean','curry','stew','dish'],
  kofta:    ['meatball','dumpling','curry','gravy','dish','Indian food'],
  curry:    ['curry','stew','sauce','gravy','Indian food','dish','food','spicy'],
  gravy:    ['curry','sauce','stew','soup','gravy','dish','liquid'],
  sabzi:    ['vegetable','curry','dish','food','cooked'],
  tadka:    ['lentil','dal','soup','curry','stew','seasoned'],

  // Lentils & legumes
  dal:      ['lentil','soup','stew','curry','legume','gravy','dish','pulse'],

  // Proteins
  chicken:  ['chicken','poultry','meat','bird','fowl','curry','grilled','roasted'],
  mutton:   ['meat','lamb','mutton','curry','stew','red meat'],
  fish:     ['fish','seafood','curry','dish','fillet'],
  egg:      ['egg','omelette','fried egg','boiled','scrambled'],
  prawn:    ['shrimp','prawn','seafood','crustacean','curry'],
  shrimp:   ['shrimp','prawn','seafood','crustacean'],

  // Staples
  rice:     ['rice','grain','cereal','cooked','white'],
  soup:     ['soup','broth','stew','curry','liquid'],
  salad:    ['salad','vegetable','greens','fresh','raw'],

  // Western
  pizza:    ['pizza','bread','pastry','flatbread','cheese'],
  burger:   ['burger','sandwich','bread','bun','beef'],
  pasta:    ['pasta','noodle','spaghetti','italian'],

  // Desserts
  halwa:    ['dessert','sweet','pudding','confection','semolina'],
  kheer:    ['dessert','pudding','dairy','rice pudding','sweet','milk'],
  payasam:  ['dessert','pudding','dairy','sweet','milk'],
  ladoo:    ['dessert','sweet','ball','confection','round'],
  gulab:    ['dessert','sweet','syrup','fried'],
  barfi:    ['dessert','sweet','dairy','confection','milk'],
  rasgulla: ['dessert','sweet','ball','syrup','dairy'],
}

// ── Category signal words ────────────────────────────────────────────────────
// If typed food contains these, add broader Clarifai-style labels to the search
const CURRY_SIGNALS  = ['masala','curry','gravy','butter','makhani','korma','tikka',
                        'vindaloo','kadai','karahi','jalfrezi','rogan','saag','palak','kofta','do pyaza']
const RICE_SIGNALS   = ['biryani','pulao','fried rice','pilaf']
const BREAD_SIGNALS  = ['paratha','roti','naan','chapati','puri','parotta','porotta','dosa','uttapam','appam']
const LENTIL_SIGNALS = ['dal','sambar','rasam','soup']

// ── Veg / Non-veg classifiers ────────────────────────────────────────────────
const VEG_KEYS = [
  'salad','vegetable','broccoli','carrot','spinach','lettuce','tomato',
  'cucumber','potato','rice','bread','pasta','fruit','lentil','dal',
  'paneer','tofu','bean','legume','mushroom','corn','onion','garlic',
  'flatbread','paratha','roti','naan','idli','dosa','crepe','pancake',
  'cheese','grain','cereal','soup','stew','curry','cauliflower','pea',
]
const NON_VEG_KEYS = [
  'chicken','meat','beef','pork','fish','seafood','prawn','shrimp',
  'mutton','lamb','egg','turkey','bacon','sausage','kebab',
  'meatball','tuna','salmon','crab','lobster','poultry','drumstick',
]

// ── Dominant food families — high-conf top label from these + mismatched name = reject ──
const DOMINANT_FAMILIES = [
  { labels: ['pizza'],                   keys: ['pizza'] },
  { labels: ['hamburger','burger'],      keys: ['burger','sandwich','wrap'] },
  { labels: ['sushi','sashimi','maki'],  keys: ['sushi','sashimi','japanese','maki'] },
  { labels: ['ice cream','gelato','sorbet'], keys: ['ice cream','gelato','dessert','frozen'] },
  { labels: ['cake','cupcake'],          keys: ['cake','cupcake','pastry','muffin'] },
]

function isDominantMismatch(topLabel, topConf, typedName) {
  if (topConf < 0.72) return false
  const typed = typedName.toLowerCase()
  for (const family of DOMINANT_FAMILIES) {
    const labelHit = family.labels.some(l => topLabel.includes(l))
    const nameHit  = family.keys.some(k => typed.includes(k))
    if (labelHit && !nameHit) return true
  }
  return false
}

// ── Expand typed food name into all possible Clarifai label terms ─────────────
function expandFoodName(name) {
  const lower = name.toLowerCase().trim()
  const words = lower.split(/\s+/)
  const expanded = new Set(words)

  // Category-level expansion — Indian dishes Clarifai labels generically
  if (CURRY_SIGNALS.some(s  => lower.includes(s)))
    ['curry','gravy','sauce','stew','Indian food','dish','food','masala','spicy'].forEach(t => expanded.add(t))
  if (RICE_SIGNALS.some(s   => lower.includes(s)))
    ['rice','pilaf','basmati','grain','fried rice','dish'].forEach(t => expanded.add(t))
  if (BREAD_SIGNALS.some(s  => lower.includes(s)))
    ['flatbread','bread','crepe','pancake','dough'].forEach(t => expanded.add(t))
  if (LENTIL_SIGNALS.some(s => lower.includes(s)))
    ['lentil','soup','stew','curry','legume','dal'].forEach(t => expanded.add(t))

  // Word-level alias expansion
  words.forEach(w => {
    if (ALIASES[w]) ALIASES[w].forEach(a => expanded.add(a))
    Object.keys(ALIASES).forEach(key => {
      if (w.includes(key) || key.includes(w)) {
        expanded.add(key)
        ALIASES[key].forEach(a => expanded.add(a))
      }
    })
  })
  return [...expanded]
}

export async function analyseFood({ dataUrl, foodName }) {
  if (!PAT) throw new Error('VITE_CLARIFAI_PAT is missing from your .env file.')

  const base64 = dataUrl.split(',')[1]

  const res = await fetch(
    `${API_BASE}/v2/users/${USER_ID}/apps/${APP_ID}/models/${MODEL_ID}/outputs`,
    {
      method : 'POST',
      headers: { Authorization: `Key ${PAT}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify({ inputs: [{ data: { image: { base64 } } }] }),
    }
  )

  if (!res.ok) {
    const err  = await res.json().catch(() => ({}))
    const desc = err?.outputs?.[0]?.status?.description
               || err?.status?.description
               || `Clarifai error ${res.status}`
    if (res.status === 403)
      throw new Error('API key has insufficient scopes. Create a new Clarifai PAT with All Scopes selected.')
    throw new Error(desc)
  }

  const json     = await res.json()
  const concepts = json.outputs?.[0]?.data?.concepts ?? []
  if (!concepts.length)
    throw new Error('No food detected in this photo. Try a clearer, well-lit image.')

  const topConf   = concepts[0]?.value ?? 0
  const topLabel  = concepts[0]?.name?.toLowerCase() ?? ''
  const topLabels = concepts.slice(0, 20).map(c => c.name.toLowerCase())
  const matchLabels = concepts.slice(0, 8).map(c => c.name.toLowerCase()) // wider window

  // ── Step 1: Dominant mismatch (e.g. pizza photo + "paneer" typed) ──────────
  if (isDominantMismatch(topLabel, topConf, foodName)) {
    return {
      is_safe: false, food_type: 'mixed', condition: 'bad',
      notes: 'Food name does not match the uploaded image. Please upload a photo of the actual food being donated.',
      labels: topLabels, confidence: topConf,
    }
  }

  // ── Step 2: Name match against top 8 labels ────────────────────────────────
  const expandedTerms = expandFoodName(foodName)
  const matchCount = expandedTerms.filter(term =>
    matchLabels.some(lbl => lbl.includes(term) || term.includes(lbl))
  ).length
  const strongMatch = matchCount >= 2
  const anyMatch    = matchCount >= 1

  const is_safe = anyMatch && (topConf >= 0.50 || strongMatch)

  // ── Food type ─────────────────────────────────────────────────────────────
  const hasNonVeg    = topLabels.some(l   => NON_VEG_KEYS.some(k => l.includes(k)))
  const hasVeg       = topLabels.some(l   => VEG_KEYS.some(k => l.includes(k)))
  const nameIsNonVeg = NON_VEG_KEYS.some(k => foodName.toLowerCase().includes(k))
  const nameIsVeg    = VEG_KEYS.some(k    => foodName.toLowerCase().includes(k))

  const food_type =
    (hasNonVeg || nameIsNonVeg) && (hasVeg || nameIsVeg) ? 'mixed'    :
    (hasNonVeg || nameIsNonVeg)                           ? 'non-veg' :
    (hasVeg    || nameIsVeg)                              ? 'veg'      : 'mixed'

  // ── Condition ─────────────────────────────────────────────────────────────
  const condition = topConf >= 0.55 ? 'good' : 'bad'

  // ── Clean human-friendly notes — NO raw detected labels ever ─────────────
  const pct   = Math.round(topConf * 100)
  const notes = !anyMatch
    ? 'Food name does not match the uploaded image. Please upload a photo of the actual food being donated.'
    : is_safe
    ? `Food image successfully verified — ${pct}% confidence it is safe for donation.`
    : 'Image quality is too low for verification. Please use a brighter, closer photo.'

  return { is_safe, food_type, condition, notes, labels: topLabels, confidence: topConf }
}

// ── Compress image → base64 (max 800px, 80% JPEG) ────────────────────────────
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload  = e => {
      const img   = new Image()
      img.onerror = () => reject(new Error('Image failed to load. Try a different photo.'))
      img.onload  = () => {
        const MAX = 800
        let { width, height } = img
        if (width  > MAX) { height = Math.round(height * MAX / width);  width  = MAX }
        if (height > MAX) { width  = Math.round(width  * MAX / height); height = MAX }
        const cv = document.createElement('canvas')
        cv.width = width; cv.height = height
        cv.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve({ dataUrl: cv.toDataURL('image/jpeg', 0.80) })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}