import type {
  TransactionMessage,
  TransactionMessageWithFeePayer,
  TransactionPlanResult,
  TransactionPlanResultContext,
} from "@solana/kit";
import {
  assertIsSuccessfulSingleTransactionPlanResult,
  createTransactionPlanExecutor,
  getFirstFailedSingleTransactionPlanResult,
  isSolanaError,
  SOLANA_ERROR__INSTRUCTION_PLANS__FAILED_TO_EXECUTE_TRANSACTION_PLAN,
  singleTransactionPlan,
} from "@solana/kit";

/**
 * Runs one transaction message through a kit transaction plan executor built
 * on `executeTransactionMessage`, and returns the context it produced.
 *
 * Kit's executor wraps whatever the callback throws in a
 * `SOLANA_ERROR__INSTRUCTION_PLANS__FAILED_TO_EXECUTE_TRANSACTION_PLAN` error.
 * This unwraps it and rethrows the callback's own error, so callers see
 * exactly what the send or sign step failed with.
 */
export async function executeSingleTransactionMessage<
  TMessage extends TransactionMessage & TransactionMessageWithFeePayer,
  TContext extends TransactionPlanResultContext,
>(
  message: TMessage,
  executeTransactionMessage: (
    context: Partial<TContext>,
    message: TMessage,
  ) => Promise<TContext>,
): Promise<TContext> {
  // The executor hands back the message it was given, i.e. `message`.
  const executor = createTransactionPlanExecutor<TContext>({
    executeTransactionMessage: (context, planned) =>
      executeTransactionMessage(context, planned as TMessage),
  });

  let result: Awaited<ReturnType<typeof executor>>;
  try {
    result = await executor(singleTransactionPlan(message));
  } catch (error: unknown) {
    if (
      isSolanaError(
        error,
        SOLANA_ERROR__INSTRUCTION_PLANS__FAILED_TO_EXECUTE_TRANSACTION_PLAN,
      )
    ) {
      const failed = getFirstFailedSingleTransactionPlanResult(
        error.context.transactionPlanResult as TransactionPlanResult<TContext>,
      );
      // oxlint-disable-next-line typescript/only-throw-error -- rethrowing the callback's own error as-is
      throw failed.error;
    }
    throw error;
  }
  assertIsSuccessfulSingleTransactionPlanResult(result);
  return result.context;
}
