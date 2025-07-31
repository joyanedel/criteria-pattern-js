/**
 * Parser utilities for Criteria pattern (JS version).
 * Mirrors the Python implementation.
 */
import { Criteria, AndCriteria, OrCriteria, NotCriteria } from './Criteria.js';
import { Filter } from './Filter.js';
import { FilterOperator } from './FilterOperator.js';

/**
 * Parse rule data object into Criteria objects, preserving messages.
 * @param {Object} ruleData - Object with field keys and filter definitions.
 * @returns {Criteria}
 */
export function parseRules(ruleData) {
  const filters = [];
  for (const [field, filterDef] of Object.entries(ruleData)) {
    const operator = convertOperator(filterDef.operator);
    const value = filterDef.value;
    const filter = new Filter(field, operator, value);
    if ('message' in filterDef) filter.message = filterDef.message;
    filters.push(filter);
  }
  return new Criteria(filters);
}

/**
 * Validate if an object meets all the criteria filters.
 * @param {Object} obj - Object to validate
 * @param {Criteria} criteria - Criteria to apply
 * @returns {boolean}
 */
export function validateObject(obj, criteria) {
  if (!criteria.hasFilters()) return true;
  if (criteria instanceof AndCriteria)
    return validateObject(obj, criteria.left) && validateObject(obj, criteria.right);
  if (criteria instanceof OrCriteria)
    return validateObject(obj, criteria.left) || validateObject(obj, criteria.right);
  if (criteria instanceof NotCriteria)
    return !validateObject(obj, criteria.criteria);
  for (const filter of criteria.filters) {
    const fieldValue = obj[filter.field];
    if (!evaluateFilter(fieldValue, filter)) return false;
  }
  return true;
}

/**
 * Validate object and return error messages for failed filters.
 * @param {Object} obj - Object to validate
 * @param {Criteria} criteria - Criteria to apply
 * @returns {[boolean, string[]]} - [isValid, errorMessages]
 */
export function validateObjectWithMessages(obj, criteria) {
  if (!criteria.hasFilters()) return [true, []];
  let errors = [];
  let isValid = true;
  if (criteria instanceof AndCriteria) {
    const [valid1, errors1] = validateObjectWithMessages(obj, criteria.left);
    const [valid2, errors2] = validateObjectWithMessages(obj, criteria.right);
    return [valid1 && valid2, errors1.concat(errors2)];
  }
  if (criteria instanceof OrCriteria) {
    const [valid1, errors1] = validateObjectWithMessages(obj, criteria.left);
    const [valid2, errors2] = validateObjectWithMessages(obj, criteria.right);
    return [valid1 || valid2, valid1 ? errors1 : errors2];
  }
  if (criteria instanceof NotCriteria) {
    const [valid, msgs] = validateObjectWithMessages(obj, criteria.criteria);
    return [!valid, msgs];
  }
  for (const filter of criteria.filters) {
    const fieldValue = obj[filter.field];
    if (!evaluateFilter(fieldValue, filter)) {
      const message = filter.message || `Field '${filter.field}' failed ${filter.operator} check`;
      errors.push(message);
      isValid = false;
    }
  }
  return [isValid, errors];
}

/**
 * Evaluate a single filter against an object's value.
 * @param {*} objValue - Value from the object
 * @param {Filter} filter - Filter to apply
 * @returns {boolean}
 */
export function evaluateFilter(objValue, filter) {
  const operator = filter.operator;
  const filterValue = filter.value;
  // NULL checks
  if (operator === 'IS_NULL') return objValue == null;
  if (operator === 'IS_NOT_NULL') return objValue != null;
  if (objValue == null) return false;
  // Comparison
  if (operator === FilterOperator.EQUAL) return objValue === filterValue;
  if (operator === FilterOperator.NOT_EQUAL) return objValue !== filterValue;
  if (operator === FilterOperator.GREATER) return objValue > filterValue;
  if (operator === FilterOperator.GREATER_EQUAL) return objValue >= filterValue;
  if (operator === FilterOperator.LESS) return objValue < filterValue;
  if (operator === FilterOperator.LESS_EQUAL) return objValue <= filterValue;
  // String ops
  if (typeof objValue === 'string') {
    if (operator === FilterOperator.LIKE) {
      const pattern = new RegExp('^' + filterValue.replace(/%/g, '.*').replace(/_/g, '.') + '$');
      return pattern.test(objValue);
    }
    if (operator === 'NOT_LIKE') {
      const pattern = new RegExp('^' + filterValue.replace(/%/g, '.*').replace(/_/g, '.') + '$');
      return !pattern.test(objValue);
    }
    if (operator === 'CONTAINS') return objValue.includes(filterValue);
    if (operator === 'NOT_CONTAINS') return !objValue.includes(filterValue);
    if (operator === 'STARTS_WITH') return objValue.startsWith(filterValue);
    if (operator === 'NOT_STARTS_WITH') return !objValue.startsWith(filterValue);
    if (operator === 'ENDS_WITH') return objValue.endsWith(filterValue);
    if (operator === 'NOT_ENDS_WITH') return !objValue.endsWith(filterValue);
  }
  // Range ops
  if (operator === 'BETWEEN') {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) throw new Error('BETWEEN operator requires a 2-element array');
    return filterValue[0] <= objValue && objValue <= filterValue[1];
  }
  if (operator === 'NOT_BETWEEN') {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) throw new Error('NOT BETWEEN operator requires a 2-element array');
    return !(filterValue[0] <= objValue && objValue <= filterValue[1]);
  }
  throw new Error(`Unsupported filter operator: ${operator}`);
}

/**
 * Convert operator string from JSON to FilterOperator enum value.
 * @param {string} opStr - Operator string
 * @returns {string}
 */
export function convertOperator(opStr) {
  const map = {
    eq: FilterOperator.EQUAL,
    ne: FilterOperator.NOT_EQUAL,
    gt: FilterOperator.GREATER,
    ge: FilterOperator.GREATER_EQUAL,
    lt: FilterOperator.LESS,
    le: FilterOperator.LESS_EQUAL,
    contains: 'CONTAINS',
    not_contains: 'NOT_CONTAINS',
    starts_with: 'STARTS_WITH',
    not_starts_with: 'NOT_STARTS_WITH',
    ends_with: 'ENDS_WITH',
    not_ends_with: 'NOT_ENDS_WITH',
    like: FilterOperator.LIKE,
    not_like: 'NOT_LIKE',
    is_null: 'IS_NULL',
    is_not_null: 'IS_NOT_NULL',
    between: 'BETWEEN',
    not_between: 'NOT_BETWEEN',
  };
  if (!(opStr in map)) throw new Error(`Unknown operator: ${opStr}`);
  return map[opStr];
}
