import { defineConfig } from "@macalinao/grill-cli";
import {
  addPdasVisitor,
  constantPdaSeedNodeFromString,
  publicKeyTypeNode,
  variablePdaSeedNode,
} from "codama";

const addCustomPDAsVisitor = addPdasVisitor({
  tokenMetadata: [
    {
      name: "metadata",
      seeds: [
        constantPdaSeedNodeFromString("utf8", "metadata"),
        variablePdaSeedNode(
          "programId",
          publicKeyTypeNode(),
          "The address of the program",
        ),
        variablePdaSeedNode(
          "mint",
          publicKeyTypeNode(),
          "The address of the mint account",
        ),
      ],
    },
  ],
});

export default defineConfig({
  idlPath: "./idls/token_metadata.json",
  outputDir: "./src/generated",
  visitors: [addCustomPDAsVisitor],
});
