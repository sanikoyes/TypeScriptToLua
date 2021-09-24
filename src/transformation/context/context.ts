import * as ts from "typescript";
import { CompilerOptions, LuaTarget } from "../../CompilerOptions";
import * as lua from "../../LuaAST";
import { castArray } from "../../utils";
import { unsupportedNodeKind } from "../utils/diagnostics";
import { unwrapVisitorResult } from "../utils/lua-ast";
import { ExpressionLikeNode, ObjectVisitor, StatementLikeNode, VisitorMap } from "./visitors";

export interface AllAccessorDeclarations {
    firstAccessor: ts.AccessorDeclaration;
    secondAccessor: ts.AccessorDeclaration | undefined;
    getAccessor: ts.GetAccessorDeclaration | undefined;
    setAccessor: ts.SetAccessorDeclaration | undefined;
}

export interface EmitResolver {
    isValueAliasDeclaration(node: ts.Node): boolean;
    isReferencedAliasDeclaration(node: ts.Node, checkChildren?: boolean): boolean;
    isTopLevelValueImportEqualsWithEntityName(node: ts.ImportEqualsDeclaration): boolean;
    moduleExportsSomeValue(moduleReferenceExpression: ts.Expression): boolean;
    getAllAccessorDeclarations(declaration: ts.AccessorDeclaration): AllAccessorDeclarations;
}

export interface DiagnosticsProducingTypeChecker extends ts.TypeChecker {
    getEmitResolver(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken): EmitResolver;
}

export class TransformationContext {
    public readonly diagnostics: ts.Diagnostic[] = [];
    public readonly checker: DiagnosticsProducingTypeChecker = this.program.getDiagnosticsProducingTypeChecker();
    public readonly resolver: EmitResolver;

    public readonly options: CompilerOptions = this.program.getCompilerOptions();
    public readonly luaTarget = this.options.luaTarget ?? LuaTarget.Universal;
    public readonly isModule = ts.isExternalModule(this.sourceFile);
    public readonly isStrict =
        (this.options.alwaysStrict ?? this.options.strict) ||
        (this.isModule && this.options.target !== undefined && this.options.target >= ts.ScriptTarget.ES2015);

    constructor(public program: ts.Program, public sourceFile: ts.SourceFile, private visitorMap: VisitorMap) {
        // Use `getParseTreeNode` to get original SourceFile node, before it was substituted by custom transformers.
        // It's required because otherwise `getEmitResolver` won't use cached diagnostics, produced in `emitWorker`
        // and would try to re-analyze the file, which would fail because of replaced nodes.
        const originalSourceFile = ts.getParseTreeNode(sourceFile, ts.isSourceFile) ?? sourceFile;
        this.resolver = this.checker.getEmitResolver(originalSourceFile);
    }

    private currentNodeVisitors: Array<ObjectVisitor<ts.Node>> = [];

    public transformNode(node: ts.Node): lua.Node[];
    /** @internal */
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    public transformNode(node: ts.Node, isExpression?: boolean): lua.Node[];
    public transformNode(node: ts.Node, isExpression?: boolean): lua.Node[] {
        // TODO: Move to visitors?
        if (node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword)) {
            return [];
        }

        const nodeVisitors = this.visitorMap.get(node.kind);
        if (!nodeVisitors || nodeVisitors.length === 0) {
            this.diagnostics.push(unsupportedNodeKind(node, node.kind));
            return isExpression ? [lua.createNilLiteral()] : [];
        }

        const previousNodeVisitors = this.currentNodeVisitors;
        this.currentNodeVisitors = [...nodeVisitors];

        const visitor = this.currentNodeVisitors.pop()!;
        const result = unwrapVisitorResult(visitor.transform(node, this));

        this.currentNodeVisitors = previousNodeVisitors;

        return result;
    }

    public superTransformNode(node: ts.Node): lua.Node[] {
        if (this.currentNodeVisitors.length === 0) {
            throw new Error(`There is no super transform for ${ts.SyntaxKind[node.kind]} visitor`);
        }

        const visitor = this.currentNodeVisitors.pop()!;
        return unwrapVisitorResult(visitor.transform(node, this));
    }

    public transformExpression(node: ExpressionLikeNode): lua.Expression {
        const [result] = this.transformNode(node, true);

        if (result === undefined) {
            throw new Error(`Expression visitor for node type ${ts.SyntaxKind[node.kind]} did not return any result.`);
        }

        return result as lua.Expression;
    }

    public superTransformExpression(node: ExpressionLikeNode): lua.Expression {
        const [result] = this.superTransformNode(node);

        if (result === undefined) {
            throw new Error(`Expression visitor for node type ${ts.SyntaxKind[node.kind]} did not return any result.`);
        }

        return result as lua.Expression;
    }

    public transformStatements(node: StatementLikeNode | readonly StatementLikeNode[]): lua.Statement[] {
        return castArray(node).flatMap(n => this.transformNode(n) as lua.Statement[]);
    }

    public superTransformStatements(node: StatementLikeNode | readonly StatementLikeNode[]): lua.Statement[] {
        return castArray(node).flatMap(n => this.superTransformNode(n) as lua.Statement[]);
    }
}
