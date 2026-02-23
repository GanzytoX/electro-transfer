export const BANCOS: Record<string, string> = {
  "002": "BANAMEX",
  "006": "BANCOMEXT",
  "009": "BANOBRAS",
  "012": "BBVA MEXICO",
  "014": "SANTANDER",
  "019": "BANJERCITO",
  "021": "HSBC",
  "030": "BAJIO",
  "032": "IXE",
  "036": "INBURSA",
  "042": "MIFEL",
  "044": "SCOTIABANK",
  "058": "BANREGIO",
  "059": "INVEX",
  "060": "BANSI",
  "062": "AFIRME",
  "072": "BANORTE",
  "106": "BANK OF AMERICA",
  "108": "MUFG",
  "110": "JP MORGAN",
  "112": "BMONEX",
  "113": "VE POR MAS",
  "124": "CITI MEXICO",
  "126": "CREDIT SUISSE",
  "127": "AZTECA",
  "128": "KAPITAL",
  "129": "BARCLAYS",
  "130": "AUTOFIN",
  "132": "MULTIVA BANCO",
  "133": "ACTINVER",
  "136": "INTERCAM BANCO",
  "137": "BANCOPPEL",
  "138": "UALA",
  "140": "CONSUBANCO",
  "141": "VOLKSWAGEN",
  "143": "CIBANCO",
  "145": "BASE",
  "147": "BANKAOOL",
  "148": "PAGATODO",
  "150": "INMOBILIARIO",
  "151": "DONDE",
  "152": "BANCREA",
  "154": "BANCO COVALTO",
  "155": "ICBC",
  "156": "SABADELL",
  "157": "SHINHAN",
  "158": "MIZUHO BANK",
  "159": "BANK OF CHINA",
  "160": "BANCO S3",
  "166": "BANSEFI - BANCO DEL BIENESTAR",
  "167": "HEY BANCO",
  "168": "HIPOTECARIA FED",
  "600": "MONEXCB",
  "601": "GBM",
  "602": "MASARI",
  "605": "VALUE",
  "606": "ESTRUCTURADORES",
  "607": "TIBER",
  "608": "VECTOR",
  "610": "B&B",
  "614": "ACCIVAL",
  "615": "MERRILL LYNCH",
  "616": "FINAMEX",
  "617": "VALMEX",
  "618": "UNICA",
  "619": "MAPFRE",
  "620": "PROFUTURO",
  "621": "CB ACTINVER",
  "623": "SKANDIA",
  "626": "DEUTSCHE",
  "627": "ZURICH",
  "628": "ZURICHVI",
  "629": "SU CASITA",
  "631": "CIBOLSA",
  "632": "BULLTICK",
  "633": "STERLING",
  "634": "FINCOMUN",
  "636": "HDI SEGUROS",
  "637": "ORDER",
  "638": "NU MEXICO",
  "640": "CB JPMORGAN",
  "642": "REFORMA",
  "646": "STP",
  "647": "TELECOMM",
  "648": "EVERCORE",
  "649": "SKANDIA",
  "651": "SEGMTY",
  "652": "CREDICAPITAL",
  "653": "KUSPIT",
  "655": "SOFIEXPRESS",
  "656": "UNAGRA",
  "659": "ASP INTEGRA OPC",
  "661": "KLAR",
  "670": "LIBERTAD",
  "677": "CAJA POP MEXICA",
  "680": "CRISTOBAL COLON",
  "683": "CAJA TELEFONIST",
  "684": "TRANSFER",
  "685": "FONDO (FIRA)",
  "688": "CREDICLUB",
  "699": "FONDEADORA",
  "703": "TESORED",
  "706": "ARCUS FI",
  "710": "NVIO",
  "715": "CASHI CUENTA",
  "721": "ALBO",
  "722": "MERCADO PAGO W",
  "723": "CUENCA",
  "725": "COOPDESARROLLO",
  "727": "TRANSFER DIRECT",
  "728": "SPIN BY OXXO",
  "729": "DEP Y PAG DIGO",
  "730": "SWAP",
  "732": "PEIBO",
  "734": "FINCO PAY",
  "738": "FINTOC",
  "901": "CLS",
  "902": "INDEVAL",
  "903": "CODI VALIDA",
  "999": "N/A",
};

/**
 * Busca la clave del banco dado un nombre o clave.
 * Si recibe una clave numérica válida (3 dígitos), la devuelve.
 * Si recibe un nombre, busca la mejor coincidencia.
 */
export const obtenerClaveBanco = (entrada: string): string | null => {
  if (!entrada) return null;

  const inputNormalizado = entrada.trim().toUpperCase();

  // 1. Si la entrada ya es una clave numérica conocida de 3 dígitos
  if (/^\d{3}$/.test(inputNormalizado) && BANCOS[inputNormalizado]) {
    return inputNormalizado;
  }

  // 2. Búsqueda inversa por nombre
  // Iteramos sobre las claves para buscar en los valores (nombres)
  for (const [clave, nombre] of Object.entries(BANCOS)) {
    // Verificamos si el nombre del banco contiene la entrada o viceversa
    // "BBVA" === "BBVA"
    // "BBVA BANCOMER" incluye "BBVA"
    if (nombre === inputNormalizado) return clave;
    if (
      nombre.includes(inputNormalizado) ||
      inputNormalizado.includes(nombre)
    ) {
      return clave;
    }
  }

  // Mapeos comunes manuales si el nombre oficial difiere mucho del coloquial
  const aliasComunes: Record<string, string> = {
    BANCOMER: "012",
    "BBVA BANCOMER": "012",
    CITIBANAMEX: "002",
    SCOTIA: "044",
    "HSBC MEXICO": "021",
    AZTECA: "127",
    BANAZTECA: "127",
    "BANCO AZTECA": "127",
    BANCOPPEL: "137",
    COPPEL: "137",
    NU: "638",
    "NU BANK": "638",
    NUBANK: "638",
  };

  if (aliasComunes[inputNormalizado]) {
    return aliasComunes[inputNormalizado];
  }

  return null;
};
