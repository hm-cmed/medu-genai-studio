// 依存なしの最小Markdownレンダラー（見出し・表・箇条書き・番号リスト・コードブロック・太字・リンク）
// HTMLは最初にすべてエスケープするため、生成AIの出力にHTMLが含まれても実行されない。

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return t;
}

export function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // code block
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<div class="codewrap"><button class="copy-code" type="button">コピー</button><pre><code>${esc(buf.join('\n'))}</code></pre></div>`);
      continue;
    }
    // table
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const split = r => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const head = split(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(split(lines[i])); i++; }
      out.push('<div class="tablewrap"><table><thead><tr>' + head.map(h => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    // heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const lv = Math.min(h[1].length + 1, 5); out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); i++; continue; }
    // lists
    if (/^\s*[-*・]\s+/.test(line) || /^\s*\d+[.)．]\s+/.test(line)) {
      const ordered = /^\s*\d+[.)．]\s+/.test(line);
      const items = [];
      while (i < lines.length && (ordered ? /^\s*\d+[.)．]\s+/.test(lines[i]) : /^\s*[-*・]\s+/.test(lines[i]))) {
        items.push(lines[i].replace(ordered ? /^\s*\d+[.)．]\s+/ : /^\s*[-*・]\s+/, ''));
        i++;
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>` + items.map(t => `<li>${inline(t)}</li>`).join('') + `</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }
    // paragraph
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^```|^#{1,4}\s|^\s*\|/.test(lines[i]) && !/^\s*[-*・]\s+|^\s*\d+[.)．]\s+/.test(lines[i])) { buf.push(inline(lines[i])); i++; }
    out.push(`<p>${buf.join('<br>')}</p>`);
  }
  return out.join('\n');
}
