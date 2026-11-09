import type { Flashcard, Subject } from "@/types";

function stripMarkdown(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^-\s?/gm, "• ");
}

function buildText(card: Flashcard, subject: Subject) {
  const line = "=".repeat(52);
  const thin = "-".repeat(52);
  const date = new Date(card.createdAt).toLocaleDateString("fr-FR");

  let out = `${line}\n`;
  out += `  RÉVIS'STI2D — FICHE DE RÉVISION\n`;
  out += `${line}\n\n`;
  out += `MATIÈRE : ${subject.name} (${subject.short})\n`;
  out += `TITRE   : ${card.title}\n`;
  out += `DATE    : ${date}\n`;
  out += `${thin}\n\n`;
  out += `${stripMarkdown(card.summary)}\n\n`;

  if (card.attachment) {
    out += `${thin}\n`;
    out += `DOCUMENT JOINT : ${card.attachment.name}\n`;
    out += `${thin}\n\n`;
  }

  out += `${line}\n`;
  out += `Bon courage pour tes révisions !\n`;
  out += `${line}\n`;

  return out;
}

function safeName(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  return base || "fiche_revision";
}

export function downloadTxt(card: Flashcard, subject: Subject) {
  const text = buildText(card, subject);
  const blob = new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName(card.title)}.txt`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function summaryToHtml(text: string) {
  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return "<div style='height:8px'></div>";
      if (line.startsWith("> ")) {
        return `<div class="formula">${escapeHtml(line.slice(2))}</div>`;
      }
      if (line.startsWith("- ")) {
        return `<li>${escapeHtml(line.slice(2)).replace(
          /\*\*([^*]+)\*\*/g,
          "<strong>$1</strong>"
        )}</li>`;
      }
      return `<p>${escapeHtml(line).replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      )}</p>`;
    })
    .join("");
}

function buildHtml(card: Flashcard, subject: Subject) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(card.title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; }
  .badge { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; }
  h1 { font-size: 24px; margin: 16px 0 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
  p { font-size: 14px; line-height: 1.6; margin: 4px 0; }
  li { font-size: 14px; line-height: 1.6; margin: 4px 0; }
  strong { color: #0f172a; }
  .formula { border-left: 4px solid #10b981; background: #ecfdf5; color: #065f46; font-family: ui-monospace, Menlo, monospace; font-size: 13px; padding: 8px 14px; margin: 8px 0; border-radius: 6px; }
  .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; color: #94a3b8; font-size: 11px; }
  .toolbar { position: fixed; top: 16px; right: 16px; display: flex; gap: 8px; }
  .toolbar button { font: inherit; font-size: 13px; font-weight: 600; border: 1px solid #10b981; background: #10b981; color: #fff; padding: 10px 16px; border-radius: 10px; cursor: pointer; }
  .toolbar button.ghost { background: #fff; color: #047857; }
  @media print { body { padding: 0; } .toolbar { display: none; } }
</style></head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
    <button class="ghost" onclick="window.close()">Fermer</button>
  </div>
  <span class="badge">${escapeHtml(subject.short)} — ${escapeHtml(subject.name)}</span>
  <h1>${escapeHtml(card.title)}</h1>
  <div class="meta">Fiche générée le ${new Date(card.createdAt).toLocaleDateString(
    "fr-FR"
  )} · Révis'STI2D</div>
  <div>${summaryToHtml(card.summary)}</div>
  <div class="footer">Révis'STI2D — fiche de révision personnelle</div>
</body></html>`;
}

export function downloadPdf(card: Flashcard, subject: Subject) {
  const html = buildHtml(card, subject);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const win = window.open(url, "_blank");

  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName(card.title)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}