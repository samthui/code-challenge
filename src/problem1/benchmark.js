const { performance } = require("node:perf_hooks");

const {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} = require("./solution");

const n = 1000;
const iterations = 10000;
const expected = 500500;

const implementations = [
  ["sum_to_n_a", sum_to_n_a],
  ["sum_to_n_b", sum_to_n_b],
  ["sum_to_n_c", sum_to_n_c],
];

const results = implementations.map(([name, implementation]) => {
  var result;
  var startedAt = performance.now();

  for (var i = 0; i < iterations; i++) {
    result = implementation(n);
  }

  var totalMs = performance.now() - startedAt;

  if (result !== expected) {
    throw new Error(`${name} returned ${result}, expected ${expected}`);
  }

  return {
    name,
    totalMs,
    averageMicroseconds: (totalMs * 1000) / iterations,
  };
});

results.sort((a, b) => a.averageMicroseconds - b.averageMicroseconds);

console.log(`Benchmark input: n = ${n}`);
console.log(`Iterations per function: ${iterations}`);
console.log("");
console.log("| Rank | Function | Total ms | Microseconds/call |");
console.log("|------|----------|----------|-------------------|");

results.forEach((result, index) => {
  console.log(
    `| ${index + 1} | \`${result.name}\` | ${result.totalMs.toFixed(3)} | ${result.averageMicroseconds.toFixed(3)} |`
  );
});
