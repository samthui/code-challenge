import assert from "node:assert/strict";
import { formatAmount, formatEditableAmount, formatUsd, normalizeEditableAmountInput } from "./formatters";

import { it as test } from "vitest";

test("formatters preserve crypto precision and USD readability", () => {
  assert.equal(formatAmount(0.004039850455012084, 8), "0.00403985");
  assert.equal(formatAmount(1645.9337373737374, 8), "1,645.93373737");
  assert.equal(formatUsd(1645.9337373737374), "$1,645.93");
  assert.equal(formatUsd(0.004039850455012084), "$0.00404");
});

test("editable amount input normalization strips display-only characters", () => {
  assert.equal(normalizeEditableAmountInput("$12,345.6700"), "12345.6700");
  assert.equal(normalizeEditableAmountInput("1.2.3"), "1.23");
  assert.equal(normalizeEditableAmountInput("abc 99,000.10 eth"), "99000.10");
});

test("editable amount formatter preserves raw decimal intent", () => {
  assert.equal(formatEditableAmount("12345.6700"), "12,345.6700");
  assert.equal(formatEditableAmount("12345."), "12,345.");
  assert.equal(formatEditableAmount(".5"), "0.5");
  assert.equal(formatEditableAmount(""), "");
});
