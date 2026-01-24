/**
 * Solana InstructionError message mappings.
 * These messages are based on the official Solana SDK:
 * https://docs.rs/solana-program/latest/solana_program/instruction/enum.InstructionError.html
 */

/**
 * InstructionError variant names mapped to their human-readable messages.
 */
export const INSTRUCTION_ERROR_MESSAGES: Record<string, string> = {
  // Generic/deprecated errors
  GenericError: "Generic instruction error",
  InvalidArgument: "Invalid program argument",
  InvalidInstructionData: "Invalid instruction data",
  InvalidAccountData: "Invalid account data for instruction",
  AccountDataTooSmall: "Account data too small for instruction",
  InsufficientFunds: "Insufficient funds for instruction",
  IncorrectProgramId: "Incorrect program id for instruction",
  MissingRequiredSignature: "Missing required signature for instruction",
  AccountAlreadyInitialized: "Instruction requires an uninitialized account",
  UninitializedAccount: "Instruction requires an initialized account",
  UnbalancedInstruction:
    "Sum of account balances before and after instruction do not match",
  ModifiedProgramId: "Instruction illegally modified the program id of an account",
  ExternalAccountLamportSpend:
    "Instruction spent from the balance of an account it does not own",
  ExternalAccountDataModified:
    "Instruction modified data of an account it does not own",
  ReadonlyLamportChange:
    "Instruction changed the balance of a read-only account",
  ReadonlyDataModified: "Instruction modified data of a read-only account",
  DuplicateAccountIndex: "Instruction contains duplicate accounts",
  ExecutableModified: "Instruction changed executable bit of an account",
  RentEpochModified: "Instruction modified rent epoch of an account",
  NotEnoughAccountKeys: "Insufficient account keys for instruction",
  AccountDataSizeChanged:
    "Program other than the account's owner changed the size of the account data",
  AccountNotExecutable: "Instruction expected an executable account",
  AccountBorrowFailed:
    "Failed to borrow a reference to account data, already borrowed",
  AccountBorrowOutstanding:
    "Account data has an outstanding reference after a program's execution",
  DuplicateAccountOutOfSync:
    "The same account was multiply passed to an on-chain program but the program modified them differently",
  InvalidError: "Returned error code is not allowed from the program",
  ExecutableDataModified: "Executable account's data was modified",
  ExecutableLamportChange:
    "Executable account's lamports modified",
  ExecutableAccountNotRentExempt: "Executable account not rent-exempt",
  UnsupportedProgramId: "Unsupported program id",
  CallDepth: "Cross-program invocation call depth too deep",
  MissingAccount: "An account required by the instruction is missing",
  ReentrancyNotAllowed:
    "Cross-program invocation reentrancy not allowed for this instruction",
  MaxSeedLengthExceeded: "Length of the seed is too long for address generation",
  InvalidSeeds: "Provided seeds do not result in a valid address",
  InvalidRealloc: "Failed to reallocate account data",
  ComputationalBudgetExceeded: "Computational budget exceeded",
  PrivilegeEscalation:
    "Cross-program invocation with unauthorized signer or writable account",
  ProgramEnvironmentSetupFailure: "Failed to create program execution environment",
  ProgramFailedToComplete: "Program failed to complete",
  ProgramFailedToCompile: "Program failed to compile",
  Immutable: "Account is immutable",
  IncorrectAuthority: "Incorrect authority provided",
  BorshIoError: "Failed to serialize or deserialize account data",
  AccountNotRentExempt:
    "An account does not have enough lamports to be rent-exempt",
  InvalidAccountOwner: "Invalid account owner",
  ArithmeticOverflow: "Program arithmetic overflowed",
  UnsupportedSysvar: "Unsupported sysvar",
  IllegalOwner: "Provided owner is not allowed",
  MaxAccountsDataAllocationsExceeded:
    "Accounts data allocations exceeded the maximum allowed per transaction",
  MaxAccountsExceeded: "Max accounts exceeded",
  MaxInstructionTraceLengthExceeded: "Max instruction trace length exceeded",
  BuiltinProgramsMustConsumeComputeUnits:
    "Builtin programs must consume compute units",
};

/**
 * Gets the human-readable message for an InstructionError.
 *
 * @param error - The InstructionError value from the RPC response
 * @returns The formatted error message
 */
export function getInstructionErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return "Unknown instruction error";
  }

  // Handle string error (simple variant like "GenericError")
  if (typeof error === "string") {
    return INSTRUCTION_ERROR_MESSAGES[error] ?? `Instruction error: ${error}`;
  }

  // Handle object error (variant with data like { Custom: 1 } or { BorshIoError: "..." })
  if (typeof error === "object") {
    const entries = Object.entries(error as Record<string, unknown>);
    if (entries.length === 0) {
      return "Unknown instruction error";
    }

    const [variant, value] = entries[0];

    // Special case for Custom errors
    if (variant === "Custom") {
      if (typeof value === "number") {
        return `Custom program error: 0x${value.toString(16)} (${value})`;
      }
      return `Custom program error: ${String(value)}`;
    }

    // Special case for BorshIoError with message
    if (variant === "BorshIoError" && typeof value === "string") {
      return `Borsh serialization error: ${value}`;
    }

    // For other variants with additional data
    const baseMessage =
      INSTRUCTION_ERROR_MESSAGES[variant] ?? `Instruction error: ${variant}`;
    if (value !== null && value !== undefined) {
      return `${baseMessage}: ${String(value)}`;
    }
    return baseMessage;
  }

  return `Unknown instruction error: ${String(error)}`;
}
