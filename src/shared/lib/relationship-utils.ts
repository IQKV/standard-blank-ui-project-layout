import type { QueryClient, QueryKey } from "@tanstack/react-query";

// Many-to-many / one-to-many relationship cache helpers

export type Id = string | number;

export interface RelationIndex {
  // parentId -> childIds
  forward: Record<string, Id[]>;
  // childId -> parentIds
  reverse: Record<string, Id[]>;
}

export const createRelationKeys = (prefix: string) => ({
  index: () => [prefix, "relations", "index"] as const,
  forParent: (parentId: Id) =>
    [prefix, "relations", "parent", String(parentId)] as const,
  forChild: (childId: Id) =>
    [prefix, "relations", "child", String(childId)] as const,
});

export const ensureIndex = (index: RelationIndex | undefined): RelationIndex =>
  index ?? { forward: {}, reverse: {} };

export const addRelation = (
  index: RelationIndex,
  parentId: Id,
  childId: Id
): RelationIndex => {
  const p = String(parentId);
  const c = String(childId);
  const forward = { ...index.forward };
  const reverse = { ...index.reverse };
  forward[p] = Array.from(new Set([...(forward[p] ?? []), c]));
  reverse[c] = Array.from(new Set([...(reverse[c] ?? []), p]));
  return { forward, reverse };
};

export const removeRelation = (
  index: RelationIndex,
  parentId: Id,
  childId: Id
): RelationIndex => {
  const p = String(parentId);
  const c = String(childId);
  const forward = { ...index.forward };
  const reverse = { ...index.reverse };
  if (forward[p]) forward[p] = forward[p].filter((x) => x !== c);
  if (reverse[c]) reverse[c] = reverse[c].filter((x) => x !== p);
  return { forward, reverse };
};

export const getChildren = (
  index: RelationIndex | undefined,
  parentId: Id
): Id[] => {
  const i = ensureIndex(index);
  return i.forward[String(parentId)] ?? [];
};

export const getParents = (
  index: RelationIndex | undefined,
  childId: Id
): Id[] => {
  const i = ensureIndex(index);
  return i.reverse[String(childId)] ?? [];
};

// Write-through helpers for React Query cache
export const setRelation = (
  qc: QueryClient,
  relationKey: QueryKey,
  parentId: Id,
  childId: Id
) => {
  const prev = ensureIndex(qc.getQueryData<RelationIndex>(relationKey));
  qc.setQueryData<RelationIndex>(
    relationKey,
    addRelation(prev, parentId, childId)
  );
  return prev;
};

export const unsetRelation = (
  qc: QueryClient,
  relationKey: QueryKey,
  parentId: Id,
  childId: Id
) => {
  const prev = ensureIndex(qc.getQueryData<RelationIndex>(relationKey));
  qc.setQueryData<RelationIndex>(
    relationKey,
    removeRelation(prev, parentId, childId)
  );
  return prev;
};

export const invalidateRelationViews = async (
  qc: QueryClient,
  keys: Array<QueryKey | { queryKey: QueryKey }>
) => {
  for (const key of keys) {
    if (Array.isArray(key)) await qc.invalidateQueries({ queryKey: key });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    else {
      // @ts-expect-error
      await qc.invalidateQueries(key);
    }
  }
};
