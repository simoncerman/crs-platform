import { automationRegistry } from "../lib/automation-registry";
import { notionMembersSync } from "./notion-members-sync";

/** All automation definitions for seeding */
export const automationDefaults = [
  {
    key: "notion-members-sync",
    name: "🔄 Synchronizace členů z Notion",
    description: "Synchronizuje členy z řádné databáze do veřejné Notion databáze. Aktualizuje existující, přidává nové.",
  },
];

/** Register all automation handlers */
export function registerAutomations() {
  automationRegistry.register("notion-members-sync", notionMembersSync);
}
