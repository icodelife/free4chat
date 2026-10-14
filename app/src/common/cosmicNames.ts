/**
 * Small deterministic naming helpers shared by the browser and Worker.
 *
 * The public Room id keeps a readable cosmic prefix, but always ends in a
 * cryptographically generated suffix so the word lists are not a namespace.
 */

export type EntropySource = () => number

const ROOM_SUFFIX_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"
const ROOM_SUFFIX_LENGTH = 12

const COSMIC_ROOTS = [
  "andromeda",
  "aquila",
  "aurora",
  "carina",
  "cassiopeia",
  "centauri",
  "ceres",
  "corvus",
  "cygnus",
  "deneb",
  "draco",
  "elara",
  "eridanus",
  "europa",
  "helios",
  "hydra",
  "io",
  "lyra",
  "maia",
  "mensa",
  "meridian",
  "nebula",
  "neptune",
  "nova",
  "orion",
  "pegasus",
  "perseus",
  "phoenix",
  "polaris",
  "proxima",
  "rigel",
  "sagitta",
  "saturn",
  "sirius",
  "solstice",
  "spica",
  "taurus",
  "ursa",
  "vega",
  "vela",
  "venus",
  "virgo",
  "zenith",
  "altair",
  "antares",
  "aphelion",
  "arcturus",
  "asteria",
  "cosmos",
  "eclipse",
  "galatea",
  "gemini",
  "halley",
  "hyperion",
  "kepler",
  "lunaris",
  "metis",
  "miranda",
  "orbital",
  "pulsar",
  "quasar",
  "selenite",
  "stellar",
]

const REGION_WORDS = [
  "arc",
  "beacon",
  "cluster",
  "corridor",
  "drift",
  "expanse",
  "field",
  "frontier",
  "gate",
  "harbor",
  "haven",
  "horizon",
  "nexus",
  "orbit",
  "passage",
  "reach",
  "relay",
  "rift",
  "sector",
  "span",
  "verge",
  "wake",
  "apex",
  "belt",
  "bridge",
  "channel",
  "crescent",
  "domain",
  "edge",
  "flux",
  "grid",
  "halo",
]

// 64 x 64 combinations provide several thousand short, pronounceable
// defaults without making a generated participant name a persistent identity.
const PLANET_STARTS = [
  "vey",
  "aev",
  "ael",
  "aer",
  "ali",
  "ara",
  "ari",
  "aro",
  "ava",
  "avi",
  "bel",
  "cal",
  "cer",
  "cy",
  "dar",
  "del",
  "dov",
  "ela",
  "eli",
  "era",
  "eri",
  "eva",
  "gal",
  "hal",
  "ila",
  "ily",
  "io",
  "kai",
  "kel",
  "kora",
  "lae",
  "lea",
  "li",
  "luma",
  "ly",
  "mae",
  "mira",
  "nae",
  "nea",
  "neo",
  "nexa",
  "oli",
  "ori",
  "oria",
  "pel",
  "rae",
  "rei",
  "rhea",
  "sela",
  "sera",
  "sol",
  "tala",
  "tea",
  "tera",
  "va",
  "vel",
  "vela",
  "vira",
  "wren",
  "xena",
  "ya",
  "yara",
  "zel",
]

const PLANET_ENDINGS = [
  "ra",
  "ris",
  "ron",
  "ria",
  "len",
  "lex",
  "lia",
  "ion",
  "ara",
  "en",
  "is",
  "os",
  "ora",
  "iel",
  "une",
  "ael",
  "an",
  "aris",
  "eris",
  "essa",
  "eus",
  "eon",
  "ira",
  "ium",
  "on",
  "or",
  "rin",
  "sel",
  "sen",
  "tis",
  "tor",
  "yne",
  "zel",
  "ae",
  "el",
  "eth",
  "ia",
  "il",
  "in",
  "ith",
  "ula",
  "us",
  "yn",
  "yra",
  "eron",
  "orin",
  "avel",
  "eira",
  "ulis",
  "vera",
  "ylen",
  "zora",
  "aeris",
  "arin",
  "elis",
  "oris",
  "unee",
  "yven",
  "aura",
  "evar",
  "iren",
  "ovar",
  "ulen",
  "yora",
  "zeon",
]

function secureEntropy(): number {
  const bytes = new Uint32Array(1)
  globalThis.crypto.getRandomValues(bytes)
  return bytes[0] / 0x1_0000_0000
}

function pick<T>(values: readonly T[], entropy: EntropySource): T {
  const sample = entropy()
  if (!Number.isFinite(sample)) throw new Error("entropy must be finite")
  const normalized = Math.min(0.999999999, Math.max(0, sample))
  return values[Math.floor(normalized * values.length)]
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function generateRoomName(entropy: EntropySource = secureEntropy) {
  const root = pick(COSMIC_ROOTS, entropy)
  const region = pick(REGION_WORDS, entropy)
  let suffix = ""
  for (let i = 0; i < ROOM_SUFFIX_LENGTH; i += 1) {
    suffix += pick(ROOM_SUFFIX_ALPHABET.split(""), entropy)
  }
  return `${root}-${region}-${suffix}`
}

export function generateParticipantName(
  entropy: EntropySource = secureEntropy
) {
  return titleCase(
    `${pick(PLANET_STARTS, entropy)}${pick(PLANET_ENDINGS, entropy)}`
  )
}

// 中文房间名：两个中文词组合（主题 x 场所），避开已在使用的名称
const ROOM_TITLE_THEMES = [
  "星河",
  "萤火",
  "云间",
  "月光",
  "清风",
  "晨曦",
  "晚霞",
  "竹影",
  "松涛",
  "听雨",
  "山海",
  "花间",
]
const ROOM_TITLE_PLACES = [
  "小屋",
  "茶馆",
  "客厅",
  "驿站",
  "树屋",
  "庭院",
  "书房",
  "花园",
  "小筑",
  "亭台",
]

export function generateRoomTitle(
  rooms: { name: string }[] = [],
  random: () => number = Math.random
) {
  const used = new Set(rooms.map((room) => room.name))
  const all = ROOM_TITLE_THEMES.flatMap((theme) =>
    ROOM_TITLE_PLACES.map((place) => theme + place)
  )
  const available = all.filter((title) => !used.has(title))
  const choices = available.length ? available : all
  return choices[
    Math.min(choices.length - 1, Math.floor(random() * choices.length))
  ]
}

// 房间 ID：后台随机字符串，不展示给用户
const ROOM_ID_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"
const ROOM_ID_LENGTH = 16

export function generateRoomId(entropy: EntropySource = secureEntropy) {
  let id = ""
  for (let i = 0; i < ROOM_ID_LENGTH; i += 1) {
    id += pick(ROOM_ID_ALPHABET.split(""), entropy)
  }
  return id
}
