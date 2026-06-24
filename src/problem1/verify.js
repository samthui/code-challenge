const assert = require("node:assert/strict");

const {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} = require("./solution");

assert.deepEqual(
  Object.keys(require("./solution")).sort(),
  ["sum_to_n_a", "sum_to_n_b", "sum_to_n_c"],
  "solution should export exactly three functions"
);

const implementations = {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};

const cases = [
  { n: 5, expected: 15 },
  { n: 1, expected: 1 },
  { n: 0, expected: 0 },
  { n: -1, expected: -1 },
  { n: -5, expected: -15 },
  { n: 100, expected: 5050 },
];

const largeCases = [
  { n: 1000000, expected: 500000500000 },
];

for (const [name, implementation] of Object.entries(implementations)) {
  assert.equal(typeof implementation, "function", `${name} should be a function`);

  for (const { n, expected } of cases) {
    assert.equal(implementation(n), expected, `${name}(${n}) should be ${expected}`);
  }
}

for (const [name, implementation] of Object.entries({
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
})) {
  for (const { n, expected } of largeCases) {
    assert.equal(implementation(n), expected, `${name}(${n}) should be ${expected}`);
  }
}

console.log("All sum_to_n implementations passed.");
