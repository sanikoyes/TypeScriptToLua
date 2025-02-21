import * as ts from "typescript";
import * as lua from "../../LuaAST";
import { FunctionVisitor, TransformationContext } from "../context";
import { AnnotationKind, getTypeAnnotations } from "../utils/annotations";
import { getSymbolExportScope } from "../utils/export";
import { createLocalOrExportedOrGlobalDeclaration } from "../utils/lua-ast";
import { isFirstDeclaration } from "../utils/typescript";
import { transformIdentifier } from "./identifier";
import { transformPropertyName } from "./literal";

export function tryGetConstEnumValue(
    context: TransformationContext,
    node: ts.EnumMember | ts.PropertyAccessExpression | ts.ElementAccessExpression
): lua.Expression | undefined {
    const value = context.checker.getConstantValue(node);
    if (typeof value === "string") {
        return lua.createStringLiteral(value, node);
    } else if (typeof value === "number") {
        return lua.createNumericLiteral(value, node);
    }
}

function transformComments(node: ts.Node) {
    try {
        if (node.pos < 0 || node.end <= node.pos) {
            return [];
        }
        const fullText = node.getFullText();
        const text = node.getText();
        const comments = fullText.substring(0, fullText.length - text.length).trim();
        if (comments.length > 0) {
            return comments.split("\n").map(value => value.replace(/^\/\*\*|\s*\*\/|^\s*\*|^\/\//g, ""));
        }
    } catch (e) {
        // ignored
    }
    return [];
}

export const transformEnumDeclaration: FunctionVisitor<ts.EnumDeclaration> = (node, context) => {
    if (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Const && !context.options.preserveConstEnums) {
        return undefined;
    }

    const type = context.checker.getTypeAtLocation(node);
    const membersOnly = getTypeAnnotations(type).has(AnnotationKind.CompileMembersOnly);
    const result: lua.Statement[] = [];

    if (!membersOnly && isFirstDeclaration(context, node)) {
        const name = transformIdentifier(context, node.name);
        const table = lua.createBinaryExpression(
            lua.cloneIdentifier(name),
            lua.createTableExpression(),
            lua.SyntaxKind.OrOperator
        );
        result.push(...createLocalOrExportedOrGlobalDeclaration(context, name, table, node));

        const comments = transformComments(node);
        if (result.length > 0 && comments.length > 0) {
            const firstLuaStatement = result[0];
            firstLuaStatement.leadingComments = comments;
        }
    }

    const enumReference = context.transformExpression(node.name);
    for (const member of node.members) {
        const memberName = transformPropertyName(context, member.name);

        let valueExpression: lua.Expression | undefined;
        const constEnumValue = tryGetConstEnumValue(context, member);
        if (constEnumValue) {
            valueExpression = constEnumValue;
        } else if (member.initializer) {
            if (ts.isIdentifier(member.initializer)) {
                const symbol = context.checker.getSymbolAtLocation(member.initializer);
                if (
                    symbol?.valueDeclaration &&
                    ts.isEnumMember(symbol.valueDeclaration) &&
                    symbol.valueDeclaration.parent === node
                ) {
                    const otherMemberName = transformPropertyName(context, symbol.valueDeclaration.name);
                    valueExpression = lua.createTableIndexExpression(enumReference, otherMemberName);
                }
            }

            if (!valueExpression) {
                valueExpression = context.transformExpression(member.initializer);
            }
        } else {
            valueExpression = lua.createNilLiteral();
        }
        const comments = transformComments(member);

        if (membersOnly) {
            const enumSymbol = context.checker.getSymbolAtLocation(node.name);
            const exportScope = enumSymbol ? getSymbolExportScope(context, enumSymbol) : undefined;

            result.push(
                ...createLocalOrExportedOrGlobalDeclaration(
                    context,
                    lua.isIdentifier(memberName)
                        ? memberName
                        : lua.createIdentifier(member.name.getText(), member.name),
                    valueExpression,
                    node,
                    exportScope
                )
            );

            if (comments.length > 0) {
                result[result.length - 1].leadingComments = comments;
            }
        } else {
            const memberAccessor = lua.createTableIndexExpression(enumReference, memberName);
            const stmt = lua.createAssignmentStatement(memberAccessor, valueExpression, member)
            if (comments.length > 0) {
                stmt.leadingComments = comments;
            }
            result.push(stmt);

            if (!lua.isStringLiteral(valueExpression) && !lua.isNilLiteral(valueExpression)) {
                const reverseMemberAccessor = lua.createTableIndexExpression(enumReference, memberAccessor);
                result.push(lua.createAssignmentStatement(reverseMemberAccessor, memberName, member));
            }
        }
    }

    return result;
};
