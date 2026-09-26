// 書き出し：Markdown／JSON／Moodle GIFT／CSV
import { t } from './i18n.js';

export function download(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

const L = ['A', 'B', 'C', 'D', 'E', 'F'];

export function mcqToMarkdown(items) {
  return items.map((q, n) => {
    const opts = q.options.map((o, i) => `${L[i]}. ${o}`).join('\n');
    const why = (q.distractors || []).map((d, i) => `- ${L[i]}: ${d}`).join('\n');
    return `### ${t('mcq_q', { n: n + 1 })}\n${q.stem}\n\n${opts}\n\n**${t('mcq_answer')}: ${L[q.answer]}**\n\n**${t('mcq_rationale')}:** ${q.rationale || ''}\n\n**${t('mcq_each')}**\n${why}\n\n**${t('mcq_objective')}:** ${q.objective || ''}\n\n**${t('mcq_source')}:** ${q.source || ''}`;
  }).join('\n\n---\n\n');
}

function giftEsc(s) {
  return String(s ?? '').replace(/([~=#{}:\\])/g, '\\$1').replace(/\n/g, ' ');
}

export function mcqToGIFT(items, title = 'Q') {
  return items.map((q, n) => {
    const body = q.options.map((o, i) => {
      const fb = q.distractors && q.distractors[i] ? '#' + giftEsc(q.distractors[i]) : '';
      return `\t${i === q.answer ? '=' : '~'}${giftEsc(o)}${fb}`;
    }).join('\n');
    const gfb = q.rationale ? `\n\t####${giftEsc(q.rationale)}` : '';
    return `::${giftEsc(title)}-${n + 1}:: ${giftEsc(q.stem)} {\n${body}${gfb}\n}`;
  }).join('\n\n') + '\n';
}

function csvCell(s) {
  const t = String(s ?? '');
  return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}

export function mcqToCSV(items) {
  const max = Math.max(...items.map(q => q.options.length));
  const hd = t('csv_head');
  const head = [hd[0], hd[1], ...L.slice(0, max).map(x => hd[2] + ' ' + x), hd[3], hd[4], hd[5], hd[6]];
  const rows = items.map((q, n) => [n + 1, q.stem, ...Array.from({ length: max }, (_, i) => q.options[i] || ''), L[q.answer], q.rationale, q.objective, q.source]);
  // Excelで文字化けしないようBOMを付ける
  return '﻿' + [head, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
}

export function validateMCQ(data) {
  if (!data || !Array.isArray(data.items) || !data.items.length) throw new Error(t('err_items'));
  data.items.forEach((q, i) => {
    if (typeof q.stem !== 'string' || !Array.isArray(q.options) || q.options.length < 2) throw new Error(t('err_item', { n: i + 1 }));
    q.answer = Number(q.answer);
    if (!(q.answer >= 0 && q.answer < q.options.length)) throw new Error(t('err_answer', { n: i + 1 }));
  });
  return data.items;
}
