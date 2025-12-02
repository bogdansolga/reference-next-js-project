import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let sqlite: BetterSqlite3.Database | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getSqlite() {
	if (!sqlite) {
		sqlite = new BetterSqlite3(process.env.DATABASE_URL || "sqlite.db");
		// Enable WAL mode for better concurrent read performance
		sqlite.pragma("journal_mode = WAL");
		sqlite.pragma("synchronous = NORMAL");
		sqlite.pragma("foreign_keys = ON");
	}
	return sqlite;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop) {
		if (!dbInstance) {
			dbInstance = drizzle(getSqlite(), { schema });
		}
		return dbInstance[prop as keyof typeof dbInstance];
	},
});
export type Database = typeof db;
