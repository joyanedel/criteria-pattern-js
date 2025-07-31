/**
 * Criteria class for holding filters and orders.
 * @class
 */
export class Criteria {
  /**
   * @param {Filter[]} filters - Array of Filter objects.
   * @param {Order[]} [orders=[]] - Array of Order objects.
   */
  constructor(filters, orders = []) {
    this._filters = filters.slice();
    this._orders = orders.slice();
  }

  /**
   * String representation of Criteria.
   * @returns {string}
   */
  toString() {
    return `<Criteria(filters=[${this._filters.map(f => f.toString()).join(', ')}], orders=[${this._orders.map(o => o.toString()).join(', ')}])>`;
  }

  /**
   * Combine two criteria with AND.
   * @param {Criteria} criteria
   * @returns {AndCriteria}
   */
  and(criteria) {
    return new AndCriteria(this, criteria);
  }

  /**
   * Combine two criteria with OR.
   * @param {Criteria} criteria
   * @returns {OrCriteria}
   */
  or(criteria) {
    return new OrCriteria(this, criteria);
  }

  /**
   * Negate the criteria.
   * @returns {NotCriteria}
   */
  not() {
    return new NotCriteria(this);
  }

  /**
   * Get filters.
   * @returns {Filter[]}
   */
  get filters() {
    return this._filters;
  }

  /**
   * Get orders.
   * @returns {Order[]}
   */
  get orders() {
    return this._orders;
  }

  /**
   * Check if criteria has filters.
   * @returns {boolean}
   */
  hasFilters() {
    return this._filters.length > 0;
  }

  /**
   * Check if criteria has orders.
   * @returns {boolean}
   */
  hasOrders() {
    return this._orders.length > 0;
  }
}

/**
 * AndCriteria class for AND logic.
 * @class
 * @extends Criteria
 */
export class AndCriteria extends Criteria {
  constructor(left, right) {
    super([], []);
    this.left = left;
    this.right = right;
  }

  toString() {
    return `<AndCriteria(left=${this.left.toString()}, right=${this.right.toString()})>`;
  }

  get filters() {
    return [...this.left.filters, ...this.right.filters];
  }

  get orders() {
    return [...this.left.orders, ...this.right.orders];
  }
}

/**
 * OrCriteria class for OR logic.
 * @class
 * @extends Criteria
 */
export class OrCriteria extends Criteria {
  constructor(left, right) {
    super([], []);
    this.left = left;
    this.right = right;
  }

  toString() {
    return `<OrCriteria(left=${this.left.toString()}, right=${this.right.toString()})>`;
  }

  get filters() {
    return [...this.left.filters, ...this.right.filters];
  }

  get orders() {
    return [...this.left.orders, ...this.right.orders];
  }
}

/**
 * NotCriteria class for NOT logic.
 * @class
 * @extends Criteria
 */
export class NotCriteria extends Criteria {
  constructor(criteria) {
    super([], []);
    this.criteria = criteria;
  }

  toString() {
    return `<NotCriteria(criteria=${this.criteria.toString()})>`;
  }

  get filters() {
    return [...this.criteria.filters];
  }

  get orders() {
    return [...this.criteria.orders];
  }
}
