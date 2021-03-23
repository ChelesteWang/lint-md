import { Ast, Plugin } from '@lint-md/ast-plugin';
import * as Unist from 'unist';

const checkHasSpace = (node: Unist.Node, position: 'left' | 'right'): boolean => {
  // 左右两边是空格，那么必须存在文字节点
  if (node.type !== 'text') {
    return false;
  } else {
    const val = node.value as string;
    // 是 text 节点，并且以 ' ' 结尾 / 开头
    return position === 'left' ? val.endsWith(' ') : val.startsWith(' ');
  }
};

/**
 * code 代码块之间要加空格
 * space-round-inlinecode
 */
module.exports = class extends Plugin {
  static get type() {
    return 'space-round-inlinecode';
  }

  visitor() {
    return {
      inlineCode: (ast: Ast) => {
        // 当前节点
        const currentNode = ast.node;

        // 父亲节点
        const parentNodeChildren = ast.parent.node.children as any[];

        // 所有孩子，理应包含当前节点
        const nodeIndex = parentNodeChildren.indexOf(currentNode);
        if (nodeIndex >= 0) {
          const isNodePositionAccepted = (index: number) => index >= 0 && index <= parentNodeChildren.length - 1;

          const leftIndex = nodeIndex - 1;
          const rightIndex = nodeIndex + 1;

          // 1. 节点存在 -- 节点在合法的下标范围内
          // 2.checkHasSpace 不通过，则 lint 异常
          const isLeftLintError = isNodePositionAccepted(leftIndex) && !checkHasSpace(parentNodeChildren[leftIndex], 'left');
          const isRightLintError = isNodePositionAccepted(rightIndex) && !checkHasSpace(parentNodeChildren[rightIndex], 'right');

          if (isLeftLintError || isRightLintError) {
            this.cfg.throwError(({
              ast: ast,
              start: {
                line: ast.node.position.start.line,
                column: ast.node.position.start.column
              },
              end: {
                line: ast.node.position.end.line,
                column: ast.node.position.end.column
              },
              text: `${isLeftLintError ? ' ' : ''}\`${currentNode.value}\`${isRightLintError ? ' ' : ''}`
            }));
          }
        }
      }
    };
  }

  pre() {
  }

  post() {
  }
};