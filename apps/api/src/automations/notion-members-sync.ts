import type { AutomationResult } from "../lib/automation-registry";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const NOTION_PRIVATE_DB_ID = process.env.NOTION_MEMBERS_DB_ID || "";
const NOTION_PUBLIC_DB_ID = process.env.NOTION_PUBLIC_MEMBERS_DB_ID || "";

const NOTION_HEADERS = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// --- Types ---

interface PrivateMember {
  notionId: string;
  name: string;
  typClenstvi: string;
  email: string;
  phone: string;
  zarazeni: string[];
  crsEmail: string;
}

interface SyncMemberResult {
  name: string;
  action: "created" | "updated" | "skipped" | "error";
  error?: string;
  typClenstvi: string;
  zarazeni: string[];
}

interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  total: number;
  members: SyncMemberResult[];
}

// Store last sync result in memory for the API
let lastSyncResult: SyncResult | null = null;

export function getLastSyncResult(): SyncResult | null {
  return lastSyncResult;
}

// --- Helpers for human-readable Notion errors ---

function parseNotionError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body);
    const code = parsed.code || "";
    const message = parsed.message || "";

    // Map common Notion error codes to Czech descriptions
    const errorMap: Record<string, string> = {
      unauthorized:
        "Neplatný API klíč. Zkontrolujte NOTION_API_KEY v .env souboru.",
      restricted_resource:
        "Integrace nemá přístup k databázi. Přidejte integraci přes Share → Connections v Notionu.",
      object_not_found:
        "Databáze nebyla nalezena. Zkontrolujte ID databáze v .env nebo ji nasdílejte s integrací.",
      validation_error:
        `Notion odmítl data: ${message}`,
      rate_limited:
        "Překročen limit požadavků na Notion API. Zkuste to za chvíli znovu.",
      internal_server_error:
        "Notion API má interní problém. Zkuste to za chvíli znovu.",
      service_unavailable:
        "Notion API je dočasně nedostupné. Zkuste to za chvíli znovu.",
      conflict_error:
        `Konflikt při zápisu: ${message}`,
    };

    return errorMap[code] || `Notion API chyba ${status} (${code}): ${message}`;
  } catch {
    return `Notion API vrátilo chybu ${status}: ${body.substring(0, 200)}`;
  }
}

// --- Main automation ---

export async function notionMembersSync(): Promise<AutomationResult> {
  // Check env vars with specific messages
  if (!NOTION_API_KEY) {
    return {
      success: false,
      message: "⚙️ Chybí NOTION_API_KEY — nastavte ho v apps/api/.env souboru.",
    };
  }
  if (!NOTION_PRIVATE_DB_ID) {
    return {
      success: false,
      message: "⚙️ Chybí NOTION_MEMBERS_DB_ID — nastavte ID řádné databáze členů v apps/api/.env souboru.",
    };
  }
  if (!NOTION_PUBLIC_DB_ID) {
    return {
      success: false,
      message: "⚙️ Chybí NOTION_PUBLIC_MEMBERS_DB_ID — nastavte ID veřejné databáze členů v apps/api/.env souboru.",
    };
  }

  // 1. Fetch private DB
  let privatePages: any[];
  try {
    privatePages = await fetchAllPages(NOTION_PRIVATE_DB_ID);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `📥 Nepodařilo se načíst řádnou databázi členů. ${msg}`,
    };
  }

  const privateMembers = privatePages
    .map(parsePrivateMember)
    .filter(
      (m) =>
        (m.typClenstvi === "Řádné členství" || m.typClenstvi === "Mimořádné") &&
        m.name.length > 0
    )
    .sort((a, b) => a.name.localeCompare(b.name, "cs"));

  if (privateMembers.length === 0) {
    return {
      success: false,
      message: `📭 Řádná databáze neobsahuje žádné aktivní členy (Řádné/Mimořádné členství bez konce ve spolku). Celkem stránek v DB: ${privatePages.length}.`,
    };
  }

  // 2. Fetch public DB
  let publicPages: any[];
  try {
    publicPages = await fetchAllPages(NOTION_PUBLIC_DB_ID);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `📥 Nepodařilo se načíst veřejnou databázi členů. ${msg}`,
    };
  }

  const publicByName = new Map<string, { id: string; props: any }>();
  for (const page of publicPages) {
    const titleArr = page.properties["Name"]?.title || [];
    const name = titleArr[0]?.plain_text || "";
    if (name) {
      publicByName.set(name.toLowerCase(), {
        id: page.id,
        props: page.properties,
      });
    }
  }

  // 3. Sync: upsert each private member into public DB
  const result: SyncResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    total: privateMembers.length,
    members: [],
  };

  for (const member of privateMembers) {
    const existing = publicByName.get(member.name.toLowerCase());

    try {
      if (existing) {
        const changes = buildPublicProperties(member);
        const needsUpdate = hasChanges(existing.props, member);

        if (needsUpdate) {
          await updatePage(existing.id, changes);
          result.updated++;
          result.members.push({
            name: member.name,
            action: "updated",
            typClenstvi: member.typClenstvi,
            zarazeni: member.zarazeni,
          });
        } else {
          result.skipped++;
          result.members.push({
            name: member.name,
            action: "skipped",
            typClenstvi: member.typClenstvi,
            zarazeni: member.zarazeni,
          });
        }
      } else {
        const properties = buildPublicProperties(member);
        await createPage(NOTION_PUBLIC_DB_ID, properties);
        result.created++;
        result.members.push({
          name: member.name,
          action: "created",
          typClenstvi: member.typClenstvi,
          zarazeni: member.zarazeni,
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      result.errors++;
      result.members.push({
        name: member.name,
        action: "error",
        error: msg,
        typClenstvi: member.typClenstvi,
        zarazeni: member.zarazeni,
      });
    }

    // Rate limit delay
    await sleep(350);
  }

  lastSyncResult = result;

  // Build summary message
  const parts: string[] = [];
  if (result.created > 0) parts.push(`${result.created} nových`);
  if (result.updated > 0) parts.push(`${result.updated} aktualizováno`);
  if (result.skipped > 0) parts.push(`${result.skipped} beze změn`);
  if (result.errors > 0) parts.push(`${result.errors} s chybou`);

  if (result.errors > 0 && result.errors === result.total) {
    return {
      success: false,
      message: `❌ Všech ${result.total} členů selhalo. Zkontrolujte přístup k veřejné databázi. Prvních chyba: ${result.members.find((m) => m.error)?.error || "neznámá"}`,
    };
  }

  if (result.errors > 0) {
    return {
      success: true,
      message: `⚠️ Synchronizováno ${result.total} členů (${parts.join(", ")}). Některé záznamy selhaly — viz detail níže.`,
    };
  }

  return {
    success: true,
    message: `✅ Synchronizováno ${result.total} členů: ${parts.join(", ")}.`,
  };
}

// --- Notion API helpers ---

async function fetchAllPages(databaseId: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined;

  while (true) {
    const body: Record<string, any> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    let res: Response;
    try {
      res = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        { method: "POST", headers: NOTION_HEADERS, body: JSON.stringify(body) }
      );
    } catch (error) {
      throw new Error(
        `Nepodařilo se připojit k Notion API. Zkontrolujte internetové připojení serveru.`
      );
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(parseNotionError(res.status, text));
    }

    const data = (await res.json()) as {
      results: any[];
      has_more: boolean;
      next_cursor?: string;
    };
    results.push(...data.results);

    if (data.has_more) {
      cursor = data.next_cursor;
    } else {
      break;
    }
  }

  return results;
}

async function createPage(
  databaseId: string,
  properties: Record<string, any>
) {
  let res: Response;
  try {
    res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });
  } catch (error) {
    throw new Error("Nepodařilo se připojit k Notion API při vytváření záznamu.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseNotionError(res.status, text));
  }
}

async function updatePage(pageId: string, properties: Record<string, any>) {
  let res: Response;
  try {
    res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: NOTION_HEADERS,
      body: JSON.stringify({ properties }),
    });
  } catch (error) {
    throw new Error("Nepodařilo se připojit k Notion API při aktualizaci záznamu.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseNotionError(res.status, text));
  }
}

// --- Data parsing & mapping ---

function parsePrivateMember(page: any): PrivateMember {
  const props = page.properties;

  const titleArr = props["Celé jméno"]?.title || [];
  const name = titleArr[0]?.plain_text || "";

  const typSel = props["Typ členství"]?.select;
  const typClenstvi = typSel?.name || "";

  const konecDate = props["Konec ve spolku"]?.date;
  const hasKonec = konecDate?.start ? true : false;

  const email = props["Email"]?.email || "";
  const phone = props["Telefon"]?.phone_number || "";

  const zarazeniOptions = props["Zařazení"]?.multi_select || [];
  const zarazeni: string[] = zarazeniOptions.map((o: any) => o.name);

  const gmailFormula = props["Gmail"]?.formula;
  const crsEmail = gmailFormula?.string || "";

  return {
    notionId: page.id,
    name,
    typClenstvi: hasKonec ? "" : typClenstvi,
    email,
    phone,
    zarazeni,
    crsEmail,
  };
}

function buildPublicProperties(member: PrivateMember): Record<string, any> {
  const props: Record<string, any> = {
    Name: {
      title: [{ text: { content: member.name } }],
    },
    Členství: {
      select: { name: member.typClenstvi },
    },
    "Spolkový mail": {
      rich_text: member.crsEmail
        ? [{ text: { content: member.crsEmail } }]
        : [],
    },
    "Personal Email": {
      rich_text: member.email
        ? [{ text: { content: member.email } }]
        : [],
    },
  };

  if (member.phone) {
    props["Phone"] = { phone_number: member.phone };
  }

  const zarazeniMapping: Record<string, string> = {
    Rada: "Rada",
    Avionics: "Avionics",
    "Public Relations": "PR",
    "Bureau of Safety": "BOS",
    "Czech Rocket Challenge": "CRC",
    Nezařazení: "Nezařazen",
  };

  const mappedZarazeni = member.zarazeni
    .map((z) => zarazeniMapping[z])
    .filter(Boolean)
    .map((name) => ({ name }));

  if (mappedZarazeni.length > 0) {
    props["Zařazení"] = { multi_select: mappedZarazeni };
  }

  return props;
}

function hasChanges(publicProps: any, member: PrivateMember): boolean {
  const pubName = publicProps["Name"]?.title?.[0]?.plain_text || "";
  if (pubName !== member.name) return true;

  const pubClenstvi = publicProps["Členství"]?.select?.name || "";
  if (pubClenstvi !== member.typClenstvi) return true;

  const pubCrsEmail =
    publicProps["Spolkový mail"]?.rich_text?.[0]?.plain_text || "";
  if (pubCrsEmail !== member.crsEmail) return true;

  const pubEmail =
    publicProps["Personal Email"]?.rich_text?.[0]?.plain_text || "";
  if (pubEmail !== member.email) return true;

  const pubPhone = publicProps["Phone"]?.phone_number || "";
  if (pubPhone !== member.phone) return true;

  return false;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
