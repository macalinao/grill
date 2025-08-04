import type { Address } from "@solana/kit";
import { useQuery } from "@tanstack/react-query";
import { accountQueryKey } from "../accounts/accountQuery.js";

export const useAccount = (address: Address) => {
  useQuery({
    queryKey: accountQueryKey(address),
    queryFn: () => getAccount(address),
  });
};
