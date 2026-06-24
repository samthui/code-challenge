// Solution 1
var sum_to_n_a = function(n) {
  var limit = Math.abs(n);
  var total = (limit * (limit + 1)) / 2;

  return n < 0 ? -total : total;
};

// Solution 2
// Helper
var recursive_halving_sum = function(limit) {
  if (limit === 0) {
    return 0;
  }

  var half = Math.floor(limit / 2);
  var subtotal = recursive_halving_sum(half);
  var doubledHalfSum = 2 * subtotal + half * half;

  return limit % 2 === 0 ? doubledHalfSum : doubledHalfSum + 2 * half + 1;
};

var sum_to_n_b = function(n) {
  var total = recursive_halving_sum(Math.abs(n));

  return n < 0 ? -total : total;
};

// Solution 3
var sum_to_n_c = function(n) {
  var total = 0;
  var step = n < 0 ? -1 : 1;

  for (var current = step; step > 0 ? current <= n : current >= n; current += step) {
    total += current;
  }

  return total;
};

module.exports = {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};
