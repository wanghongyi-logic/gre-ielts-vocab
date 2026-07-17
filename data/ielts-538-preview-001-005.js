// IELTS 538 pilot: the first five rows from the workbook's “App导入词条” sheet.
// This module is intentionally not registered in the existing GRE app yet.

const example = (en, zh) => ({ en, zh });

const phrase = (en, zh, exampleEn, exampleZh) => ({
  en,
  zh,
  example: example(exampleEn, exampleZh),
});

const contrast = (word, ipa, pos, meaningZh, boundaryZh, exampleEn, exampleZh, sourceCandidate = true) => ({
  word,
  ipa,
  pos,
  meaningZh,
  boundaryZh,
  sourceCandidate,
  example: example(exampleEn, exampleZh),
});

const evidence = ({
  textEn,
  textZh,
  sourceType,
  sourceTitle,
  sourceUrl,
  section,
  verbatim,
  noteZh,
}) => ({ textEn, textZh, sourceType, sourceTitle, sourceUrl, section, verbatim, noteZh });

const entry = (config) => config;

export const ielts538Preview001To005 = [
  entry({
    source: {
      appId: 1,
      entryType: "primary",
      category: 1,
      categoryIndex: 1,
      importanceRank: 1,
      wordOrPhrase: "resemble",
      posSource: "v.",
      meaningZhSource: "v.像，与……相似",
      linkedPrimaryWord: null,
      sourceQuestionMethodRaw: "like, look, like, be similar to",
      sourcePage: 1,
      importNote: "PDF主词条；中文释义按原文保留",
    },
    word: "resemble",
    ipa: "/rɪˈzem.bəl/",
    pos: "transitive verb",
    register: "中性；学术阅读和口语均常见",
    coreEn: "to be similar to a person or thing in appearance, character, structure, or another noticeable quality",
    coreZh: "在外观、性质、结构或特征上像某人或某物",
    imageZh: "把两个对象并排放置，相似轮廓自动重合，但它们仍不是同一个东西。",
    grammarZh: "及物动词，直接接宾语：A resembles B。不能说 resemble to，也通常不用进行时。",
    senses: [
      {
        label: "APPEARANCE / CHARACTER",
        titleZh: "外观或特征相似",
        explanationZh: "强调两个独立对象共享明显特征；可以是长相，也可以是行为、结构或模式。",
        collocations: [
          phrase("closely resemble", "非常相像", "The two species closely resemble each other in size and colour.", "这两个物种在体形和颜色上非常相像。"),
          phrase("resemble a parent", "长得或性格像父母", "Maya resembles her mother in both appearance and temperament.", "玛雅的外貌和性情都像她母亲。"),
          phrase("resemble the original", "与原物相似", "The reconstruction resembles the original building but uses modern materials.", "重建建筑与原建筑相似，但采用了现代材料。"),
        ],
      },
    ],
    sourceMethodAudit: {
      type: "synonym_candidate_pool",
      normalizedCandidates: ["like", "look like", "be similar to"],
      noteZh: "原表有重复的 like，并把 look 与 like 分开；这里规范为 look like。候选词只在部分语境近义，不能机械互换。",
    },
    synonymContrasts: [
      contrast("be similar to", "/biː ˈsɪm.ɪ.lə tə/", "adjective phrase", "与……相似", "范围最宽，可比较观点、数字、方法和物体；resemble 更紧凑，常突出可观察到的整体相似。", "The second method is similar to the first in cost.", "第二种方法在成本方面与第一种相似。"),
      contrast("look like", "/lʊk laɪk/", "verb phrase", "看起来像", "更口语，主要根据外观或眼前迹象判断；resemble 可描述长期特征和抽象结构。", "The cloud looks like a bird.", "那朵云看起来像一只鸟。"),
      contrast("like", "/laɪk/", "preposition", "像；与……相似", "like 是介词，后接名词；resemble 是动词，句法位置不同。", "This fabric feels like silk.", "这种布料摸起来像丝绸。"),
    ],
    morphology: {
      originZh: "经古法语 resembler 进入英语，最终与拉丁语 simul（相似、同一）词族相关。",
      wordFamily: ["resemblance", "resembling"],
      soundHookZh: "声音联想（非词源）：resemble 像“重新 assemble”；把两幅图重新拼在一起，轮廓很像。",
      trapZh: "刹车：resemble 后面没有 to；说 A resembles B，不说 A resembles to B。",
    },
    memory: {
      sceneZh: "两座不同城市把天际线叠在一起，楼顶几乎重合。",
      semanticLandingZh: "共享明显特征，但不等于完全相同。",
      microEn: "The new bridge resembles a silver wave.",
      microZh: "新桥像一道银色波浪。",
    },
    ieltsEvidence: [
      evidence({
        textEn: "All of our practice materials now resemble the IELTS on computer test.",
        textZh: "我们现在所有的练习材料都与机考雅思相似。",
        sourceType: "official_exam_preparation",
        sourceTitle: "English Teacher Jay Does IELTS on Computer — IDP IELTS",
        sourceUrl: "https://ielts.idp.com/prepare/article-english-teacher-jay-does-computer-delivered-ielts",
        section: "Teacher interview",
        verbatim: true,
        noteZh: "IDP官方备考文章原句；不是公开真题原文。",
      }),
      evidence({
        textEn: "The pagoda was designed to resemble a lotus blooming from a pond.",
        textZh: "这座塔被设计成一朵从池塘中盛开的莲花。",
        sourceType: "official_exam_preparation",
        sourceTitle: "Describe a historical building — IDP IELTS",
        sourceUrl: "https://ielts.idp.com/vietnam/about/news-and-articles/article-describe-a-historical-building-you-have-been-to/en-gb",
        section: "IELTS Speaking Part 2 sample answer",
        verbatim: true,
        noteZh: "IDP官方口语示范答案原句；不是公开考场原题文本。",
      }),
    ],
    recall: {
      promptEn: "Complete the rule: A ___ B, with no preposition.",
      promptZh: "补全规则：A ___ B，中间不用介词。",
      answerEn: "A resembles B.",
      answerZh: "A resembles B，表示A在特征上像B。",
    },
    checks: [
      {
        type: "context",
        promptEn: "The newly discovered moon ________ a potato in shape.",
        promptZh: "这颗新发现的卫星形状像土豆。",
        options: ["resembles", "recognizes", "perceives", "acknowledges"],
        answer: 0,
        explanationZh: "直接接比较对象并描述外形相似，用 resembles。",
      },
    ],
  }),

  entry({
    source: {
      appId: 2,
      entryType: "highlighted_substitute",
      category: 1,
      categoryIndex: 1,
      importanceRank: 1,
      wordOrPhrase: "similar to",
      posSource: null,
      meaningZhSource: null,
      linkedPrimaryWord: "resemble",
      sourceQuestionMethodRaw: "like, look, like, be similar to",
      sourcePage: 1,
      importNote: "PDF红色高亮替换表达；未臆造独立中文释义",
    },
    word: "similar to",
    ipa: "/ˈsɪm.ɪ.lə tə/",
    pos: "adjective phrase",
    register: "中性；学术比较中的高频表达",
    coreEn: "sharing important characteristics with someone or something, while not being identical",
    coreZh: "与某人或某物具有重要共同特征，但并非完全相同",
    imageZh: "两个圆大面积重叠，却仍各自保留一块不同区域。",
    grammarZh: "similar 是形容词；比较对象前通常用 to，不用 with：A is similar to B。可说 similar in size/design。",
    senses: [
      {
        label: "COMPARISON",
        titleZh: "指出共同特征",
        explanationZh: "适合比较方法、趋势、观点、结构、外形和经历，是雅思写作与阅读中的基础改写表达。",
        collocations: [
          phrase("be similar to", "与……相似", "The employment pattern is similar to that observed a decade earlier.", "这一就业模式与十年前观察到的模式相似。"),
          phrase("broadly similar to", "大体相似", "The two surveys produced broadly similar results.", "两项调查得出了大体相似的结果。"),
          phrase("similar in size or function", "在尺寸或功能上相似", "The devices are similar in function but differ in price.", "这些设备功能相似，但价格不同。"),
        ],
      },
    ],
    sourceMethodAudit: {
      type: "synonym_candidate_pool",
      normalizedCandidates: ["resemble", "like", "look like"],
      noteZh: "linked_primary_word 指向 resemble。原始候选中 be similar to 就是本词条自身，不能作为独立近义卡重复展示。",
    },
    synonymContrasts: [
      contrast("resemble", "/rɪˈzem.bəl/", "transitive verb", "像；与……相似", "resemble 是动词，直接接宾语；similar to 是形容词结构，需要 be/seem/remain 等系动词。", "The new model resembles its predecessor.", "新型号与上一代很相像。"),
      contrast("like", "/laɪk/", "preposition", "像", "like 更短、更口语；similar to 更明确表示比较关系，也更适合正式分析。", "Like the earlier study, this survey used interviews.", "与早期研究一样，本调查采用了访谈。"),
      contrast("look like", "/lʊk laɪk/", "verb phrase", "看起来像", "look like 偏视觉或基于迹象的判断；similar to 可比较不可见的功能、观点和数据。", "The graph looks like an inverted U.", "这张图看起来像一个倒U形。"),
    ],
    morphology: {
      originZh: "similar 来自拉丁语 similis（相似的）；to 标记比较对象。",
      wordFamily: ["similar", "similarity", "similarly", "dissimilar"],
      soundHookZh: "熟词桥：similarity 是“相似性”，similar to 就是“与……具有相似性”。",
      trapZh: "刹车：standard English 用 similar to，不用 similar with；similar 不表示 identical。",
    },
    memory: {
      sceneZh: "两份折线图走势几乎重合，但终点数值不同。",
      semanticLandingZh: "相似而非相同；必须说明比较对象或相似维度。",
      microEn: "The patterns are similar to each other, but not identical.",
      microZh: "这些模式彼此相似，但并不完全相同。",
    },
    ieltsEvidence: [
      evidence({
        textEn: "The rocket was placed in a similar position to other rocket-propelled arrows.",
        textZh: "这枚火箭被放置在与其他火箭推进箭矢相似的位置。",
        sourceType: "official_practice_test",
        sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
        sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
        section: "Matching Features — development of rockets",
        verbatim: false,
        noteZh: "根据官方样题原句压缩改写，保留 similar ... to 的真实语境；原文更长。",
      }),
      evidence({
        textEn: "Similar to the Listening test, you need to spell answers correctly.",
        textZh: "与听力考试类似，你需要正确拼写答案。",
        sourceType: "official_exam_preparation",
        sourceTitle: "How to get IELTS Band 4.5 — IDP IELTS",
        sourceUrl: "https://ielts.idp.com/prepare/article-how-do-you-get-an-ielts-band-4-5-for-functional-english",
        section: "Reading advice",
        verbatim: true,
        noteZh: "IDP官方备考文章原句。",
      }),
    ],
    recall: {
      promptEn: "Which preposition normally follows similar?",
      promptZh: "similar 后通常接哪个介词？",
      answerEn: "to: A is similar to B.",
      answerZh: "接 to：A is similar to B。",
    },
    checks: [
      {
        type: "contrast",
        promptEn: "Which sentence is standard English?",
        promptZh: "哪一句符合标准英语？",
        options: ["The results are similar to ours.", "The results similar ours.", "The results are similar with ours.", "The results resemble to ours."],
        answer: 0,
        explanationZh: "similar 通常与 to 搭配；resemble 则直接接宾语。",
      },
    ],
  }),

  entry({
    source: {
      appId: 3,
      entryType: "primary",
      category: 1,
      categoryIndex: 2,
      importanceRank: 2,
      wordOrPhrase: "recognize",
      posSource: "v.",
      meaningZhSource: "v.认出，识别；承认",
      linkedPrimaryWord: null,
      sourceQuestionMethodRaw: "perceive, acknowledge, realize, appreciate, admit, identify, comprehend, understand know",
      sourcePage: 1,
      importNote: "PDF主词条；中文释义按原文保留",
    },
    word: "recognize",
    displayVariants: ["recognize", "recognise"],
    ipa: "/ˈrek.əɡ.naɪz/",
    pos: "transitive verb",
    register: "中性；美式拼写 recognize，英式拼写 recognise",
    coreEn: "to identify someone or something from previous knowledge; or to accept that something exists, is true, valid, or important",
    coreZh: "凭已有知识认出；或正式承认某事实、地位、价值或重要性",
    imageZh: "记忆库里的旧照片与眼前对象匹配成功；另一层则是给某事实盖上“我承认”的章。",
    grammarZh: "常见结构：recognize somebody/something；recognize A as B；recognize that-clause。英式雅思文本常写 recognise。",
    senses: [
      {
        label: "IDENTIFY",
        titleZh: "认出、识别",
        explanationZh: "因为以前见过、听过或学过，所以能确认对象是谁或是什么。",
        collocations: [
          phrase("recognize a face or voice", "认出面孔或声音", "She recognized his voice before she saw him.", "她还没看到他，就先认出了他的声音。"),
          phrase("recognize the signs", "识别征兆", "Teachers should recognize the early signs of stress.", "教师应识别压力的早期迹象。"),
          phrase("be easily recognizable", "容易辨认", "The species is easily recognizable by its striped tail.", "该物种可通过条纹尾巴轻易辨认。"),
        ],
      },
      {
        label: "ACCEPT / GIVE STATUS",
        titleZh: "承认事实、价值或地位",
        explanationZh: "不一定是亲眼认出，而是接受某事真实、重要或具有合法地位。",
        collocations: [
          phrase("recognize the importance of", "认识到……的重要性", "The report recognizes the importance of early intervention.", "报告承认早期干预的重要性。"),
          phrase("recognize A as B", "承认A是B", "The site is recognized as a place of cultural significance.", "该遗址被认定为具有文化意义的地点。"),
          phrase("officially recognize", "正式承认", "The government officially recognized the new qualification.", "政府正式认可了这项新资质。"),
        ],
      },
    ],
    sourceMethodAudit: {
      type: "synonym_candidate_pool",
      normalizedCandidates: ["perceive", "acknowledge", "realize", "appreciate", "admit", "identify", "comprehend", "understand", "know"],
      noteZh: "原表末尾 understand know 缺少分隔符，已拆为两个候选。它们只与 recognize 的部分义项重叠。",
    },
    synonymContrasts: [
      contrast("identify", "/aɪˈden.tɪ.faɪ/", "verb", "确认身份；识别", "identify 强调确定具体身份或类别；recognize 强调因已有记忆而认出，也可表示承认价值。", "The witness identified the driver from a photograph.", "证人从照片中确认了司机的身份。"),
      contrast("acknowledge", "/əkˈnɒl.ɪdʒ/", "verb", "承认；确认收到；致谢", "acknowledge 不表示凭外貌认出；它强调公开接受事实、确认信息或表达感谢。", "The company acknowledged that the figures were inaccurate.", "公司承认这些数字不准确。"),
      contrast("realize", "/ˈrɪə.laɪz/", "verb", "意识到；领悟", "realize 是某一刻在头脑中明白；recognize 可指视觉识别，也可较正式地承认既有事实。", "I realized that the deadline had changed.", "我意识到截止日期已经改变。"),
      contrast("perceive", "/pəˈsiːv/", "verb", "察觉；理解为", "perceive 强调感官察觉或主观理解；recognize 强调匹配已有知识或承认某事实。", "Consumers perceive the product as safer.", "消费者认为该产品更安全。"),
    ],
    morphology: {
      originZh: "re-（再次）+ cognize，追溯到拉丁语 cognoscere（认识、了解）；核心图像是“再次知道，因此认出”。",
      wordFamily: ["recognition", "recognizable", "unrecognized"],
      soundHookZh: "熟词桥：cognition 是“认知”；recognize 就是把当前对象接回已有认知。",
      trapZh: "刹车：认出一个人用 recognize；第一次查明其身份更偏 identify。英式雅思常见 recognise。",
    },
    memory: {
      sceneZh: "机场人群中，一个旧面孔被记忆系统瞬间框选。",
      semanticLandingZh: "已有知识匹配成功，或正式承认某事实/地位。",
      microEn: "I recognized the pattern and recognized its importance.",
      microZh: "我认出了这个模式，也承认了它的重要性。",
    },
    ieltsEvidence: [
      evidence({
        textEn: "Operators must be able to recognise work-related health problems.",
        textZh: "操作人员必须能够识别与工作有关的健康问题。",
        sourceType: "official_practice_test",
        sourceTitle: "General Training Reading Section 2 — British Council",
        sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading/general-training/section-2",
        section: "Beneficial work practices for the keyboard operator",
        verbatim: false,
        noteZh: "从官方练习题原句中截取核心分句；保留英式拼写 recognise。",
      }),
      evidence({
        textEn: "This task tests the ability to recognise the main idea of a paragraph.",
        textZh: "这类题测试识别段落主旨的能力。",
        sourceType: "official_exam_preparation",
        sourceTitle: "Dealing with Matching Headings Questions — British Council",
        sourceUrl: "https://takeielts.britishcouncil.org/sites/default/files/dealing_with_matching_headings_questions.pdf",
        section: "Teacher worksheet",
        verbatim: false,
        noteZh: "根据英国文化教育协会教学材料压缩改写；保留真实考查语境。",
      }),
    ],
    recall: {
      promptEn: "What two major meanings does recognize have?",
      promptZh: "recognize 的两大核心义是什么？",
      answerEn: "Identify from prior knowledge; accept or give official status to a fact, value, or person.",
      answerZh: "凭已有知识认出；承认事实、价值或正式地位。",
    },
    checks: [
      {
        type: "context",
        promptEn: "The treaty formally ________ the region as an independent state.",
        promptZh: "该条约正式承认该地区为独立国家。",
        options: ["recognized", "perceived", "resembled", "comprehended"],
        answer: 0,
        explanationZh: "recognize A as B 可表示正式承认地位。",
      },
    ],
  }),

  entry({
    source: {
      appId: 4,
      entryType: "highlighted_substitute",
      category: 1,
      categoryIndex: 2,
      importanceRank: 2,
      wordOrPhrase: "perceive",
      posSource: null,
      meaningZhSource: null,
      linkedPrimaryWord: "recognize",
      sourceQuestionMethodRaw: "perceive, acknowledge, realize, appreciate, admit, identify, comprehend, understand know",
      sourcePage: 1,
      importNote: "PDF红色高亮替换表达；未臆造独立中文释义",
    },
    word: "perceive",
    ipa: "/pəˈsiːv/",
    pos: "transitive verb",
    register: "正式；学术阅读与写作高频",
    coreEn: "to become aware of something through the senses; or to understand, interpret, or regard it in a particular way",
    coreZh: "通过感官察觉；或以某种方式理解、看待某人或某事",
    imageZh: "感官接收到模糊信号，大脑随后给信号贴上解释标签。",
    grammarZh: "常见结构：perceive something；perceive that-clause；perceive A as B；be perceived to be。",
    senses: [
      {
        label: "SENSE / NOTICE",
        titleZh: "感知、察觉",
        explanationZh: "强调感官或意识捕捉到不一定明显的刺激、变化或差异。",
        collocations: [
          phrase("perceive a change", "察觉变化", "Participants perceived a slight change in temperature.", "参与者察觉到温度的轻微变化。"),
          phrase("perceive a threat", "感知威胁", "Animals may flee when they perceive a threat.", "动物感知到威胁时可能会逃跑。"),
          phrase("barely perceive", "几乎察觉不到", "The sound was too faint to perceive clearly.", "声音太微弱，无法清楚察觉。"),
        ],
      },
      {
        label: "INTERPRET / REGARD",
        titleZh: "理解为、看待为",
        explanationZh: "强调主观解释，不保证这种看法客观正确。雅思常见被动结构 be perceived as。",
        collocations: [
          phrase("perceive A as B", "把A看作B", "Many residents perceive the policy as unfair.", "许多居民认为这项政策不公平。"),
          phrase("be widely perceived to be", "被普遍认为是", "The industry is widely perceived to be in decline.", "该行业被普遍认为正在衰退。"),
          phrase("perceived risk", "感知风险；主观风险", "Perceived risk can influence consumer behaviour.", "主观感知的风险会影响消费者行为。"),
        ],
      },
    ],
    sourceMethodAudit: {
      type: "synonym_candidate_pool",
      normalizedCandidates: ["recognize", "realize", "identify", "comprehend", "understand", "acknowledge", "appreciate", "admit"],
      noteZh: "perceive 本身是原候选之一。候选池涵盖“感知—理解—承认”多条语义链，并非全部可替换。",
    },
    synonymContrasts: [
      contrast("recognize", "/ˈrek.əɡ.naɪz/", "verb", "认出；承认", "recognize 常依赖已有知识完成识别；perceive 可首次察觉刺激，也可表示主观看法。", "She recognized the melody immediately.", "她立刻认出了这段旋律。"),
      contrast("realize", "/ˈrɪə.laɪz/", "verb", "意识到", "realize 突出从不知道到明白的认知转折；perceive 可持续感知或形成看法。", "He realized that the data were incomplete.", "他意识到数据并不完整。"),
      contrast("discern", "/dɪˈsɜːn/", "verb", "辨别；看出", "discern 强调在困难条件下辨出细微差异；perceive 是更宽泛的感知或理解。", "Experts discerned a pattern in the results.", "专家从结果中辨别出一个模式。", false),
      contrast("acknowledge", "/əkˈnɒl.ɪdʒ/", "verb", "承认；确认", "acknowledge 是公开接受事实；perceive 是察觉或形成看法，未必公开承认。", "The author acknowledges the limits of the study.", "作者承认该研究的局限。"),
    ],
    morphology: {
      originZh: "来自拉丁语 percipere：per-（完全、贯穿）+ capere（抓取）；历史图像是“把信息完整抓住”。",
      wordFamily: ["perception", "perceptive", "perceptible", "imperceptible"],
      soundHookZh: "熟词桥：perception 是“感知”；perceive 是产生这种感知的动作。",
      trapZh: "刹车：be perceived as 表示“被看作”，不是“被认出”；主观看法可能与事实不同。",
    },
    memory: {
      sceneZh: "雷达抓住微弱信号，大脑屏幕写出“可能是威胁”。",
      semanticLandingZh: "先察觉，再解释；重点是感知者看到或理解成什么。",
      microEn: "People may perceive the same change in different ways.",
      microZh: "人们可能以不同方式看待同一变化。",
    },
    ieltsEvidence: [
      evidence({
        textEn: "Fish use electroreception to perceive electrical stimuli.",
        textZh: "鱼利用电感受来感知电刺激。",
        sourceType: "official_practice_test",
        sourceTitle: "Academic Reading Section 1: Electroreception — British Council",
        sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading-academic/section-1",
        section: "Reading Passage 1",
        verbatim: false,
        noteZh: "根据官方练习题首段压缩改写，保留 perceive 的真实科学语境。",
      }),
      evidence({
        textEn: "He criticised what he perceived as an over-emphasis on the classical European repertoire.",
        textZh: "他批评了自己所认为的对欧洲古典曲目的过度强调。",
        sourceType: "official_practice_test",
        sourceTitle: "Academic Reading Test 2: Miles Davis — British Council",
        sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading-academic-2/section-2",
        section: "Reading Passage 2, paragraph B",
        verbatim: false,
        noteZh: "从官方练习题原句中截取并压缩，保留 perceive A as B 结构。",
      }),
    ],
    recall: {
      promptEn: "What does perceive A as B express?",
      promptZh: "perceive A as B 表达什么？",
      answerEn: "It expresses how someone interprets or regards A, not necessarily an objective fact.",
      answerZh: "表示某人如何理解或看待A，不一定是客观事实。",
    },
    checks: [
      {
        type: "contrast",
        promptEn: "Residents ________ the new tax as unfair, although the government disagrees.",
        promptZh: "居民认为新税不公平，尽管政府不同意。",
        options: ["perceive", "resemble", "identify", "acknowledge"],
        answer: 0,
        explanationZh: "这里强调居民的主观看法，用 perceive A as B。",
      },
    ],
  }),

  entry({
    source: {
      appId: 5,
      entryType: "highlighted_substitute",
      category: 1,
      categoryIndex: 2,
      importanceRank: 2,
      wordOrPhrase: "acknowledge",
      posSource: null,
      meaningZhSource: null,
      linkedPrimaryWord: "recognize",
      sourceQuestionMethodRaw: "perceive, acknowledge, realize, appreciate, admit, identify, comprehend, understand know",
      sourcePage: 1,
      importNote: "PDF红色高亮替换表达；未臆造独立中文释义",
    },
    word: "acknowledge",
    ipa: "/əkˈnɒl.ɪdʒ/",
    pos: "transitive verb",
    register: "中性偏正式；学术写作、邮件和论证高频",
    coreEn: "to accept or admit that something exists or is true; to confirm receipt; or to show recognition, thanks, or respect",
    coreZh: "承认某事存在或属实；确认收到；或公开表示认可、感谢与尊重",
    imageZh: "收到信息后先盖“已收到”章，再对事实盖“我承认”章，最后向贡献者点头致谢。",
    grammarZh: "常见结构：acknowledge something；acknowledge that-clause；acknowledge A as B；acknowledge receipt of。",
    senses: [
      {
        label: "ACCEPT / ADMIT",
        titleZh: "承认事实或问题",
        explanationZh: "表示不再否认某事实、责任、局限或他人的观点；比 admit 更中性、正式。",
        collocations: [
          phrase("acknowledge that", "承认……", "The report acknowledges that the sample was small.", "报告承认样本规模较小。"),
          phrase("acknowledge a problem", "承认问题存在", "Officials finally acknowledged the scale of the problem.", "官员最终承认了问题的严重程度。"),
          phrase("widely acknowledged as", "被广泛认为是", "The discovery is widely acknowledged as a major breakthrough.", "这项发现被广泛认为是重大突破。"),
        ],
      },
      {
        label: "CONFIRM / GIVE CREDIT",
        titleZh: "确认收到；认可或致谢",
        explanationZh: "可用于邮件确认，也可公开肯定某人的贡献、帮助或地位。",
        collocations: [
          phrase("acknowledge receipt of", "确认收到", "Please acknowledge receipt of this application.", "请确认收到这份申请。"),
          phrase("acknowledge a contribution", "认可贡献", "The authors acknowledge the contribution of local volunteers.", "作者感谢当地志愿者的贡献。"),
          phrase("acknowledge someone with a nod", "点头示意", "She acknowledged the audience with a brief nod.", "她简短地点头向观众示意。"),
        ],
      },
    ],
    sourceMethodAudit: {
      type: "synonym_candidate_pool",
      normalizedCandidates: ["recognize", "admit", "appreciate", "realize", "perceive", "identify", "comprehend", "understand", "know"],
      noteZh: "acknowledge 与 recognize/admit/appreciate 只在特定义项重叠；确认收件是它的重要独立用法。",
    },
    synonymContrasts: [
      contrast("admit", "/ədˈmɪt/", "verb", "承认；供认", "admit 常暗示不情愿地承认错误、责任或不利事实；acknowledge 更中性，也可确认收到或致谢。", "The company admitted breaking the rules.", "公司承认违反了规定。"),
      contrast("recognize", "/ˈrek.əɡ.naɪz/", "verb", "认出；承认价值或地位", "recognize 可表示凭记忆认出；acknowledge 不负责视觉识别，更强调公开接受、确认或致意。", "The award recognizes her contribution to science.", "该奖项表彰她对科学的贡献。"),
      contrast("appreciate", "/əˈpriː.ʃi.eɪt/", "verb", "感激；理解价值", "appreciate 强调内心感谢或理解价值；acknowledge 是把感谢、事实或贡献明确表达出来。", "We appreciate your continued support.", "我们感谢你一直以来的支持。"),
      contrast("concede", "/kənˈsiːd/", "verb", "勉强承认；让步", "concede 通常是在争论中让步，语气更不情愿；acknowledge 不必包含争辩或失败。", "She conceded that the plan was too costly.", "她勉强承认该计划成本过高。", false),
    ],
    morphology: {
      originZh: "来自中古英语 aknowen（承认、认知）与 knowledge 相关的历史构词；开头的 ac- 不是现代可自由替换的前缀。",
      wordFamily: ["acknowledgement", "acknowledged", "unacknowledged"],
      soundHookZh: "熟词桥：knowledge 是“知道”；acknowledge 是把已经知道或接受的事实明确表示出来。",
      trapZh: "刹车：acknowledge receipt 是确认收到，不是感谢；acknowledge a person 可以只是点头示意。",
    },
    memory: {
      sceneZh: "邮件到达，收件人盖章、承认问题，再在致谢栏写下贡献者姓名。",
      semanticLandingZh: "把事实、收件状态或他人贡献明确地表示出来。",
      microEn: "Acknowledge the problem, the message, and the people who helped.",
      microZh: "承认问题，确认消息，也认可帮助过你的人。",
    },
    ieltsEvidence: [
      evidence({
        textEn: "Davis later acknowledged that his time at the school was invaluable.",
        textZh: "戴维斯后来承认，他在该校的经历非常宝贵。",
        sourceType: "official_practice_test",
        sourceTitle: "Academic Reading Test 2: Miles Davis — British Council",
        sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading-academic-2/section-2",
        section: "Reading Passage 2, paragraph B",
        verbatim: false,
        noteZh: "根据官方练习题原句压缩改写，保留 acknowledge that 结构。",
      }),
      evidence({
        textEn: "If you disagree, acknowledge the examiner's statement respectfully.",
        textZh: "如果你不同意，也要礼貌地回应并承认考官所说的话。",
        sourceType: "official_exam_preparation",
        sourceTitle: "How to ace your IELTS Speaking test — IELTS.org",
        sourceUrl: "https://ielts.org/news-and-insights/dont-overdo-it-how-to-ace-your-ielts-speaking-test",
        section: "Speaking advice",
        verbatim: false,
        noteZh: "根据IELTS官方口语建议改写，展示 acknowledge 在互动中的用法。",
      }),
    ],
    recall: {
      promptEn: "Name three common objects of acknowledge.",
      promptZh: "列出 acknowledge 常接的三类宾语。",
      answerEn: "A fact or problem; receipt of a message; a person's contribution or presence.",
      answerZh: "事实或问题；消息/文件的收件状态；他人的贡献或在场。",
    },
    checks: [
      {
        type: "contrast",
        promptEn: "Please ________ receipt of the attached documents.",
        promptZh: "请确认收到附件中的文件。",
        options: ["acknowledge", "perceive", "resemble", "identify"],
        answer: 0,
        explanationZh: "确认收到文件的固定正式表达是 acknowledge receipt of。",
      },
    ],
  }),
];

export const ielts538PreviewByAppId = new Map(
  ielts538Preview001To005.map((item) => [item.source.appId, item]),
);

export const ielts538PreviewByWord = Object.fromEntries(
  ielts538Preview001To005.map((item) => [item.word.toLowerCase(), item]),
);

export function getIelts538PreviewEntry(appIdOrWord) {
  if (typeof appIdOrWord === "number" || /^\d+$/.test(String(appIdOrWord))) {
    return ielts538PreviewByAppId.get(Number(appIdOrWord));
  }

  return ielts538PreviewByWord[String(appIdOrWord).trim().toLowerCase()];
}
