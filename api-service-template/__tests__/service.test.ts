import { addNumbers } from '../src/service';

describe('addNumbers', () => {
  test('正の整数の加算', () => {
    expect(addNumbers(2, 3)).toBe(5);
  });

  test('負の数の加算', () => {
    expect(addNumbers(-4, -6)).toBe(-10);
  });

  test('0の加算', () => {
    expect(addNumbers(0, 0)).toBe(0);
  });

  test('小数の加算', () => {
    expect(addNumbers(1.5, 2.3)).toBeCloseTo(3.8);
  });
});
