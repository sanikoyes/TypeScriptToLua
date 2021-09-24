import * as ts from "typescript";
import * as lua from "../../LuaAST";
import { assume } from "../../utils";
import { TransformationContext } from "../context";
import { createNaN } from "../utils/lua-ast";
import { importLuaLibFeature, LuaLibFeature } from "../utils/lualib";
import { getIdentifierSymbolId } from "../utils/symbols";
import {
    hasStandardLibrarySignature,
    isArrayType,
    isFunctionType,
    isNumberType,
    isStandardLibraryType,
    isStringType,
} from "../utils/typescript";
import { PropertyCallExpression } from "../visitors/call";
import { checkForLuaLibType } from "../visitors/class/new";
import { transformArrayConstructorCall, transformArrayProperty, transformArrayPrototypeCall } from "./array";
import { transformConsoleCall } from "./console";
import { transformFunctionPrototypeCall, transformFunctionProperty } from "./function";
import { transformGlobalCall } from "./global";
import { transformMathCall, transformMathProperty } from "./math";
import { transformNumberConstructorCall, transformNumberPrototypeCall } from "./number";
import { transformObjectConstructorCall, transformObjectPrototypeCall } from "./object";
import { transformPromiseConstructorCall } from "./promise";
import { transformStringConstructorCall, transformStringProperty, transformStringPrototypeCall } from "./string";
import { transformSymbolConstructorCall } from "./symbol";

export function transformBuiltinPropertyAccessExpression(
    context: TransformationContext,
    node: ts.PropertyAccessExpression
): lua.Expression | undefined {
    const ownerType = context.checker.getTypeAtLocation(node.expression);

    if (isStringType(context, ownerType)) {
        return transformStringProperty(context, node);
    }

    if (isArrayType(context, ownerType)) {
        return transformArrayProperty(context, node);
    }

    if (isFunctionType(context, ownerType)) {
        return transformFunctionProperty(context, node);
    }

    if (ts.isIdentifier(node.expression) && isStandardLibraryType(context, ownerType, undefined)) {
        switch (node.expression.text) {
            case "Math":
                return transformMathProperty(context, node);
            case "Symbol":
                importLuaLibFeature(context, LuaLibFeature.Symbol);
        }
    }
}

export function transformBuiltinCallExpression(
    context: TransformationContext,
    node: ts.CallExpression
): lua.Expression | undefined {
    const expressionType = context.checker.getTypeAtLocation(node.expression);
    if (ts.isIdentifier(node.expression) && isStandardLibraryType(context, expressionType, undefined)) {
        // TODO:
        checkForLuaLibType(context, expressionType);
        const result = transformGlobalCall(context, node);
        if (result) {
            return result;
        }
    }

    if (!ts.isPropertyAccessExpression(node.expression)) {
        return;
    }

    assume<PropertyCallExpression>(node);

    // If the function being called is of type owner.func, get the type of owner
    const ownerType = context.checker.getTypeAtLocation(node.expression.expression);

    if (isStandardLibraryType(context, ownerType, undefined)) {
        const symbol = ownerType.getSymbol();
        switch (symbol?.name) {
            case "ArrayConstructor":
                return transformArrayConstructorCall(context, node);
            case "Console":
                return transformConsoleCall(context, node);
            case "Math":
                return transformMathCall(context, node);
            case "StringConstructor":
                return transformStringConstructorCall(context, node);
            case "ObjectConstructor":
                return transformObjectConstructorCall(context, node);
            case "SymbolConstructor":
                return transformSymbolConstructorCall(context, node);
            case "NumberConstructor":
                return transformNumberConstructorCall(context, node);
            case "PromiseConstructor":
                return transformPromiseConstructorCall(context, node);
        }
    }

    if (isStringType(context, ownerType) && hasStandardLibrarySignature(context, node)) {
        return transformStringPrototypeCall(context, node);
    }

    if (isNumberType(context, ownerType) && hasStandardLibrarySignature(context, node)) {
        return transformNumberPrototypeCall(context, node);
    }

    if (isArrayType(context, ownerType) && hasStandardLibrarySignature(context, node)) {
        return transformArrayPrototypeCall(context, node);
    }

    if (isFunctionType(context, ownerType) && hasStandardLibrarySignature(context, node)) {
        return transformFunctionPrototypeCall(context, node);
    }

    const objectResult = transformObjectPrototypeCall(context, node);
    if (objectResult) {
        return objectResult;
    }
}

export function transformBuiltinIdentifierExpression(
    context: TransformationContext,
    node: ts.Identifier
): lua.Expression | undefined {
    switch (node.text) {
        case "NaN":
            return createNaN(node);

        case "Infinity":
            const math = lua.createIdentifier("math");
            const huge = lua.createStringLiteral("huge");
            return lua.createTableIndexExpression(math, huge, node);

        case "globalThis":
            return lua.createIdentifier("_G", node, getIdentifierSymbolId(context, node), "globalThis");
    }
}
