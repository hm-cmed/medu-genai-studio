// 「使い方と注意」「ライセンスとクレジット」の本文（4言語）

export const GUIDE = {
  ja: `# 使い方と注意

## 基本の流れ
1. 右上の「設定」で使うAIを選び、APIキーを入力する（試すだけならデモのまま）
2. 左のメニューからコンテンツを選び、フォームに入力して「生成する」
3. 出力を確認し、Markdown・JSON・GIFT（Moodle）・CSV で書き出す
4. AI模擬患者とチューターは「この指示で試す」で、その場で対話を試せる
5. 公開前チェックリストを確認してから授業で使う

## 表示言語
- 右上の言語ボタン（日本語／English／한국어／中文）で切り替えられます。生成されるコンテンツも選んだ言語で作られます
- URLの末尾に \`?lang=en\` \`?lang=ko\` \`?lang=zh\` を付けると、その言語で開きます

## APIキーについて
- **Google Gemini**：Google AI Studio で APIキーを発行できます。無料枠の条件は Google の最新の案内を確認してください
- **Anthropic／OpenAI**：各社のコンソールで発行します
- APIキーはこのブラウザから各社のAPIに直接送られます。このアプリの作者や GitHub には送られません
- 学生に配布する場合、教員のAPIキーを埋め込んで公開しないでください

## 入力してはいけないもの
- 実在の患者の情報（架空化したものでも、特定につながる情報は入れない）
- 学生の氏名・成績などの個人情報
- 権利関係を確認していない教科書・ガイドラインの本文

## このアプリの位置づけ
- 生成物は教員が確認・修正する前提の「たたき台」です
- 総括的評価（成績・合否）をAIの判定だけで決めないでください`,

  en: `# How to use

## Basic workflow
1. Open **Settings** (top right), choose an AI provider and enter an API key (or stay in Demo)
2. Choose a resource from the menu, fill in the form and click **Generate**
3. Review the output and export it as Markdown, JSON, GIFT (Moodle) or CSV
4. For the simulated patient and the tutor, click **Try this instruction** to chat with it immediately
5. Go through the pre-release checklist before using anything in class

## Language
- Switch with the language buttons at the top right (日本語 / English / 한국어 / 中文). Generated content is produced in the selected language
- Add \`?lang=en\`, \`?lang=ko\` or \`?lang=zh\` to the URL to open the site in that language

## About API keys
- **Google Gemini**: create a key in Google AI Studio; check Google’s current terms for any free tier
- **Anthropic / OpenAI**: create a key in each provider’s console
- Your key goes directly from this browser to the provider, never to the app’s authors or to GitHub
- Never publish a version with a faculty API key embedded for students to use

## Never enter
- Real patient information (even de-identified data that could identify someone)
- Student names, grades or other personal data
- Textbook or guideline text whose rights you have not checked

## What this app is
- Everything generated is a first draft for faculty to review and revise
- Never make summative decisions (grades, pass/fail) on AI judgments alone`,

  ko: `# 사용법과 주의

## 기본 흐름
1. 오른쪽 위 **설정**에서 사용할 AI를 고르고 API 키를 입력한다(시험만 할 때는 데모 그대로)
2. 메뉴에서 콘텐츠를 고르고 양식을 채운 뒤 **생성하기**
3. 출력을 확인하고 Markdown·JSON·GIFT(Moodle)·CSV로 내보낸다
4. AI 모의환자와 튜터는 **이 지시문으로 시험하기**로 바로 대화해 볼 수 있다
5. 공개 전 체크리스트를 확인한 뒤 수업에 사용한다

## 표시 언어
- 오른쪽 위 언어 버튼(日本語 / English / 한국어 / 中文)으로 바꿀 수 있습니다. 생성되는 콘텐츠도 선택한 언어로 만들어집니다
- URL 끝에 \`?lang=ko\` 등을 붙이면 해당 언어로 열립니다

## API 키
- **Google Gemini**: Google AI Studio에서 발급합니다. 무료 사용 조건은 Google의 최신 안내를 확인하십시오
- **Anthropic / OpenAI**: 각 회사 콘솔에서 발급합니다
- API 키는 이 브라우저에서 각 회사 API로 직접 전송되며, 앱 제작자나 GitHub로는 전송되지 않습니다
- 학생용으로 배포할 때 교수자의 API 키를 넣은 채 공개하지 마십시오

## 입력하면 안 되는 것
- 실제 환자 정보(비식별화했더라도 특정 가능한 정보)
- 학생 이름·성적 등 개인정보
- 권리 관계를 확인하지 않은 교과서·가이드라인 본문

## 이 앱의 위치
- 생성물은 교수자가 검토·수정하는 것을 전제로 한 초안입니다
- 총괄평가(성적·합격 여부)를 AI 판정만으로 결정하지 마십시오`,

  zh: `# 使用说明与注意事项

## 基本流程
1. 在右上角**设置**中选择AI并输入API密钥（仅试用时保持演示模式即可）
2. 从菜单选择内容类型，填写表单后点击**生成**
3. 审核输出，并导出为 Markdown、JSON、GIFT（Moodle）或 CSV
4. AI模拟患者和辅导员可通过**用此指令试用**立即对话
5. 在课堂使用前完成发布前检查清单

## 显示语言
- 可通过右上角的语言按钮（日本語 / English / 한국어 / 中文）切换，生成的内容也将使用所选语言
- 在网址末尾加上 \`?lang=zh\` 等即可直接以该语言打开

## 关于API密钥
- **Google Gemini**：可在 Google AI Studio 获取密钥，免费额度请查看 Google 的最新说明
- **Anthropic / OpenAI**：在各公司控制台获取
- 密钥由本浏览器直接发送至各公司的API，不会发送给本应用作者或GitHub
- 面向学生发布时，切勿嵌入教师的API密钥

## 请勿输入
- 真实患者信息（即使已去标识化，也不得包含可识别个人的信息）
- 学生姓名、成绩等个人信息
- 未确认权利的教材或指南原文

## 本应用的定位
- 生成内容为初稿，须经教师审核修改
- 不得仅凭AI判定作出总结性评价（成绩、是否通过）`
};

export const CREDITS_TEXT = {
  h1: { ja: 'ライセンスとクレジット', en: 'License & credits', ko: '라이선스와 출처', zh: '许可与署名' },
  site_h: { ja: 'このサイトのライセンス', en: 'License of this site', ko: '이 사이트의 라이선스', zh: '本站许可' },
  site_p: {
    ja: 'このサイトのコンテンツ（画面の文章、生成用プロンプトの型、デモ出力、翻訳・改変した公開サンプル）は、クリエイティブ・コモンズ 表示 4.0 国際（CC BY 4.0）で公開しています。取り込んだ公開サンプルの元の作品がいずれも CC BY 4.0 であるため、同じライセンスで公開し、元の作品のクレジットを引き継いでいます。再利用する場合は、このサイトのクレジットに加えて、下に挙げる元の作品のクレジットも必ず表示してください。',
    en: 'The content of this site (interface text, prompt templates, demo outputs, and the translated/adapted open samples) is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0). Because every incorporated work is itself licensed under CC BY 4.0, we release our adaptations under the same license and carry their attribution forward. If you reuse this content, credit this site and also keep the attributions for the original works listed below.',
    ko: '이 사이트의 콘텐츠(화면 문구, 생성용 프롬프트 틀, 데모 출력, 번역·변경한 공개 샘플)는 크리에이티브 커먼즈 저작자표시 4.0 국제(CC BY 4.0)로 공개합니다. 포함한 공개 샘플의 원저작물이 모두 CC BY 4.0이므로 같은 라이선스로 공개하며 원저작물의 출처 표시를 이어받습니다. 재사용할 때는 이 사이트의 출처와 함께 아래 원저작물의 출처도 반드시 표시하십시오.',
    zh: '本站内容（界面文字、生成用提示词模板、演示输出以及翻译/改编的公开示例）采用知识共享 署名 4.0 国际许可协议（CC BY 4.0）发布。由于所纳入示例的原作品均采用 CC BY 4.0，我们以相同许可发布改编内容，并延续原作品的署名。再利用时，除本站署名外，还须保留下列原作品的署名。'
  },
  site_attr_h: { ja: 'このサイトを再利用するときの表示例', en: 'Suggested attribution for this site', ko: '이 사이트를 재사용할 때의 표시 예', zh: '再利用本站时的署名示例' },
  site_attr: {
    ja: '「医学教育 生成AIコンテンツ工房」（{url}）、CC BY 4.0。CC BY 4.0 の論文付録（Holderried ほか 2024、Liu ほか 2025、Harada 2026）の翻訳・改変を含む。',
    en: '“MedEd GenAI Content Studio” ({url}), CC BY 4.0. Includes translations/adaptations of CC BY 4.0 article appendices (Holderried et al. 2024; Liu et al. 2025; Harada 2026).',
    ko: '「의학교육 생성형 AI 콘텐츠 공방」({url}), CC BY 4.0. CC BY 4.0 논문 부록(Holderried 외 2024, Liu 외 2025, Harada 2026)의 번역·변경을 포함.',
    zh: '“医学教育生成式AI内容工坊”（{url}），CC BY 4.0。含对以 CC BY 4.0 发布的论文附录（Holderried 等 2024；Liu 等 2025；Harada 2026）的翻译与改编。'
  },
  code_p: {
    ja: 'プログラムのソースコードは MIT License です（リポジトリの LICENSE）。コンテンツのライセンス全文はリポジトリの LICENSE-CONTENT に記載しています。',
    en: 'The source code is released under the MIT License (see LICENSE in the repository). The full content license notice is in LICENSE-CONTENT.',
    ko: '프로그램 소스 코드는 MIT License입니다(저장소의 LICENSE). 콘텐츠 라이선스 전문은 저장소의 LICENSE-CONTENT에 있습니다.',
    zh: '程序源代码采用 MIT 许可（见仓库中的 LICENSE）。内容许可全文见 LICENSE-CONTENT。'
  },
  incorporated_h: { ja: '翻訳・改変して取り込んだ作品（CC BY 4.0）', en: 'Works translated/adapted and incorporated (CC BY 4.0)', ko: '번역·변경해 포함한 저작물(CC BY 4.0)', zh: '经翻译/改编后纳入的作品（CC BY 4.0）' },
  lbl_title: { ja: 'タイトル', en: 'Title', ko: '제목', zh: '标题' },
  lbl_authors: { ja: '著者', en: 'Authors', ko: '저자', zh: '作者' },
  lbl_source: { ja: '出典', en: 'Source', ko: '출처', zh: '出处' },
  lbl_license: { ja: 'ライセンス', en: 'License', ko: '라이선스', zh: '许可' },
  lbl_used: { ja: '使用した部分', en: 'Parts used', ko: '사용한 부분', zh: '使用部分' },
  lbl_changes: { ja: '変更点', en: 'Changes', ko: '변경 사항', zh: '修改说明' },
  referenced_h: { ja: '参照・リンクのみの資料（このサイトのライセンスの対象外）', en: 'Referenced or linked only (not covered by this site’s license)', ko: '참조·링크만 한 자료(이 사이트 라이선스 대상 아님)', zh: '仅引用或链接的资料（不受本站许可覆盖）' },
  disclaimer: {
    ja: '元の作品の著者は、このサイトやその利用を推奨・保証するものではありません。翻訳・要約の誤りの責任はこのサイトにあります。',
    en: 'The original authors do not endorse this site or its use. Any errors in translation or summarization are ours.',
    ko: '원저작물의 저자는 이 사이트나 그 이용을 추천·보증하지 않습니다. 번역·요약의 오류에 대한 책임은 이 사이트에 있습니다.',
    zh: '原作者并不认可或担保本站及其使用。翻译或摘要中的任何错误由本站负责。'
  }
};
