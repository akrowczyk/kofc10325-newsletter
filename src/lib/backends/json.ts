import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { seedData } from "../seed";
import type { Globals, Issue, StoreData } from "../types";
import type { StoreBackend } from "../storeCore";

// Local-development backend: persists to a JSON file. Used whenever no Postgres
// connection string is configured. The runtime filesystem on Vercel is
// read-only, so this backend is for local dev only — production uses Postgres.

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

async function readStore(): Promise<StoreData> {
  try {
    return JSON.parse(await fs.readFile(STORE_PATH, "utf8")) as StoreData;
  } catch {
    // No file yet: try to seed it, but don't crash if the filesystem is
    // read-only (e.g. deployed to Vercel before Postgres is attached). In that
    // case the app runs read-only on the in-memory seed until POSTGRES_URL is set.
    await writeStore(seedData).catch(() => {});
    return structuredClone(seedData);
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export const jsonBackend: StoreBackend = {
  async getGlobals() {
    return (await readStore()).globals;
  },
  async saveGlobals(globals: Globals) {
    const data = await readStore();
    data.globals = globals;
    await writeStore(data);
  },
  async listIssues() {
    const { issues } = await readStore();
    return [...issues].sort((a, b) => b.slug.localeCompare(a.slug));
  },
  async getIssue(slug: string) {
    const { issues } = await readStore();
    return issues.find((i) => i.slug === slug || i.id === slug) ?? null;
  },
  async putIssue(issue: Issue) {
    const data = await readStore();
    const idx = data.issues.findIndex((i) => i.id === issue.id);
    if (idx >= 0) data.issues[idx] = issue;
    else data.issues.push(issue);
    await writeStore(data);
  },
  async deleteIssue(slug: string) {
    const data = await readStore();
    data.issues = data.issues.filter((i) => i.slug !== slug && i.id !== slug);
    await writeStore(data);
  },
};
