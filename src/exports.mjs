import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { deflateRawSync } from "node:zlib";
export const csvCell = (value) => {
  let s = String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ");
  if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
};
const columns = [
  "Report reference",
  "Reported by",
  "Item reference",
  "Type",
  "Title",
  "LGA",
  "Community",
  "Sector",
  "Observation date",
  "First submitted",
  "Revision number",
  "Review state",
  "Observed progress",
  "Confirmed progress",
  "Observation",
  "Evidence count",
];
export function exportRows(reports, refs) {
  return reports.map((r) => [
    r.reference,
    r.authorName,
    r.item.reference,
    r.item.type,
    r.item.title,
    refs.lgas.find((l) => l.id === r.item.lgaId)?.name,
    r.item.community,
    refs.sectors.find((s) => s.id === r.item.sectorId)?.label,
    r.revision.observedDate,
    r.firstSubmittedAt,
    r.revision.revisionNumber,
    r.reviewState,
    r.revision.observedProgress,
    r.item.confirmedProgress,
    r.revision.observation,
    r.evidenceCount,
  ]);
}
export const csvExport = (reports, refs) =>
  Buffer.from(
    "\ufeff" +
      [columns, ...exportRows(reports, refs)]
        .map((r) => r.map(csvCell).join(","))
        .join("\r\n"),
  );
function crc32(b) {
  let c = 0xffffffff;
  for (const n of b) {
    c ^= n;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function zip(files) {
  let offset = 0;
  const entries = [],
    central = [];
  for (const [name, txt] of Object.entries(files)) {
    const n = Buffer.from(name),
      b = Buffer.from(txt),
      compressed = deflateRawSync(b),
      crc = crc32(b),
      h = Buffer.alloc(30),
      c = Buffer.alloc(46);
    h.writeUInt32LE(0x04034b50);
    h.writeUInt16LE(20, 4);
    h.writeUInt16LE(8, 8);
    h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(compressed.length, 18);
    h.writeUInt32LE(b.length, 22);
    h.writeUInt16LE(n.length, 26);
    c.writeUInt32LE(0x02014b50);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt16LE(8, 10);
    c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(compressed.length, 20);
    c.writeUInt32LE(b.length, 24);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(offset, 42);
    entries.push(h, n, compressed);
    central.push(c, n);
    offset += h.length + n.length + compressed.length;
  }
  const cd = Buffer.concat(central),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...entries, cd, end]);
}
const xml = (x) =>
  String(x ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const sheet = (rows) =>
  `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((r) => `<row>${r.map((v) => `<c t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`;
export function xlsxExport(reports, refs, filters) {
  return zip({
    "[Content_Types].xml":
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels":
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml":
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Reports" sheetId="1" r:id="rId1"/><sheet name="Read me" sheetId="2" r:id="rId2"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels":
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": sheet([columns, ...exportRows(reports, refs)]),
    "xl/worksheets/sheet2.xml": sheet([
      ["Arewa Civic Tracker", "Evaluation data only; all records fictional."],
      [
        "Prepared by",
        "Kredit Technologies Limited; not an official RAWYOD deployment.",
      ],
      ["Generated", new Date().toISOString()],
      ["Filters", JSON.stringify(filters)],
      [
        "Definition",
        "Reports count distinct submitted observations; follow-ups do not create new monitored items.",
      ],
      [
        "Review",
        "Verification / approval is separate from confirmed item progress.",
      ],
      ["Cells", "Report content is exported as explicit text, never formulas."],
    ]),
  });
}
export async function pdfExport(d) {
  const pdf = await PDFDocument.create(),
    regular = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page, y;
  const ink = rgb(0.09, 0.17, 0.14),
    green = rgb(0.11, 0.35, 0.27);
  const clean = (s) => String(s).replace(/[^\x20-\x7e]/g, " ");
  const newPage = () => {
    page = pdf.addPage([595, 842]);
    y = 786;
    page.drawText("AREWA CIVIC TRACKER", {
      x: 42,
      y,
      font: bold,
      size: 12,
      color: green,
    });
    y -= 28;
  };
  const line = (s, size = 10, strong = false) => {
    if (y < 65) newPage();
    page.drawText(clean(s).slice(0, 110), {
      x: 42,
      y,
      font: strong ? bold : regular,
      size,
      color: ink,
    });
    y -= size + 10;
  };
  newPage();
  line("Monitoring summary", 25, true);
  line(
    "Evaluation only. All records are fictional. Not an official RAWYOD deployment.",
    9,
  );
  line("Prepared by Kredit Technologies Limited.", 9);
  line(
    "Generated " +
      new Date(d.refreshedAt).toLocaleString("en-GB", {
        timeZone: "Africa/Lagos",
      }) +
      " WAT",
    9,
  );
  line(
    "Date basis: " +
      (d.filters.dateBasis === "OBSERVED"
        ? "Observation date"
        : "First submission") +
      " | From: " +
      (d.filters.from || "all dates") +
      " | To: " +
      (d.filters.to || "today"),
    9,
  );
  for (const [key, value] of Object.entries(d.filters))
    if (value && !["page", "pageSize", "dateBasis", "from", "to"].includes(key))
      line(key + ": " + value, 9);
  y -= 10;
  for (const [label, key] of [
    ["Reports submitted", "reportsSubmitted"],
    ["Items tracked", "itemsTracked"],
    ["Verified / approved", "verified"],
    ["Pending review", "pending"],
    ["Rejected", "rejected"],
  ])
    line(label + ": " + d.counts[key], 12, true);
  for (const [title, rows] of [
    ["Reports by LGA", d.byLga],
    ["Reports by sector", d.bySector],
    ["Current confirmed item progress", d.progress],
  ]) {
    if (y < 65 + 35 + rows.length * 20) newPage();
    y -= 10;
    line(title, 14, true);
    for (const r of rows) line(r.label.replaceAll("_", " ") + "   " + r.value);
  }
  const pages = pdf.getPages();
  pages.forEach((p, i) =>
    p.drawText(`Synthetic evaluation | ${i + 1} / ${pages.length}`, {
      x: 42,
      y: 32,
      font: regular,
      size: 9,
      color: ink,
    }),
  );
  return Buffer.from(await pdf.save());
}

const label = (v) =>
  String(v ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
// One report as a printable PDF: details, revisions and decision history.
// Internal notes and account contact details are never included.
export async function reportPdf(r, refs, viewerName) {
  const pdf = await PDFDocument.create(),
    regular = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.09, 0.17, 0.14),
    green = rgb(0.11, 0.35, 0.27);
  const clean = (s) => String(s ?? "").replace(/[^\x20-\x7e]/g, " ");
  let page, y;
  const newPage = () => {
    page = pdf.addPage([595, 842]);
    y = 786;
    page.drawText("AREWA CIVIC TRACKER", { x: 42, y, font: bold, size: 12, color: green });
    y -= 28;
  };
  const wrap = (text, size, width = 510) => {
    const out = [];
    for (const para of clean(text).split(/\r?\n/)) {
      let cur = "";
      for (const word of para.split(" ")) {
        const t = cur ? cur + " " + word : word;
        if (regular.widthOfTextAtSize(t, size) > width && cur) {
          out.push(cur);
          cur = word;
        } else cur = t;
      }
      out.push(cur);
    }
    return out;
  };
  const line = (s, size = 10, strong = false) => {
    for (const part of wrap(s, size)) {
      if (y < 65) newPage();
      page.drawText(part, { x: 42, y, font: strong ? bold : regular, size, color: ink });
      y -= size + 5;
    }
  };
  const field = (k, v) => line(k + ": " + (v || "Not recorded"), 10);
  newPage();
  line("Field report " + r.reference, 20, true);
  y -= 6;
  line("Evaluation only. All records are fictional. Not an official RAWYOD deployment.", 9);
  line("Prepared by Kredit Technologies Limited.", 9);
  line(
    "Downloaded " +
      new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos" }) +
      " WAT" +
      (viewerName ? " by " + viewerName : ""),
    9,
  );
  y -= 10;
  line("Item", 13, true);
  field("Title", r.item.title);
  field("Item reference", r.item.reference);
  field("Type", label(r.item.type));
  field("Sector", refs.sectors.find((x) => x.id === r.item.sectorId)?.label);
  field("LGA", refs.lgas.find((x) => x.id === r.item.lgaId)?.name);
  field("Community", r.item.community);
  field("Location description", r.item.locationDescription);
  if (r.item.coordinates?.latitude != null)
    field("Coordinates", r.item.coordinates.latitude + ", " + r.item.coordinates.longitude);
  field("Confirmed item progress", label(r.item.confirmedProgress));
  y -= 10;
  line("Report", 13, true);
  field("Reported by", r.authorName);
  field("Observation date", r.revision.observedDate);
  field("First submitted", r.firstSubmittedAt);
  field("Current revision", r.revision.revisionNumber);
  field("Review status", label(r.reviewState));
  field("Observed progress", label(r.revision.observedProgress));
  field("Duty bearer / stakeholder", r.revision.stakeholder);
  field("Suggested next action", r.revision.suggestedAction);
  field("Photographs attached", (r.evidence || []).length);
  y -= 6;
  line("Observation", 11, true);
  line(r.revision.observation || "Not recorded", 10);
  if (r.revision.evidenceNote) {
    y -= 4;
    line("Supporting note", 11, true);
    line(r.revision.evidenceNote, 10);
  }
  if ((r.revisions || []).length > 1) {
    y -= 10;
    line("Revision history", 13, true);
    for (const v of r.revisions) {
      line("Revision " + v.revisionNumber + " - " + (v.submittedAt || ""), 10, true);
      line(v.observation, 9);
    }
  }
  if ((r.history || []).length) {
    y -= 10;
    line("Decision history", 13, true);
    for (const h of r.history)
      line(label(h.to) + " - " + (h.createdAt || "") + (h.reason ? ": " + h.reason : ""), 9);
  }
  const pages = pdf.getPages();
  pages.forEach((p, i) =>
    p.drawText("Synthetic evaluation | " + r.reference + " | " + (i + 1) + " / " + pages.length, {
      x: 42, y: 32, font: regular, size: 9, color: ink,
    }),
  );
  return Buffer.from(await pdf.save());
}
