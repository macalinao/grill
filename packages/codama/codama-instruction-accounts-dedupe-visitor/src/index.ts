import type {
  AnchorIdl,
  IdlV01InstructionAccountItem,
} from "@codama/nodes-from-anchor";
import { instructionAccountNodeFromAnchorV01 } from "@codama/nodes-from-anchor";
import type {
  AccountNode,
  InstructionAccountNode,
  InstructionArgumentNode,
} from "codama";
import {
  assertIsNode,
  bottomUpTransformerVisitor,
  camelCase,
  rootNodeVisitor,
  visit,
} from "codama";

function instructionAccountNodesFromAnchorV01(
  allAccounts: AccountNode[],
  instructionArguments: InstructionArgumentNode[],
  idl: IdlV01InstructionAccountItem[],
  parent: string | null = null,
): InstructionAccountNode[] {
  return idl.flatMap((account) =>
    "accounts" in account
      ? instructionAccountNodesFromAnchorV01(
          allAccounts,
          instructionArguments,
          account.accounts,
          // null,
          parent ? `${parent}_${account.name}` : account.name,
        )
      : [
          instructionAccountNodeFromAnchorV01(
            allAccounts,
            instructionArguments,
            {
              ...account,
              name: parent ? `${parent}_${account.name}` : account.name,
              pda:
                account.pda && parent
                  ? {
                      ...account.pda,
                      seeds: account.pda.seeds.map((seed) => {
                        if (seed.kind === "account") {
                          return {
                            ...seed,
                            path: `${parent}_${seed.path}`,
                          };
                        }
                        return seed;
                      }),
                    }
                  : undefined,
            },
            idl,
          ),
        ],
  );
}

/**
 * Creates a Codama visitor that deduplicates and flattens nested instruction accounts from an Anchor IDL.
 *
 * This visitor addresses the issue where Anchor IDLs can have nested account structures (account groups)
 * that need to be flattened into a single level for proper code generation. It preserves the relationships
 * between parent and child accounts through naming conventions.
 *
 * @param idl - The Anchor IDL containing the instruction definitions with potentially nested accounts
 * @returns A root node visitor that transforms all instruction nodes to have flattened account structures
 *
 * @example
 * ```typescript
 * // Given an Anchor IDL with nested accounts:
 * // {
 * //   name: "mintAccounts",
 * //   accounts: [
 * //     { name: "mint", ... },
 * //     { name: "metadata", ... }
 * //   ]
 * // }
 *
 * // The visitor will flatten to:
 * // [
 * //   { name: "mintAccounts_mint", ... },
 * //   { name: "mintAccounts_metadata", ... }
 * // ]
 *
 * const root = rootNodeFromAnchor(idl);
 * const visitor = instructionAccountsDedupeVisitor(idl);
 * const transformedRoot = visit(root, visitor);
 * ```
 *
 * @remarks
 * - Account names are joined with underscores to maintain parent-child relationships
 * - PDA seed paths are automatically updated to match the flattened structure
 * - All account metadata and constraints are preserved during flattening
 * - The visitor operates on instruction nodes using a bottom-up transformer
 */
export function instructionAccountsDedupeVisitor(
  idl: AnchorIdl,
): ReturnType<typeof rootNodeVisitor> {
  return rootNodeVisitor((node) => {
    const accountNodes = node.program.accounts;
    const instructionVisitor = bottomUpTransformerVisitor([
      {
        select: "[instructionNode]",
        transform: (node) => {
          assertIsNode(node, "instructionNode");
          const idlIx = idl.instructions.find(
            (ix) => camelCase(ix.name) === node.name,
          );
          if (!idlIx) {
            throw new Error(`Instruction ${node.name} not found in Idl`);
          }
          return {
            ...node,
            accounts: instructionAccountNodesFromAnchorV01(
              accountNodes,
              node.arguments,
              idlIx.accounts,
            ),
          };
        },
      },
    ]);
    return visit(node, instructionVisitor);
  });
}
