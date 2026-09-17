export interface ParsedTemplateItem {
  sku: string;
  quantity: number;
}

export interface ParseOrderTemplateResult {
  items: ParsedTemplateItem[];
  errors: string[];
}

interface BlockFields {
  sku?: string;
  qtyRaw?: string;
}

function parseBlockFields(lines: string[]): BlockFields {
  const fields: BlockFields = {};
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();
    if (!value) continue;

    if (key === 'variant' || key === 'sku') fields.sku = value;
    else if (key === 'qty' || key === 'quantity') fields.qtyRaw = value;
  }
  return fields;
}

// The item list is wrapped in a line of 4+ dashes (WhatsApp messages tend to
// use "-----"); individual items within it are separated by exactly "---".
// Anything outside the wrapper (greeting, totals, "My details" footer, etc.)
// is free-form and deliberately ignored.
const SECTION_DELIMITER = /^-{4,}$/;

export function parseOrderTemplate(text: string): ParseOrderTemplateResult {
  if (text.trim() === '') {
    return { items: [], errors: ['Paste an order message first.'] };
  }

  const lines = text.split('\n');
  const delimiterIndexes = lines
    .map((line, index) => (SECTION_DELIMITER.test(line.trim()) ? index : -1))
    .filter((index) => index !== -1);

  if (delimiterIndexes.length < 2) {
    return {
      items: [],
      errors: [
        'Invalid data: could not find the item list. Wrap it between two lines of dashes (-----), as in the pasted WhatsApp message.',
      ],
    };
  }

  const sectionLines = lines.slice(
    delimiterIndexes[0] + 1,
    delimiterIndexes[delimiterIndexes.length - 1],
  );

  const chunks: string[][] = [[]];
  for (const line of sectionLines) {
    if (line.trim() === '---') {
      chunks.push([]);
    } else {
      chunks[chunks.length - 1].push(line);
    }
  }

  const merged = new Map<string, number>();
  const errors: string[] = [];
  let blockNumber = 0;

  for (const chunkLines of chunks) {
    const { sku, qtyRaw } = parseBlockFields(chunkLines);
    if (sku === undefined && qtyRaw === undefined) continue; // filler chunk

    blockNumber += 1;

    if (sku === undefined) {
      errors.push(`Block ${blockNumber}: missing Variant/SKU.`);
      continue;
    }
    if (qtyRaw === undefined) {
      errors.push(`Block ${blockNumber}: missing Qty.`);
      continue;
    }

    const quantity = Number(qtyRaw);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push(`Block ${blockNumber}: Qty must be a positive whole number.`);
      continue;
    }

    merged.set(sku, (merged.get(sku) ?? 0) + quantity);
  }

  if (errors.length === 0 && merged.size === 0) {
    errors.push('No items found — check the format.');
  }

  return {
    items: Array.from(merged.entries()).map(([sku, quantity]) => ({
      sku,
      quantity,
    })),
    errors,
  };
}
