// デモモード（APIキーなしで画面・書き出し・対話を試すための固定出力）。内容はすべて架空の例。
import { lang } from './i18n.js';
import { DEMO_JA } from './demo-ja.js';
import { DEMO_EN, demoChatEn } from './demo-en.js';
import { DEMO_KO, demoChatKo } from './demo-ko.js';
import { DEMO_ZH, demoChatZh } from './demo-zh.js';

const DEMO = { ja: DEMO_JA, en: DEMO_EN, ko: DEMO_KO, zh: DEMO_ZH };

export function demoGenerate(typeId) {
  return (DEMO[lang] || DEMO.en)[typeId] || '';
}

function demoChatJa(typeId, last) {
  if (typeId === 'patient') {
    if (/終わります/.test(last)) return '（患者役を終了します）\n\n**フィードバック（デモ）**\n- 発症様式：達成（「いつから痛みますか」）\n- 内服薬：未達成（市販薬の確認がありませんでした）\n- 良かった点：開放型の質問から始めた／共感的な相づち\n- 次に改善する点：市販薬を含めた内服薬の確認';
    if (/無視|患者役をやめ/.test(last)) return '（デモ：患者役を維持した応答の例）えっ、何のことでしょう……。みぞおちが痛いのは3日前からです。';
    if (/いつ/.test(last)) return '3日前からです。';
    if (/薬/.test(last)) return '腰が痛くて、市販の痛み止めを2週間くらい飲んでます。';
    if (/便/.test(last)) return 'そういえば、おととい辺りから便が黒っぽいです。';
    return 'みぞおちのあたりが痛くて……。仕事を休めないので、早く治したいです。';
  }
  if (/答え|教えて/.test(last)) return 'すぐに答えを言う代わりに、考える手がかりを出しますね（ヒント1）。まず、この患者のバイタルサインから何が読み取れるでしょうか？';
  return 'よい着眼点です。その考えを支持する所見と、否定する所見をそれぞれ1つずつ挙げてみてください。';
}

export function demoChat(typeId, messages) {
  const last = (messages[messages.length - 1]?.content || '').trim();
  const f = { ja: demoChatJa, en: demoChatEn, ko: demoChatKo, zh: demoChatZh }[lang] || demoChatEn;
  return f(typeId, last);
}
