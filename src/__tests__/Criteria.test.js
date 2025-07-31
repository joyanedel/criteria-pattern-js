import { describe, it, expect } from 'vitest';
/**
 * Jest tests for Criteria and logical composition classes.
 */
import { Criteria, AndCriteria, OrCriteria, NotCriteria } from '../Criteria.js';
import { Filter } from '../Filter.js';
import { FilterOperator } from '../FilterOperator.js';
import { Order } from '../Order.js';
import { OrderDirection } from '../OrderDirection.js';

describe('Criteria', () => {
  it('should create criteria with filters and orders', () => {
    const filter = new Filter('name', FilterOperator.EQUAL, 'John');
    const order = new Order('name', OrderDirection.ASC);
    const criteria = new Criteria([filter], [order]);
    expect(criteria.filters).toEqual([filter]);
    expect(criteria.orders).toEqual([order]);
    expect(criteria.hasFilters()).toBe(true);
    expect(criteria.hasOrders()).toBe(true);
    expect(criteria.toString()).toContain('Criteria');
  });

  it('should combine criteria with AND', () => {
    const filter1 = new Filter('name', FilterOperator.EQUAL, 'John');
    const filter2 = new Filter('age', FilterOperator.GREATER, 18);
    const criteria1 = new Criteria([filter1]);
    const criteria2 = new Criteria([filter2]);
    const andCriteria = criteria1.and(criteria2);
    expect(andCriteria.filters).toEqual([filter1, filter2]);
    expect(andCriteria.toString()).toContain('AndCriteria');
  });

  it('should combine criteria with OR', () => {
    const filter1 = new Filter('name', FilterOperator.EQUAL, 'John');
    const filter2 = new Filter('age', FilterOperator.GREATER, 18);
    const criteria1 = new Criteria([filter1]);
    const criteria2 = new Criteria([filter2]);
    const orCriteria = criteria1.or(criteria2);
    expect(orCriteria.filters).toEqual([filter1, filter2]);
    expect(orCriteria.toString()).toContain('OrCriteria');
  });

  it('should negate criteria with NOT', () => {
    const filter = new Filter('name', FilterOperator.EQUAL, 'John');
    const criteria = new Criteria([filter]);
    const notCriteria = criteria.not();
    expect(notCriteria.filters).toEqual([filter]);
    expect(notCriteria.toString()).toContain('NotCriteria');
  });
});

describe('Exhaustive Criteria tests', () => {
  it('should handle empty filters and orders', () => {
    const criteria = new Criteria([], []);
    expect(criteria.filters).toEqual([]);
    expect(criteria.orders).toEqual([]);
    expect(criteria.hasFilters()).toBe(false);
    expect(criteria.hasOrders()).toBe(false);
    expect(criteria.toString()).toContain('filters=[]');
  });

  it('should chain AND and OR criteria', () => {
    const f1 = new Filter('name', FilterOperator.EQUAL, 'John');
    const f2 = new Filter('age', FilterOperator.GREATER, 18);
    const f3 = new Filter('active', FilterOperator.EQUAL, true);
    const c1 = new Criteria([f1]);
    const c2 = new Criteria([f2]);
    const c3 = new Criteria([f3]);
    const chained = c1.and(c2).or(c3);
    expect(chained.filters).toEqual([f1, f2, f3]);
    expect(chained.toString()).toContain('OrCriteria');
  });

  it('should preserve orders in logical compositions', () => {
    const o1 = new Order('name', OrderDirection.ASC);
    const o2 = new Order('age', OrderDirection.DESC);
    const c1 = new Criteria([], [o1]);
    const c2 = new Criteria([], [o2]);
    const andCriteria = c1.and(c2);
    expect(andCriteria.orders).toEqual([o1, o2]);
    const orCriteria = c1.or(c2);
    expect(orCriteria.orders).toEqual([o1, o2]);
  });

  it('should negate complex criteria', () => {
    const f1 = new Filter('name', FilterOperator.EQUAL, 'John');
    const f2 = new Filter('age', FilterOperator.GREATER, 18);
    const c1 = new Criteria([f1]);
    const c2 = new Criteria([f2]);
    const andCriteria = c1.and(c2);
    const notCriteria = andCriteria.not();
    expect(notCriteria.filters).toEqual([f1, f2]);
    expect(notCriteria.toString()).toContain('NotCriteria');
  });

  it('should support multiple NOTs', () => {
    const f1 = new Filter('name', FilterOperator.EQUAL, 'John');
    const c1 = new Criteria([f1]);
    const not1 = c1.not();
    const not2 = not1.not();
    expect(not2.filters).toEqual([f1]);
    expect(not2.toString()).toContain('NotCriteria');
  });

  it('should stringify all logical criteria correctly', () => {
    const f1 = new Filter('name', FilterOperator.EQUAL, 'John');
    const f2 = new Filter('age', FilterOperator.GREATER, 18);
    const c1 = new Criteria([f1]);
    const c2 = new Criteria([f2]);
    const andCriteria = new AndCriteria(c1, c2);
    const orCriteria = new OrCriteria(c1, c2);
    const notCriteria = new NotCriteria(c1);
    expect(andCriteria.toString()).toBe(`<AndCriteria(left=${c1.toString()}, right=${c2.toString()})>`);
    expect(orCriteria.toString()).toBe(`<OrCriteria(left=${c1.toString()}, right=${c2.toString()})>`);
    expect(notCriteria.toString()).toBe(`<NotCriteria(criteria=${c1.toString()})>`);
  });

  it('should handle filters with all operators', () => {
    Object.values(FilterOperator).forEach(op => {
      const filter = new Filter('field', op, 'value');
      expect(filter.toString()).toBe(`field ${op} value`);
    });
  });

  it('should handle orders with all directions', () => {
    Object.values(OrderDirection).forEach(dir => {
      const order = new Order('field', dir);
      expect(order.toString()).toBe(`field ${dir}`);
    });
  });
});
