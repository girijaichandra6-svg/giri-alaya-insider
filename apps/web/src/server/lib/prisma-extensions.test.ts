import { resolveBatchSize, batchProcess } from "./prisma-extensions";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function main() {
  // Test 1: resolveBatchSize defaults to 50
  {
    const original = process.env.TYPESENSE_BATCH_SIZE;
    delete process.env.TYPESENSE_BATCH_SIZE;
    assert(resolveBatchSize() === 50, "default batch size is 50");
    process.env.TYPESENSE_BATCH_SIZE = original;
  }

  // Test 2: resolveBatchSize reads from env var
  {
    const original = process.env.TYPESENSE_BATCH_SIZE;
    process.env.TYPESENSE_BATCH_SIZE = "10";
    assert(resolveBatchSize() === 10, "reads TYPESENSE_BATCH_SIZE env var");
    process.env.TYPESENSE_BATCH_SIZE = original;
  }

  // Test 3: resolveBatchSize override takes priority
  {
    const original = process.env.TYPESENSE_BATCH_SIZE;
    process.env.TYPESENSE_BATCH_SIZE = "99";
    assert(resolveBatchSize(10) === 10, "override takes priority over env var");
    process.env.TYPESENSE_BATCH_SIZE = original;
  }

  // Test 4: resolveBatchSize rejects non-integer env var
  {
    const original = process.env.TYPESENSE_BATCH_SIZE;
    process.env.TYPESENSE_BATCH_SIZE = "abc";
    assert(resolveBatchSize() === 50, "non-integer env var falls back to default");
    process.env.TYPESENSE_BATCH_SIZE = original;
  }

  // Test 5: batchProcess splits into chunks of 10
  {
    const callOrder: string[] = [];
    const fn = async (item: string) => { callOrder.push(item); };
    const items = "0123456789abcdef".split(""); // 16 items

    await batchProcess(items, fn, undefined, 10);

    assert(callOrder.length === 16, "all items were processed");
    const firstChunk = callOrder.slice(0, 10).sort().join("");
    const secondChunk = callOrder.slice(10).sort().join("");
    assert(firstChunk === "0123456789", "first chunk has items 0-9");
    assert(secondChunk === "abcdef", "second chunk has items a-f");
  }

  // Test 6: batchProcess reports errors via onError
  {
    const errors: Array<{ item: string; err: string }> = [];
    const fn = async (item: string) => {
      if (item === "b" || item === "d") {
        throw new Error(`error_${item}`);
      }
    };
    const items = ["a", "b", "c", "d", "e"];

    await batchProcess(items, fn, (item, err) => {
      errors.push({ item, err: String(err) });
    });

    assert(errors.length === 2, "two errors reported");
    const errorItems = errors.map(e => e.item).sort().join(",");
    assert(errorItems === "b,d", "errors on items b and d");
    assert(errors.every(e => e.err.includes("error_")), "all error messages contain error_");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
