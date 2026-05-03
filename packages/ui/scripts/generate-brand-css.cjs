const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const packageRoot = resolve(__dirname, "..");
const tokensPath = resolve(packageRoot, "src/branding/tokens.ts");
const cssPath = resolve(packageRoot, "src/styles/brand.css");
const checkOnly = process.argv.includes("--check");

const colorGroups = [
  {
    label: "Canvas",
    entries: [
      ["background", "--background"],
      ["foreground", "--foreground"],
      ["muted", "--muted"],
      ["border", "--border"],
    ],
  },
  {
    label: "Surfaces and Supporting Fills",
    entries: [
      ["bgPanel", "--bg-panel"],
      ["bgHostPanel", "--bg-host-panel"],
      ["secondary", "--secondary"],
      ["secondaryHover", "--secondary-hover"],
    ],
  },
  {
    label: "Brand and Primary Actions",
    entries: [
      ["primary", "--primary"],
      ["primaryHover", "--primary-hover"],
      ["fsDiamond", "--fs-diamond"],
    ],
  },
  {
    label: "State and Signal Colors",
    entries: [
      ["success", "--success"],
      ["successHover", "--success-hover"],
      ["danger", "--danger"],
      ["dangerHover", "--danger-hover"],
      ["fsOrange", "--fs-orange"],
      ["fsGold", "--fs-gold"],
    ],
  },
  {
    label: "Atmospheric Effects",
    entries: [
      ["errorGlow", "--error-glow"],
      ["scanlineColor", "--scanline-color"],
    ],
  },
];

const typographyEntries = [
  ["displayFamily", "--font-family-display", "--font-display-base"],
  ["uiFamily", "--font-family-ui", "--font-ui-base"],
  ["bodyFamily", "--font-family-body", "--font-body-base"],
];

function flattenMappedTokenKeys(groups) {
  return groups.flatMap((group) => group.entries.map(([key]) => key));
}

function assertExactTokenCoverage(tokens, mappedKeys, exportName) {
  const tokenKeys = Object.keys(tokens).sort();
  const seenKeys = new Set();
  const duplicateKeys = mappedKeys.filter((key) => {
    if (seenKeys.has(key)) {
      return true;
    }

    seenKeys.add(key);
    return false;
  });
  const missingKeys = mappedKeys.filter((key) => !tokens[key]).sort();
  const unmappedKeys = tokenKeys.filter((key) => !seenKeys.has(key));

  if (duplicateKeys.length > 0) {
    throw new Error(`Duplicate ${exportName} CSS mappings: ${duplicateKeys.join(", ")}`);
  }

  if (missingKeys.length > 0) {
    throw new Error(`Missing ${exportName} tokens for CSS mappings: ${missingKeys.join(", ")}`);
  }

  if (unmappedKeys.length > 0) {
    throw new Error(
      `Unmapped ${exportName} tokens: ${unmappedKeys.join(
        ", "
      )}. Add each token to generate-brand-css.cjs before generating brand.css.`
    );
  }
}

function extractTokenBlock(source, exportName) {
  const blockPattern = new RegExp(`export const ${exportName} = \\{([\\s\\S]*?)\\} as const;`);
  const match = source.match(blockPattern);

  if (!match) {
    throw new Error(`Missing export block: ${exportName}`);
  }

  return match[1];
}

function parseStringTokens(block, exportName) {
  const tokens = {};

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    const tokenLine = trimmed.replace(/\s+\/\/.*$/, "");

    if (!tokenLine || tokenLine.startsWith("//")) {
      continue;
    }

    const match = tokenLine.match(/^([a-zA-Z][a-zA-Z0-9]*): "([^"]+)",?$/);

    if (!match) {
      throw new Error(`Unsupported token line in ${exportName}: ${tokenLine}`);
    }

    tokens[match[1]] = match[2];
  }

  return tokens;
}

function requireToken(tokens, key, exportName) {
  const value = tokens[key];

  if (!value) {
    throw new Error(`Missing ${exportName}.${key}`);
  }

  return value;
}

function renderTypographyValue(familyName, nextFontVariable) {
  return `var(${nextFontVariable}, "${familyName}"), "${familyName}"`;
}

function renderBrandCss(colors, typography) {
  const lines = [
    "/* This file is generated from packages/ui/src/branding/tokens.ts. */",
    "/* Run `pnpm --filter @firstspawn/ui generate:styles` to update it. */",
    "",
    ":root {",
  ];

  for (const group of colorGroups) {
    lines.push(`  /* ${group.label} */`);

    for (const [key, cssVariable] of group.entries) {
      lines.push(`  ${cssVariable}: ${requireToken(colors, key, "firstspawnBrandColors")};`);
    }

    lines.push("");
  }

  lines.push("  /* Typography */");

  for (const [key, cssVariable, nextFontVariable] of typographyEntries) {
    const value = requireToken(typography, key, "firstspawnBrandTypography");
    lines.push(`  ${cssVariable}: ${renderTypographyValue(value, nextFontVariable)};`);
  }

  lines.push("}", "");

  return lines.join("\n");
}

const source = readFileSync(tokensPath, "utf8");
const colors = parseStringTokens(
  extractTokenBlock(source, "firstspawnBrandColors"),
  "firstspawnBrandColors"
);
const typography = parseStringTokens(
  extractTokenBlock(source, "firstspawnBrandTypography"),
  "firstspawnBrandTypography"
);

assertExactTokenCoverage(colors, flattenMappedTokenKeys(colorGroups), "firstspawnBrandColors");
assertExactTokenCoverage(
  typography,
  typographyEntries.map(([key]) => key),
  "firstspawnBrandTypography"
);

const generatedCss = renderBrandCss(colors, typography);
const currentCss = readFileSync(cssPath, "utf8");

if (checkOnly) {
  if (currentCss !== generatedCss) {
    throw new Error(
      "Generated brand.css is out of date. Run `pnpm --filter @firstspawn/ui generate:styles`."
    );
  }

  process.exit(0);
}

writeFileSync(cssPath, generatedCss);
