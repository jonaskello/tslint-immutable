/**
 * Adds the missing typescript type declarations used by this project.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/28467
 */

export function isAssignmentExpression(
  node: ts.Node,
  excludeCompoundAssignment: true
): node is ts.AssignmentExpression<ts.EqualsToken>;
export function isAssignmentExpression(
  node: ts.Node,
  excludeCompoundAssignment?: false
): node is ts.AssignmentExpression<ts.AssignmentOperatorToken>;
export function isAssignmentExpression(
  node: ts.Node,
  excludeCompoundAssignment?: boolean
): node is ts.AssignmentExpression<ts.AssignmentOperatorToken>;

export function isVariableLike(
  node: ts.Node
): node is ts.VariableLikeDeclaration;

export function isFunctionLikeDeclaration(
  node: ts.Node
): node is ts.FunctionLikeDeclaration;
