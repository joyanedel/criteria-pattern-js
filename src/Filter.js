/**
 * Represents a filter condition.
 * @class
 */
export class Filter {
  /**
   * @param {string} field - The field to filter.
   * @param {string} operator - The operator to use (see FilterOperator).
   * @param {*} value - The value to compare.
   */
  constructor(field, operator, value) {
    this.field = field;
    this.operator = operator;
    this.value = value;
  }

  /**
   * String representation of the filter.
   * @returns {string}
   */
  toString() {
    return `${this.field} ${this.operator} ${this.value}`;
  }
}
