function climbStairs(n: number): number {
    if (n === 2) {
        return 2
    }
    if (n === 1) {
        return 1
    }
    return climbStairs(n - 1) + climbStairs(n - 2)
}

// n = 2 → 2
// 1 + 1
// 2

// n = 3 → 3
// 1 + 1 + 1
// 1 + 2
// 2 + 1

const val1 = climbStairs(1) // 1
const val2 = climbStairs(2) // 2
const val3 = climbStairs(3) // 3
const val4 = climbStairs(4) // 5
const val5 = climbStairs(5) // 8

export { }