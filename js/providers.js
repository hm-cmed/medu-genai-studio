// LLM プロバイダへの呼び出し（ブラウザから直接。APIキーは利用者のもの）
import { demoGenerate, demoChat } from './demo.js';
import { t } from './i18n.js';

export const PROVIDERS = {
  demo: { labelKey: 'prov_demo', model: 'demo', keyUrl: '' },
  gemini: { labelKey: 'prov_gemini', model: 'gemini-2.5-flash', keyUrl: 'https://aistudio.google.com/apikey' },
  anthropic: { labelKey: 'prov_anthropic', model: 'claude-sonnet-5', keyUrl: 'https://console.anthropic.com/' },
  openai: { labelKey: 'prov_openai', model: 'gpt-4.1-mini', keyUrl: 'https://platform.openai.com/api-keys' }
};

// messages: [{role:'user'|'assistant', content:string}]
export async function callLLM({ provider, model, apiKey, system, messages, json = false, temperature = 0.4, typeId, mode = 'generate' }) {
  if (provider === 'demo') {
    await new Promise(r => setTimeout(r, 400));
    return mode === 'chat' ? demoChat(typeId, messages) : demoGenerate(typeId);
  }
  if (!apiKey) throw new Error(t('err_nokey'));
  if (provider === 'gemini') return gemini({ model, apiKey, system, messages, json, temperature });
  if (provider === 'anthropic') return anthropic({ model, apiKey, system, messages, temperature });
  if (provider === 'openai') return openai({ model, apiKey, system, messages, json, temperature });
  throw new Error('Unknown provider: ' + provider);
}

async function readError(res) {
  let body = '';
  try { body = await res.text(); } catch (e) { /* ignore */ }
  return new Error(t('err_api', { s: res.status }) + body.slice(0, 400));
}

async function gemini({ model, apiKey, system, messages, json, temperature }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    generationConfig: { temperature, ...(json ? { responseMimeType: 'application/json' } : {}) }
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body) });
  if (!res.ok) throw await readError(res);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  if (!text) throw new Error(t('err_empty'));
  return text;
}

async function anthropic({ model, apiKey, system, messages, temperature }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model, max_tokens: 8000, temperature, system, messages })
  });
  if (!res.ok) throw await readError(res);
  const data = await res.json();
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

async function openai({ model, apiKey, system, messages, json, temperature }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    body: JSON.stringify({
      model, temperature,
      messages: [{ role: 'system', content: system }, ...messages],
      ...(json ? { response_format: { type: 'json_object' } } : {})
    })
  });
  if (!res.ok) throw await readError(res);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

// モデルが ```json ... ``` で囲んだ場合なども含めてJSONを取り出す
export function parseJSONLoose(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(t); } catch (e) { /* fallthrough */ }
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s >= 0 && e > s) return JSON.parse(t.slice(s, e + 1));
  throw new Error(t('err_json'));
}
