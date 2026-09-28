import type {
  Instruction,
  TransactionMessage,
  TransactionMessageWithFeePayer,
} from "@solana/kit";
import {
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithinSizeLimit,
  createTransactionPlanner,
  nonDivisibleSequentialInstructionPlan,
} from "@solana/kit";

/**
 * The most top-level instructions kit will compile into one transaction, of
 * any version. The planner defaults to 16, which would reject transactions
 * that compile fine today.
 */
const MAX_INSTRUCTIONS_PER_TRANSACTION = 64;

export interface PlanSingleTransactionMessageParams<
  TMessage extends TransactionMessage & TransactionMessageWithFeePayer,
> {
  /**
   * The message to plan the instructions into: fee payer, lifetime and compute
   * budget already set, and no instructions of the caller's yet.
   */
  baseMessage: TMessage;
  instructions: readonly Instruction[];
  /**
   * Applied every time the planner adds instructions, so the planner's size
   * checks see the final shape of the message (e.g. after address lookup table
   * compression). Must be idempotent and must not change the message type.
   */
  onTransactionMessageUpdated?: ((message: TMessage) => TMessage) | undefined;
}

/**
 * Plans `instructions` into exactly one transaction message using kit's
 * transaction planner.
 *
 * Never splits: if the instructions do not fit in a single transaction, this
 * throws kit's precise compile or size error (too many accounts, too many
 * signers, transaction too large, ...) instead of returning a multi-transaction
 * plan.
 */
export async function planSingleTransactionMessage<
  TMessage extends TransactionMessage & TransactionMessageWithFeePayer,
>({
  baseMessage,
  instructions,
  onTransactionMessageUpdated = (message) => message,
}: PlanSingleTransactionMessageParams<TMessage>): Promise<TMessage> {
  // The planner refuses an empty plan, but an instruction-less transaction is
  // a valid (if unusual) thing to send, so build it directly.
  if (instructions.length === 0) {
    return onTransactionMessageUpdated(baseMessage);
  }

  // The planner is typed against the widest message type; everything it does
  // to our message is append instructions and call our callback, so the
  // message it hands back is still a `TMessage`.
  const planner = createTransactionPlanner({
    createTransactionMessage: () => baseMessage,
    onTransactionMessageUpdated: (message) =>
      onTransactionMessageUpdated(message as TMessage),
    maxInstructionsPerTransaction: MAX_INSTRUCTIONS_PER_TRANSACTION,
  });
  const plan = await planner(
    nonDivisibleSequentialInstructionPlan([...instructions]),
  );
  if (plan.kind === "single") {
    return plan.message as TMessage;
  }

  // The planner split the instructions. Surface why a single transaction
  // cannot hold them: compiling the whole message throws kit's error for
  // count limits, and the size assertion for everything else.
  const fullMessage = onTransactionMessageUpdated(
    appendTransactionMessageInstructions(instructions, baseMessage) as TMessage,
  );
  assertIsTransactionMessageWithinSizeLimit(fullMessage);
  throw new Error(
    `The ${String(instructions.length)} instructions do not fit in a single transaction.`,
  );
}
