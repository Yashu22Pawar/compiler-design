#include <iostream>

// Template metaprogram to compute Fibonacci numbers at compile time
template<int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N - 1>::value + Fibonacci<N - 2>::value;
};

// Base cases
template<>
struct Fibonacci<0> {
    static constexpr int value = 0;
};

template<>
struct Fibonacci<1> {
    static constexpr int value = 1;
};

int main() {
    constexpr int n = 10;
    std::cout << "Fibonacci(" << n << ") = " << Fibonacci<n>::value << std::endl;
    return 0;
}
