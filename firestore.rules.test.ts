/**
 * Adversarial "Dirty Dozen" Firestore Rules Verification Matrix
 * Documents expected PERMISSION_DENIED outcomes for Saathi security invariants.
 */
export interface RulesTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_CASES: RulesTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated solution create',
    operation: 'create',
    path: '/solutions/sol_test_1',
    auth: null,
    payload: { authorUid: 'anon', summary: 'test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified email solution create',
    operation: 'create',
    path: '/solutions/sol_test_2',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: false },
    payload: { authorUid: 'u1', summary: 'test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity spoofing on solution create',
    operation: 'create',
    path: '/solutions/sol_test_3',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { authorUid: 'bob', summary: 'spoof' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Admin email spoofing with unverified email',
    operation: 'list',
    path: '/telemetryEvents',
    auth: { uid: 'spoof', email: 'suryaaru918@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Ghost field injection on user profile create',
    operation: 'create',
    path: '/users/alice',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { uid: 'alice', displayName: 'Alice', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Cross-user PII private info read',
    operation: 'get',
    path: '/users/alice/private/info',
    auth: { uid: 'bob', email: 'bob@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned private info write without parent user profile',
    operation: 'create',
    path: '/users/new_user/private/info',
    auth: { uid: 'new_user', email: 'new@example.com', email_verified: true },
    payload: { uid: 'new_user', phoneMasked: 'XXXXXX1234' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'ID poisoning on solution document ID',
    operation: 'create',
    path: '/solutions/bad$id!invalid',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { authorUid: 'alice' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Oversized transcript resource exhaustion',
    operation: 'create',
    path: '/solutions/sol_oversize',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { authorUid: 'alice', transcript: 'x'.repeat(2500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Forged client timestamp on telemetry create',
    operation: 'create',
    path: '/telemetryEvents/evt_1',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { uid: 'alice', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immutable authorUid hijack on solution update',
    operation: 'update',
    path: '/solutions/sol_existing',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { authorUid: 'bob' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Privilege escalation write to /admins',
    operation: 'create',
    path: '/admins/alice',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: { granted: true },
    expected: 'PERMISSION_DENIED',
  },
];
