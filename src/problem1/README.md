# Problem 1

The solution is in `solution.js` and includes three implementations:

- `sum_to_n_a`: closed-form triangular number calculation
- `sum_to_n_b`: recursive recurrence over halves
- `sum_to_n_c`: direction-aware iterative loop

## Performance Comparison

Here, `n` means `Math.abs(n)` for negative inputs.

Best performance is listed first. The sample measured time below comes from running `node src/problem1/benchmark.js` locally with `n = 1000` and 10,000 iterations per function.

| Rank | Function | Approach | Time Complexity | Space Complexity | Sample Measured Time |
|------|----------|----------|-----------------|------------------|----------------------|
| 1 | `sum_to_n_a` | triangular formula | `O(1)` | `O(1)` | 0.070 microseconds/call |
| 2 | `sum_to_n_b` | recursive halving | `O(log n)` | `O(log n)` | 0.350 microseconds/call |
| 3 | `sum_to_n_c` | iterative loop | `O(n)` | `O(1)` | 1.271 microseconds/call |

Run the benchmark from the repository root: ⚠️ to run this command, check the [Prerequisites](#prerequisites-to-run-node-commands) section.

```bash
node src/problem1/benchmark.js
```

## Verify

Run the verifier from the repository root: ⚠️ to run this command, check the [Prerequisites](#prerequisites-to-run-node-commands) section.

```bash
node src/problem1/verify.js
```

## Prerequisites to run Node commands

- Node.js installed and available as `node`
- This repository cloned or downloaded locally
- No `npm install` required; the verifier and benchmark only use Node.js built-ins
