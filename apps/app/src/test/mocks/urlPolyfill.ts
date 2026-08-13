// no-op — jsdom already provides a real URL implementation, this
// package's real entry only matters on native, and it side-effect
// imports react-native, which we don't want loaded in tests.
export {};
