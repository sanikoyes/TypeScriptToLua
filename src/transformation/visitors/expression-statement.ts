import * as ts from "typescript";
import * as lua from "../../LuaAST";
import { FunctionVisitor } from "../context";
import { transformBinaryExpressionStatement } from "./binary-expression";
import {
    isTableDeleteCall,
    isTableSetCall,
    transformTableDeleteExpression,
    transformTableSetExpression,
} from "./language-extensions/table";
import { transformLuaTableExpressionStatement } from "./lua-table";
import { transformUnaryExpressionStatement } from "./unary-expression";

export const transformExpressionStatement: FunctionVisitor<ts.ExpressionStatement> = (node, context) => {
    const luaTableResult = transformLuaTableExpressionStatement(context, node);
    if (luaTableResult) {
        return luaTableResult;
    }

    if (ts.isCallExpression(node.expression) && isTableDeleteCall(context, node.expression)) {
        return transformTableDeleteExpression(context, node.expression);
    }

    if (ts.isCallExpression(node.expression) && isTableSetCall(context, node.expression)) {
        return transformTableSetExpression(context, node.expression);
    }

    const unaryExpressionResult = transformUnaryExpressionStatement(context, node);
    if (unaryExpressionResult) {
        return unaryExpressionResult;
    }

    const binaryExpressionResult = transformBinaryExpressionStatement(context, node);
    if (binaryExpressionResult) {
        return binaryExpressionResult;
    }

    const expression = ts.isExpressionStatement(node) ? node.expression : node;
    const result = context.transformExpression(expression);
    return lua.isCallExpression(result) || lua.isMethodCallExpression(result)
        ? lua.createExpressionStatement(result)
        : // Assign expression statements to dummy to make sure they're legal Lua
          lua.createVariableDeclarationStatement(lua.createAnonymousIdentifier(), result);
};
