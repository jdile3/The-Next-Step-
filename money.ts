export const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatMoney = (val: number | string | undefined | null): string => {
  const num = Number(val) || 0;
  return money.format(num);
};

export const parseMoney = (raw: any): number => {
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Cleans messy bank, card, and Cash App descriptions by stripping processor prefixes,
 * store numbers (#1234), transaction IDs, dates, and trailing reference codes so
 * variations of the same vendor match cleanly.
 */
export const cleanMerchantName = (rawDesc: string): string => {
  if (!rawDesc) return "";
  let s = rawDesc.trim();

  // Strip common bank / card / Cash App / Square prefixes
  s = s.replace(
    /^(?:CASH\s*APP\s*\*?\s*|SQ\s*\*\s*|TST\s*\*\s*|PP\s*\*\s*|PAYPAL\s*\*\s*|POS\s+(?:DEBIT|PURCHASE|WITHDRAWAL)\s*[-*]?\s*|DEBIT\s+CARD\s+PURCHASE\s*[-*]?\s*|VISA\s+PURCHASE\s*[-*]?\s*|CHECKCARD\s+\d*\s*|ACH\s+(?:DEBIT|CREDIT|PMT)\s*[-*]?\s*|RECURRING\s+PAYMENT\s+(?:AUTHORIZED\s+ON\s+\d{2}\/\d{2}\s*)?|PURCHASE\s+AUTHORIZED\s+ON\s+\d{2}\/\d{2}\s*)/i,
    ""
  );

  // Strip dates like 11/07 or 11/07/2026 embedded in description
  s = s.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, " ");

  // Strip store numbers (#1234, STORE 1234) and long transaction/reference IDs
  s = s.replace(/#\s*[A-Za-z0-9-]+/g, " ");
  s = s.replace(/\bSTORE\s*\d+\b/gi, " ");
  s = s.replace(/\b(?:REF|ID|TXN|TRN|AUTH|CONF)[:#]?\s*[A-Za-z0-9]+/gi, " ");
  // Strip standalone 4+ digit numbers or mixed alphanumeric tracking codes (e.g. 849201, 1A2B3C4D)
  s = s.replace(/\b\d{4,}\b/g, " ");
  s = s.replace(/\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{6,}\b/g, " ");

  // Collapse punctuation and extra whitespace
  s = s.replace(/[*_\\/|]+/g, " ").replace(/\s+/g, " ").trim();
  // Remove trailing hyphens or single-letter state/status suffixes
  s = s.replace(/[-,\s]+$/, "").trim();

  // Unify common multi-spelling brands
  const upper = s.toUpperCase();
  if (/^WAL[-\s]?MART|^WM\s+SUPERCENTER/i.test(upper)) return "Walmart";
  if (/^AMZN\b|^AMAZON\.COM|^AMAZON\s+MKT/i.test(upper)) return "Amazon";
  if (/^MCDONALD'?S/i.test(upper)) return "McDonald's";
  if (/^DOORDASH/i.test(upper)) return "DoorDash";
  if (/^UBER\s*\*?\s*EATS/i.test(upper)) return "Uber Eats";
  if (/^UBER\b/i.test(upper)) return "Uber";
  if (/^LYFT\b/i.test(upper)) return "Lyft";
  if (/^STARBUCKS/i.test(upper)) return "Starbucks";
  if (/^DUNKIN/i.test(upper)) return "Dunkin'";
  if (/^CHICK[-\s]?FIL[-\s]?A/i.test(upper)) return "Chick-fil-A";
  if (/^TACO\s+BELL/i.test(upper)) return "Taco Bell";
  if (/^WENDY'?S/i.test(upper)) return "Wendy's";
  if (/^BURGER\s+KING/i.test(upper)) return "Burger King";
  if (/^DOLLAR\s+GENERAL|^DG\s+MARKET/i.test(upper)) return "Dollar General";
  if (/^FAMILY\s+DOLLAR/i.test(upper)) return "Family Dollar";
  if (/^DOLLAR\s+TREE/i.test(upper)) return "Dollar Tree";
  if (/^7[-\s]?ELEVEN/i.test(upper)) return "7-Eleven";
  if (/^CIRCLE\s+K/i.test(upper)) return "Circle K";
  if (/^SPEEDWAY/i.test(upper)) return "Speedway";
  if (/^NETFLIX/i.test(upper)) return "Netflix";
  if (/^SPOTIFY/i.test(upper)) return "Spotify";
  if (/^HULU/i.test(upper)) return "Hulu";
  if (/^APPLE\.COM\/BILL|^APL\*\s*ITUNES/i.test(upper)) return "Apple Subscriptions";

  return s || rawDesc.trim();
};

export const normalizeMerchant = (desc: string): string => {
  const cleaned = cleanMerchantName(desc);
  return cleaned
    .toLowerCase()
    .replace(/[#*_\-\\/()'.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const merchantRuleKey = (desc: string): string => {
  const norm = normalizeMerchant(desc);
  return norm.split(" ").slice(0, 2).join(" ");
};

const KEYWORD_CATEGORY_MAP: Array<{ pattern: RegExp; category: string }> = [
  {
    pattern: /\b(payroll|direct\s*dep|paycheck|salary|adp|gusto|paychex|tax\s*refund|irs\s*treas|dividend)\b/i,
    category: "Paycheck / Income",
  },
  {
    pattern: /\b(luckyland|chumba|pulsz|draftkings|fanduel|betmgm|caesars|casino|lottery|slots|bingo|sportsbook|bovada|wager|betting)\b/i,
    category: "Casino",
  },
  {
    pattern: /\b(walmart|kroger|aldi|target|costco|sam'?s\s*club|publix|safeway|albertsons|heb|h-e-b|meijer|trader\s*joe|whole\s*foods|food\s*lion|winco|piggly|hy-vee|wegmans|giant\s*eagle|stop\s*&\s*shop|grocery|supermarket|market)\b/i,
    category: "Groceries",
  },
  {
    pattern: /\b(mcdonald|wendy|taco\s*bell|burger\s*king|chick-fil-a|chickfila|kfc|popeyes|subway|domino|pizza\s*hut|little\s*caesars|papa\s*john|sonic\s*drive|arby|jack\s*in\s*the\s*box|dunkin|starbucks|chipotle|panda\s*express|five\s*guys|raising\s*cane|whataburger|panera|culver|zaxby|carl'?s\s*jr|hardee|wingstop|jersey\s*mike|jimmy\s*john)\b/i,
    category: "Fast Food",
  },
  {
    pattern: /\b(doordash|uber\s*eats|grubhub|postmates|chili'?s|applebee|olive\s*garden|ihop|denny'?s|waffle\s*house|texas\s*roadhouse|cracker\s*barrel|buffalo\s*wild|outback|red\s*lobster|cheesecake\s*factory|restaurant|bistro|diner|bar\s*&\s*grill|tavern|pizzeria|sushi|steakhouse)\b/i,
    category: "Dining Out",
  },
  {
    pattern: /\b(shell|chevron|exxon|mobil|bp\b|speedway|circle\s*k|7-eleven|wawa|quiktrip|casey'?s|sheetz|pilot|love'?s|flying\s*j|marathon|sunoco|citgo|valero|phillips\s*66|murphy\s*usa|kum\s*&\s*go|arco|texaco|racetrac|gas|fuel|petro|c-store)\b/i,
    category: "Gas / Convenience",
  },
  {
    pattern: /\b(netflix|spotify|hulu|disney\+|hbo|max\.com|apple\s*subscriptions|apple\.com\/bill|prime\s*video|youtube|xbox|playstation|steam\s*games|patreon|roku|siriusxm|audible|icloud|google\s*one|chatgpt|openai|peacock|paramount)\b/i,
    category: "Subscriptions",
  },
  {
    pattern: /\b(electric|power|energy|water\s*dept|sewer|trash|waste\s*mgmt|comcast|xfinity|spectrum|at&t|verizon|t-mobile|mint\s*mobile|cricket|boost\s*mobile|cox\s*comm|centurylink|frontier\s*comm|duke\s*energy|pge|pg&e|con\s*ed|ameren|entergy|fpl|utility|utilities)\b/i,
    category: "Utilities",
  },
  {
    pattern: /\b(progressive|geico|state\s*farm|allstate|liberty\s*mutual|farmers\s*ins|usaa|nationwide|auto-owners|travelers\s*ins|root\s*ins|lemonade\s*ins|insurance)\b/i,
    category: "Insurance",
  },
  {
    pattern: /\b(rent|apartment|property\s*mgmt|leasing|mortgage|hoa\s*dues|lot\s*rent)\b/i,
    category: "Rent",
  },
  {
    pattern: /\b(loan|auto\s*finance|car\s*payment|affirm|klarna|afterpay|navient|nelnet|sofi|lendingclub|credit\s*acceptance|capital\s*one\s*auto|ally\s*auto|santander|upstart|onenmain)\b/i,
    category: "Loan",
  },
  {
    pattern: /\b(cvs|walgreens|rite\s*aid|pharmacy|doctor|dental|dentist|clinic|hospital|labcorp|quest\s*diag|medical|urgent\s*care|optometry|vision|chiropract)\b/i,
    category: "Health & Medical",
  },
  {
    pattern: /\b(amazon|amzn|ebay|etsy|dollar\s*general|dollar\s*tree|family\s*dollar|home\s*depot|lowe'?s|menards|best\s*buy|kohl'?s|ross\s*stores|tj\s*maxx|marshalls|old\s*navy|nike|shein|temu|bath\s*&\s*body|ultras|sephora|petco|petsmart|autozone|o'?reilly|advance\s*auto)\b/i,
    category: "Shopping",
  },
  {
    pattern: /\b(amc\s*theat|regal\s*cinema|cinemark|movie|bowling|topgolf|golf|ticketmaster|stubhub|live\s*nation|concert|arcade|dave\s*&\s*buster)\b/i,
    category: "Entertainment",
  },
];

/**
 * Matches a transaction description against saved user rules (exact + fuzzy)
 * and falls back to smart built-in keyword categorization so a 1-year CSV
 * is categorized automatically without manual drudgery.
 */
export const autoCategorizeMerchant = (
  rawDesc: string,
  amount: number,
  userRules: Record<string, string> = {}
): string => {
  const cleaned = cleanMerchantName(rawDesc);
  const key = merchantRuleKey(cleaned);
  const norm = normalizeMerchant(cleaned);

  // 1. Exact rule key match
  if (key && userRules[key]) {
    return userRules[key];
  }

  // 2. Fuzzy match against existing user rules
  for (const [ruleVendor, ruleCat] of Object.entries(userRules)) {
    const cleanRule = normalizeMerchant(ruleVendor);
    if (cleanRule && (norm.includes(cleanRule) || cleanRule.includes(norm))) {
      return ruleCat;
    }
  }

  // 3. Built-in smart keyword dictionary
  const combinedText = `${cleaned} ${rawDesc}`;
  for (const item of KEYWORD_CATEGORY_MAP) {
    if (item.pattern.test(combinedText)) {
      return item.category;
    }
  }

  return amount > 0 ? "Other Income" : "Other Spending";
};

export const DEFAULT_CATEGORIES = [
  "Groceries",
  "Gas / Convenience",
  "Dining Out",
  "Fast Food",
  "Rent",
  "Utilities",
  "Insurance",
  "Subscriptions",
  "Loan",
  "Casino",
  "Entertainment",
  "Shopping",
  "Health & Medical",
  "Paycheck / Income",
  "Other Spending",
  "Other Income",
];

export const splitCsvLine = (line: string, delimiter: string = ","): string[] => {
  const row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      row.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  row.push(cur.trim());
  return row;
};

export const detectDelimiter = (sampleLines: string[]): string => {
  const delimiters = [",", "\t", ";", "|"];
  const counts: Record<string, number> = { ",": 0, "\t": 0, ";": 0, "|": 0 };

  for (const line of sampleLines.slice(0, 5)) {
    for (const d of delimiters) {
      counts[d] += (line.split(d).length - 1);
    }
  }

  return Object.entries(counts).reduce((best, [del, count]) =>
    count > best[1] ? [del, count] : best, [",", 0]
  )[0];
};

export const normalizeDate = (raw: string): string => {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/^"|"$/g, "");
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    return cleaned.slice(0, 10);
  }

  // MM/DD/YYYY or M/D/YYYY
  const slashParts = cleaned.split("/");
  if (slashParts.length === 3) {
    const m = slashParts[0].padStart(2, "0");
    const d = slashParts[1].padStart(2, "0");
    let y = slashParts[2].slice(0, 4);
    if (y.length === 2) y = "20" + y;
    return `${y}-${m}-${d}`;
  }

  // Standard parse
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
};
