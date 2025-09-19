import type {
  MutationKey,
  QueryKey,
  QueryClient,
  Updater,
} from "@tanstack/react-query";

// Generic key helpers
export const createKeys = <TPrefix extends string>(prefix: TPrefix) => ({
  all: [prefix] as const,
  lists: () => [prefix, "list"] as const,
  details: () => [prefix, "detail"] as const,
  list: (filters?: unknown) => [prefix, "list", filters ?? {}] as const,
  detail: (id: string | number) => [prefix, "detail", id] as const,
});

// Optimistic update helpers
export function optimisticUpdateList<TItem>(
  queryClient: QueryClient,
  key: QueryKey,
  updater: Updater<TItem[], TItem[]>
) {
  const previous = queryClient.getQueryData<TItem[]>(key);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queryClient.setQueryData<TItem[]>(key, updater);
  return () => queryClient.setQueryData<TItem[] | undefined>(key, previous);
}

export function optimisticUpdateDetail<TItem>(
  queryClient: QueryClient,
  key: QueryKey,
  updater: Updater<TItem, TItem>
) {
  const previous = queryClient.getQueryData<TItem>(key);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queryClient.setQueryData<TItem>(key, updater);
  return () => queryClient.setQueryData<TItem | undefined>(key, previous);
}

export const mutationOnMutate = <TListItem>(
  queryClient: QueryClient,
  listKey?: QueryKey,
  updater?: (current: TListItem[] | undefined) => TListItem[]
) => {
  return async () => {
    if (!listKey || !updater) return {};
    await queryClient.cancelQueries({ queryKey: listKey });
    const previous = queryClient.getQueryData<TListItem[]>(listKey);
    queryClient.setQueryData<TListItem[] | undefined>(
      listKey,
      updater(previous)
    );
    return { previous } as { previous: TListItem[] | undefined };
  };
};

export const mutationOnError = <TListItem>(
  queryClient: QueryClient,
  listKey?: QueryKey
) => {
  return (
    _err: unknown,
    _variables: unknown,
    context?: { previous?: TListItem[] }
  ) => {
    if (!listKey) return;
    if (context?.previous) {
      queryClient.setQueryData<TListItem[] | undefined>(
        listKey,
        context.previous
      );
    }
  };
};

export const mutationOnSettled = (
  queryClient: QueryClient,
  invalidateKeys: Array<QueryKey | { queryKey: QueryKey }>
) => {
  return async () => {
    for (const key of invalidateKeys) {
      if (Array.isArray(key)) {
        await queryClient.invalidateQueries({ queryKey: key });
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await queryClient.invalidateQueries(key);
      }
    }
  };
};
