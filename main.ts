// Copies the coin launch record into the grader output directory.
// The entry itself is the coin on pump.fun; this program only hands
// the gate the mint address and the create transaction signature.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

function looksLikeAddress(value: unknown): value is string {
  return typeof value === "string" && value.length >= 32 && BASE58.test(value);
}

async function run(): Promise<void> {
  const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const source = join(botDir, "LAUNCH.json");

  let raw: string;
  try {
    raw = await readFile(source, "utf8");
  } catch (cause) {
    console.error(`cannot read ${source}: ${(cause as Error).message}`);
    process.exit(1);
  }

  let record: unknown;
  try {
    record = JSON.parse(raw);
  } catch (cause) {
    console.error(`LAUNCH.json is not valid JSON: ${(cause as Error).message}`);
    process.exit(1);
  }

  const { mint, create_signature } = record as {
    mint?: unknown;
    create_signature?: unknown;
  };
  if (!looksLikeAddress(mint) || !looksLikeAddress(create_signature)) {
    console.error("LAUNCH.json must name a base58 mint and a base58 create_signature");
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "LAUNCH.json"), raw, "utf8");
  console.log(`launch record copied for mint ${mint}`);
}

run().catch((cause: unknown) => {
  console.error(`unexpected failure: ${(cause as Error).message}`);
  process.exit(1);
});
