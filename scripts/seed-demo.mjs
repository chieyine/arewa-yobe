import pg from "pg";
import { sampleContent } from "./sample-content.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID, randomBytes } from "node:crypto";
import { connection } from "../src/db.mjs";
export async function seed(
  c,
  secretFile,
  referenceDate = "2026-09-08",
  existingCredentials = [],
) {
  if (
    Number((await c.query("select count(*) from civic.accounts")).rows[0].count)
  ) {
    console.log("Existing evaluation data preserved; no duplicate seed.");
    return;
  }
  const lgaNames = [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ];
  const sectors = [
    "Health",
    "Education",
    "Livelihoods",
    "WASH (proposed)",
    "Infrastructure (proposed)",
  ];
  const credentials = [];
  const users = [];
  await c.query("BEGIN");
  try {
    for (let n = 0; n < 17; n++)
      await c.query("insert into civic.reference_data values($1,$2,$3)", [
        `lga-${n + 1}`,
        "lga",
        {
          id: `lga-${n + 1}`,
          name: lgaNames[n],
          code: lgaNames[n].toUpperCase(),
        },
      ]);
    for (let n = 0; n < sectors.length; n++)
      await c.query("insert into civic.reference_data values($1,$2,$3)", [
        `sector-${n + 1}`,
        "sector",
        {
          id: `sector-${n + 1}`,
          label: sectors[n],
          code: sectors[n].split(" ")[0].toUpperCase(),
          active: true,
        },
      ]);
    async function user(email, displayName, role, lgaIds) {
      const id = randomUUID(),
        password =
          existingCredentials.find((entry) => entry.email === email)
            ?.password || randomBytes(18).toString("base64url");
      await c.query(
        "insert into civic.accounts values($1,$2,crypt($3,gen_salt('bf',8)),$4)",
        [id, email, password, displayName],
      );
      await c.query("insert into civic.memberships values($1,$2,$3,true,$4)", [
        id,
        "ws-evaluation",
        role,
        lgaIds,
      ]);
      const u = { id, email, password, displayName, role, lgaIds };
      users.push(u);
      credentials.push(u);
      return u;
    }
    const admin = await user(
      "admin.one@arewa-demo.invalid",
      "Workspace Administrator",
      "ADMIN",
      [],
    );
    await user(
      "admin.two@arewa-demo.invalid",
      "Monitoring Administrator",
      "ADMIN",
      [],
    );
    const meal = await user(
      "meal.lead@arewa-demo.invalid",
      "MEAL Lead",
      "MEAL",
      lgaNames.map((_, n) => `lga-${n + 1}`),
    );
    await user(
      "meal.support@arewa-demo.invalid",
      "MEAL Officer",
      "MEAL",
      lgaNames.slice(0, 8).map((_, n) => `lga-${n + 1}`),
    );
    for (let n = 0; n < 17; n++) {
      await user(
        `focal.${lgaNames[n].toLowerCase()}01@arewa-demo.invalid`,
        `Focal Person — ${lgaNames[n]} 01`,
        "FOCAL_PERSON",
        [`lga-${n + 1}`],
      );
      await user(
        `focal.${lgaNames[n].toLowerCase()}02@arewa-demo.invalid`,
        `Focal Person — ${lgaNames[n]} 02`,
        "FOCAL_PERSON",
        [`lga-${n + 1}`],
      );
    }
    let rn = 0;
    for (let n = 0; n < 17; n++)
      for (let kind = 0; kind < 2; kind++) {
        const id = randomUUID(),
          type = kind ? "SERVICE_ISSUE" : "PUBLIC_PROJECT";
        const scenario = sampleContent(n, kind);
        const item = {
          id,
          reference: `ITEM-${String(n * 2 + kind + 1).padStart(4, "0")}`,
          type,
          title: scenario.title,
          sectorId: `sector-${scenario.sector}`,
          lgaId: `lga-${n + 1}`,
          community: scenario.place,
          locationDescription: scenario.location,
          provisional: false,
          confirmedProgress: "NOT_CONFIRMED",
          version: 1,
          createdAt: referenceDate + "T08:00:00Z",
        };
        await c.query("insert into civic.items values($1,$2,$3)", [
          id,
          "ws-evaluation",
          item,
        ]);
        const author = users.find(
          (u) => u.role === "FOCAL_PERSON" && u.lgaIds.includes(item.lgaId),
        );
        for (let visit = 0; visit < 3; visit++) {
          rn++;
          const rid = randomUUID(),
            vid = randomUUID();
          const day = String(2 + ((n + visit) % 7)).padStart(2, "0");
          const dt = "2026-09-" + day;
          const state = [
            "APPROVED",
            "VERIFIED",
            "SUBMITTED",
            "IN_REVIEW",
            "NEEDS_CLARIFICATION",
            "REJECTED",
          ][(n + visit + kind) % 6];
          const r = {
            id: rid,
            reference: `RPT-${String(rn).padStart(5, "0")}`,
            itemId: id,
            authorId: author.id,
            reviewState: state,
            version: 1,
            currentRevisionId: vid,
            createdAt: dt + "T08:00:00Z",
            firstSubmittedAt: dt + "T08:00:00Z",
            lastSubmittedAt: dt + "T08:00:00Z",
          };
          const rev = {
            id: vid,
            reportId: rid,
            revisionNumber: 1,
            itemType: type,
            title: item.title,
            observedDate: dt,
            observationDate: dt,
            observedProgress: kind ? "OPEN" : "IN_PROGRESS",
            observation: scenario.visits[visit],
            community: item.community,
            lgaId: item.lgaId,
            sectorId: item.sectorId,
            submittedAt: r.firstSubmittedAt,
            submittedBy: author.id,
            evidenceNote: "No photograph attached to this visit.",
            stakeholder: scenario.stakeholder,
            suggestedAction: scenario.action,
          };
          await c.query("insert into civic.reports values($1,$2,$3)", [
            rid,
            "ws-evaluation",
            r,
          ]);
          await c.query("insert into civic.revisions values($1,$2,$3)", [
            vid,
            rid,
            rev,
          ]);
          const transitions = [
            "SUBMITTED",
            ...(state === "SUBMITTED" ? [] : ["IN_REVIEW"]),
            ...(["IN_REVIEW", "SUBMITTED"].includes(state)
              ? []
              : state === "APPROVED"
                ? ["VERIFIED", "APPROVED"]
                : [state]),
          ];
          let from = "DRAFT";
          for (const to of transitions) {
            await c.query(
              "insert into civic.review_events values($1,$2,$3,$4)",
              [
                randomUUID(),
                rid,
                vid,
                {
                  from,
                  to,
                  revisionId: vid,
                  actorId:
                    to === "SUBMITTED"
                      ? author.id
                      : to === "APPROVED"
                        ? admin.id
                        : meal.id,
                  reason: {
                    SUBMITTED: "Report received for review.",
                    IN_REVIEW:
                      "Review started. Check the location, observation and outstanding work.",
                    VERIFIED:
                      "The report contains enough detail for a monitoring decision.",
                    APPROVED:
                      "Approved for monitoring. Keep the outstanding work on the follow-up list.",
                    NEEDS_CLARIFICATION:
                      "Please state which part of the work was checked during your visit.",
                    REJECTED:
                      "The report needs clearer visit details before it can be accepted.",
                  }[to],
                  createdAt: r.firstSubmittedAt,
                },
              ],
            );
            from = to;
          }
          if (state === "NEEDS_CLARIFICATION") {
            await c.query("insert into civic.messages values($1,$2,$3)", [
              randomUUID(),
              rid,
              {
                text: "Please clarify what was visible during the visit.",
                visibility: "AUTHOR",
                createdAt: r.firstSubmittedAt,
                revisionId: vid,
              },
            ]);
          }
        }
      }
    if (secretFile) {
      try {
        await fs.mkdir(path.dirname(secretFile), { recursive: true, mode: 0o700 });
        await fs.writeFile(
          secretFile,
          JSON.stringify(
            { generatedAt: new Date().toISOString(), credentials },
            null,
            2,
          ),
          { mode: 0o600 },
        );
      } catch {}
    }
    await c.query("COMMIT");
    console.log(
      "Seeded 38 private accounts, 17 LGAs, 34 items and 102 fictional reports.",
    );
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  }
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  if (
    process.env.APP_MODE !== "evaluation" ||
    process.env.ALLOW_DEMO_SEED !== "true" ||
    (process.env.PGHOST && !process.env.PGHOST.startsWith("/"))
  )
    throw Error(
      "Seed requires APP_MODE=evaluation, ALLOW_DEMO_SEED=true and a private local database socket.",
    );
  const c = new pg.Client(connection("arewa_owner"));
  await c.connect();
  try {
    await seed(
      c,
      path.resolve(".secrets/demo-credentials.json"),
      process.env.DEMO_REFERENCE_DATE,
    );
  } finally {
    await c.end();
  }
}
