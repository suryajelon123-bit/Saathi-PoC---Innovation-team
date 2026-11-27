# Saathi Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Verified Identity & Anti-Spoofing**: Every write requires `request.auth != null && request.auth.token.email_verified == true`. All `uid` / `authorUid` fields must strictly equal `request.auth.uid`.
2. **PII Isolation (Split Collection)**: `/users/{userId}` holds only non-sensitive display/progress metrics; phone/email live strictly inside `/users/{userId}/private/{docId}` gated by `isOwner(userId) || isAdmin()`, with a `exists(/users/{userId})` Master Gate.
3. **Strict Schema & No Ghost Fields**: Every `create` verifies exact `keys().hasAll(...)` and `keys().hasOnly(...)`; every `update` runs `isValid[Entity](incoming())` and restricts `affectedKeys().hasOnly(...)` per action.
4. **Immutable Ownership & Server Timestamps**: `uid`/`authorUid`/`createdAt` are immutable after creation; `createdAt` on create and `updatedAt` on update must equal `request.time`.
5. **No Blanket List Scraping**: Every `allow list` validates `resource.data` (e.g., `resource.data.isPublic == true`, `resource.data.uid == request.auth.uid`, or `isAdmin()`).
6. **Admin Isolation**: Admin access is gated by verified bootstrap email (`suryaaru918@gmail.com` with `email_verified == true`) or `/admins/$(request.auth.uid)` document existence; clients can never write `/admins/*`.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: Create `/solutions/sol-1` with `auth == null`.
2. **Unverified Email Write**: Create `/solutions/sol-1` where `email_verified == false`.
3. **Identity Spoofing**: User `alice` creates `/solutions/sol-1` with `authorUid: "bob"`.
4. **Admin Email Spoofing**: User with email `suryaaru918@gmail.com` and `email_verified: false` reads `/telemetryEvents`.
5. **Shadow / Ghost Field Injection**: Create `/users/alice` with extra `isAdmin: true` or `role: "superadmin"`.
6. **PII Cross-User Read**: User `bob` reads `/users/alice/private/info`.
7. **Orphaned Private Info Write**: Create `/users/alice/private/info` when parent `/users/alice` does not exist.
8. **ID Poisoning**: Create `/solutions/bad$id!with/spaces` or >128 char ID.
9. **Resource Exhaustion (1MB String)**: Create `/solutions/sol-1` with `transcript` > 1000 characters.
10. **Forged Timestamp**: Create `/telemetryEvents/evt-1` with client `createdAt` instead of `request.time`.
11. **Update-Gap / Ownership Hijack**: Update `/solutions/sol-1` changing `authorUid` or `createdAt`.
12. **Blanket Telemetry Scraping**: Non-admin user `alice` runs unbounded `list` on `/telemetryEvents` without `where('uid', '==', 'alice')`.
