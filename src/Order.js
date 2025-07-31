/**
 * Represents an order condition.
 * @class
 */
export class Order {
  /**
   * @param {string} field - The field to order by.
   * @param {string} direction - The direction (see OrderDirection).
   */
  constructor(field, direction) {
    this.field = field;
    this.direction = direction;
  }

  /**
   * String representation of the order.
   * @returns {string}
   */
  toString() {
    return `${this.field} ${this.direction}`;
  }
}
