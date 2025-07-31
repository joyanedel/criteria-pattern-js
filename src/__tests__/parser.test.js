import { describe, it, expect } from 'vitest';
import { parseRules, validateObject, validateObjectWithMessages, convertOperator } from '../parser.js';
import { FilterOperator } from '../FilterOperator.js';

const baseRule = {
  name: { operator: 'eq', value: 'John', message: 'Name must be John' },
  age: { operator: 'gt', value: 18 },
};

describe('parseRules', () => {
  it('parses rule data into Criteria with messages', () => {
    const criteria = parseRules(baseRule);
    expect(criteria.filters.length).toBe(2);
    expect(criteria.filters[0].field).toBe('name');
    expect(criteria.filters[0].operator).toBe(FilterOperator.EQUAL);
    expect(criteria.filters[0].message).toBe('Name must be John');
    expect(criteria.filters[1].field).toBe('age');
    expect(criteria.filters[1].operator).toBe(FilterOperator.GREATER);
    expect(criteria.filters[1].message).toBeUndefined();
  });
});

describe('validateObject', () => {
  it('validates object against criteria (all pass)', () => {
    const criteria = parseRules(baseRule);
    expect(validateObject({ name: 'John', age: 20 }, criteria)).toBe(true);
  });
  it('validates object against criteria (fail one)', () => {
    const criteria = parseRules(baseRule);
    expect(validateObject({ name: 'John', age: 10 }, criteria)).toBe(false);
    expect(validateObject({ name: 'Jane', age: 20 }, criteria)).toBe(false);
  });
  it('handles empty filters (always valid)', () => {
    const criteria = parseRules({});
    expect(validateObject({}, criteria)).toBe(true);
  });
});

describe('validateObjectWithMessages', () => {
  it('returns error messages for failed filters', () => {
    const criteria = parseRules(baseRule);
    const [isValid, errors] = validateObjectWithMessages({ name: 'Jane', age: 10 }, criteria);
    expect(isValid).toBe(false);
    expect(errors.length).toBe(2);
    expect(errors[0]).toBe('Name must be John');
    expect(errors[1]).toContain('age');
  });
  it('returns empty error list if valid', () => {
    const criteria = parseRules(baseRule);
    const [isValid, errors] = validateObjectWithMessages({ name: 'John', age: 20 }, criteria);
    expect(isValid).toBe(true);
    expect(errors.length).toBe(0);
  });
});

describe('Edge cases for parser', () => {
  it('handles IS_NULL and IS_NOT_NULL', () => {
    const rule = {
      foo: { operator: 'is_null', value: null },
      bar: { operator: 'is_not_null', value: null },
    };
    const criteria = parseRules(rule);
    expect(validateObject({ foo: null, bar: 1 }, criteria)).toBe(true);
    expect(validateObject({ foo: 1, bar: null }, criteria)).toBe(false);
  });
  it('handles LIKE and NOT_LIKE', () => {
    const rule = {
      foo: { operator: 'like', value: 'J%n' },
      bar: { operator: 'not_like', value: 'J%n' },
    };
    const criteria = parseRules(rule);
    expect(validateObject({ foo: 'John', bar: 'Jane' }, criteria)).toBe(true);
    expect(validateObject({ foo: 'Jane', bar: 'John' }, criteria)).toBe(false);
  });
  it('handles CONTAINS, NOT_CONTAINS, STARTS_WITH, ENDS_WITH', () => {
    const rule = {
      foo: { operator: 'contains', value: 'oh' },
      bar: { operator: 'not_contains', value: 'oh' },
      baz: { operator: 'starts_with', value: 'Jo' },
      qux: { operator: 'ends_with', value: 'hn' },
    };
    const criteria = parseRules(rule);
    expect(validateObject({ foo: 'John', bar: 'Jane', baz: 'John', qux: 'John' }, criteria)).toBe(true);
    expect(validateObject({ foo: 'Jane', bar: 'John', baz: 'Jane', qux: 'Jane' }, criteria)).toBe(false);
  });
  it('handles BETWEEN and NOT_BETWEEN', () => {
    const rule = {
      foo: { operator: 'between', value: [1, 5] },
      bar: { operator: 'not_between', value: [1, 5] },
    };
    const criteria = parseRules(rule);
    expect(validateObject({ foo: 3, bar: 10 }, criteria)).toBe(true);
    expect(validateObject({ foo: 0, bar: 3 }, criteria)).toBe(false);
  });
  it('throws on unknown operator', () => {
    expect(() => convertOperator('unknown')).toThrow();
  });
  it('throws on invalid BETWEEN value', () => {
    const rule = { foo: { operator: 'between', value: [1] } };
    const criteria = parseRules(rule);
    expect(() => validateObject({ foo: 1 }, criteria)).toThrow();
  });
});

export {};
