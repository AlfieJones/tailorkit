import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import {
  createPublicTeamId,
  initializePublicTeamId,
  publicTeamIdField,
} from "@tailorkit/auth/lib/public-team-id";

const migration = await readFile(
  new URL(
    "../../db/src/migrations/20260904000000_public_team_asset_ids/migration.sql",
    import.meta.url,
  ),
  "utf-8",
);
const preparation = await readFile(
  new URL(
    "../../db/src/migrations/20260904000000_public_team_asset_ids/prepare.sql",
    import.meta.url,
  ),
  "utf-8",
);

describe("permanent public team identity", () => {
  it("generates lowercase DNS-safe NanoIDs and controls the field in Better Auth", () => {
    const ids = Array.from({ length: 1000 }, () => createPublicTeamId());
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]{10}$/u);
    }
    expect(publicTeamIdField).toMatchObject({ required: true, input: false, unique: true });
    const created = initializePublicTeamId({ slug: "editable", publicId: "attacker00" });
    expect(created.data.publicId).not.toBe("attacker00");
    expect(created.data.slug).toBe("editable");
  });

  it("backfills existing teams, indexes IDs, retries collisions and prevents ID changes", async () => {
    const client = new PGlite();
    try {
      await client.exec(`CREATE TABLE organization (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text, slug text UNIQUE);
        INSERT INTO organization (name, slug) SELECT 'Team ' || n, 'team-' || n FROM generate_series(1, 100) n;`);
      const before = await client.query<{ id: string }>("SELECT id FROM organization ORDER BY id");
      for (const statement of preparation
        .split("--> statement-breakpoint")
        .map((value) => value.trim())
        .filter(Boolean)) {
        await client.exec(statement.replace(" CONCURRENTLY", ""));
      }
      expect(preparation).toContain("CREATE UNIQUE INDEX CONCURRENTLY");
      expect(migration).not.toContain("CREATE INDEX CONCURRENTLY");
      expect(migration).toContain("UNIQUE USING INDEX organization_public_id_key_idx");
      await client.exec(migration);
      const after = await client.query<{ id: string; public_id: string }>(
        "SELECT id, public_id FROM organization ORDER BY id",
      );
      expect(after.rows.map((row) => row.id)).toEqual(before.rows.map((row) => row.id));
      expect(new Set(after.rows.map((row) => row.public_id)).size).toBe(100);
      for (const row of after.rows) {
        expect(row.public_id).toMatch(/^[a-z0-9]{10}$/u);
      }
      const first = after.rows[0];
      if (!first) {
        throw new Error("Missing backfilled team");
      }
      await client.query(
        "UPDATE organization SET name = 'Renamed', slug = 'renamed' WHERE id = $1",
        [first.id],
      );
      const renamed = await client.query<{ public_id: string }>(
        "SELECT public_id FROM organization WHERE id = $1",
        [first.id],
      );
      expect(renamed.rows[0]?.public_id).toBe(first.public_id);
      const collision = await client.query<{ public_id: string }>(
        "INSERT INTO organization (name, slug, public_id) VALUES ('Collision', 'collision', $1) RETURNING public_id",
        [first.public_id],
      );
      expect(collision.rows[0]?.public_id).not.toBe(first.public_id);
      expect(collision.rows[0]?.public_id).toMatch(/^[a-z0-9]{10}$/u);
      await expect(
        client.query("UPDATE organization SET public_id = 'changed000' WHERE id = $1", [first.id]),
      ).rejects.toThrow("Public team IDs are permanent");
      for (const invalid of ["UPPERCASE0", "too-short", "team-abcde", "01234567890"]) {
        await expect(
          client.query("INSERT INTO organization (slug, public_id) VALUES ($1, $2)", [
            invalid,
            invalid,
          ]),
        ).rejects.toThrow();
      }
      const indexes = await client.query<{ indexdef: string }>(
        "SELECT indexdef FROM pg_indexes WHERE tablename = 'organization'",
      );
      expect(
        indexes.rows.some(
          ({ indexdef }) => indexdef.includes("UNIQUE") && indexdef.includes("(public_id)"),
        ),
      ).toBe(true);
      const generated = await client.query<{ public_id: string }>(
        "INSERT INTO organization (slug) VALUES ('old-client') RETURNING public_id",
      );
      expect(generated.rows[0]?.public_id).toMatch(/^[a-z0-9]{10}$/u);
    } finally {
      await client.close();
    }
  });
});
