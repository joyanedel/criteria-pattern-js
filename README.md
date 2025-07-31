# criteria-pattern-js

A JavaScript implementation of the [Python criteria-pattern library](https://github.com/joyanedel/criteria-pattern), which, itself, is a fork of the original [Criteria Pattern library](https://github.com/adriamontoto/criteria-pattern)

## Features
- Criteria, Filter, FilterOperator, Order, OrderDirection classes
- Logical composition: AndCriteria, OrCriteria, NotCriteria
- JSDoc documentation
- Usage examples
- Vitest tests
- Parser utilities for rule-based validation

## Getting Started

1. Clone this repository.
2. Install dependencies:
   ```zsh
   npm install
   ```
3. Run tests:
   ```zsh
   npm test
   ```

## Usage Example
```js
import { Criteria, Filter, FilterOperator } from './src/Criteria.js';
import { parseRules, validateObject, validateObjectWithMessages } from './src/parser.js';

// Basic Criteria usage
const criteria = new Criteria([
  new Filter('name', FilterOperator.EQUAL, 'John')
]);
console.log(criteria.toString());
// <Criteria(filters=[name EQUAL John], orders=[])>

// Parser usage
const ruleData = {
  name: { operator: 'eq', value: 'John', message: 'Name must be John' },
  age: { operator: 'gt', value: 18 }
};
const parsedCriteria = parseRules(ruleData);

const obj = { name: 'Jane', age: 10 };
console.log(validateObject(obj, parsedCriteria)); // false
console.log(validateObjectWithMessages(obj, parsedCriteria)); // [false, ["Name must be John", "Field 'age' failed GREATER check"]]
```

## License
MIT
