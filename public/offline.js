const database = () =>
  new Promise((resolve, reject) => {
    const r = indexedDB.open("arewa-field-v3", 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore("drafts", { keyPath: "key" });
      r.result.createObjectStore("context", { keyPath: "key" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
async function transaction(store, mode, fn) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      let result;
      fn(tx.objectStore(store), (value) => {
        result = value;
      });
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () =>
        reject(tx.error || Error("Local storage could not be saved."));
    });
  } finally {
    db.close();
  }
}
export const prepared = () =>
  transaction("context", "readonly", (s, done) => {
    const r = s.get("active");
    r.onsuccess = () => done(r.result?.value || null);
  });
export async function prepare(refs) {
  if (refs.user.role !== "FOCAL_PERSON") return;
  const minimal = {
    user: refs.user,
    lgas: refs.lgas.filter((l) => refs.user.lgaIds.includes(l.id)),
    sectors: refs.sectors,
    workspace: refs.workspace,
  };
  await transaction("context", "readwrite", (s, done) => {
    s.put({ key: "active", value: minimal });
    done(minimal);
  });
  await navigator.storage?.persist?.();
}
export const draftsFor = (user) =>
  transaction("drafts", "readonly", (s, done) => {
    const r = s.getAll();
    r.onsuccess = () =>
      done(
        r.result.filter(
          (d) => d.userId === user.id && d.workspaceId === user.workspaceId,
        ),
      );
  });
export const putDraft = (user, draft) =>
  transaction("drafts", "readwrite", (s, done) => {
    const value = {
      ...draft,
      userId: user.id,
      workspaceId: user.workspaceId,
      key: user.workspaceId + ":" + user.id + ":" + draft.id,
      savedAt: new Date().toISOString(),
    };
    s.put(value);
    done(value);
  });
export const removeDraft = (user, id) =>
  transaction("drafts", "readwrite", (s, done) => {
    s.delete(user.workspaceId + ":" + user.id + ":" + id);
    done(true);
  });
export async function clearUser(user) {
  const drafts = await draftsFor(user);
  await transaction("drafts", "readwrite", (s, done) => {
    drafts.forEach((d) => s.delete(d.key));
    done(true);
  });
  await transaction("context", "readwrite", (s, done) => {
    s.delete("active");
    done(true);
  });
}
export const localState = (s) =>
  ({
    LOCAL_DRAFT: "Saved on this device",
    QUEUED: "Waiting to send",
    SYNCING: "Sending…",
    FAILED_RETRYABLE: "Could not send · retry available",
    NEEDS_SIGN_IN: "Sign in again to send",
    BLOCKED_PERMISSION: "Assignment or access changed",
    CONFLICT: "Changes need your attention",
  })[s] || s;
export const forgetPreparation = () =>
  transaction("context", "readwrite", (s, done) => {
    s.delete("active");
    done(true);
  });
