// Curated overlay of examples that were individually checked against public
// materials from IELTS or an official IELTS partner. This remains separate from
// authored IELTS-style examples so the UI can label provenance honestly.

import { ielts538Preview001To005 } from "../ielts-538-preview-001-005.js";

const official = (appId, items) => ({ appId, items });

const previewEvidence = ielts538Preview001To005.map((entry) =>
  official(entry.source.appId, entry.ieltsEvidence),
);

const additionalEvidence = [
  official(2, [
    {
      textEn: "A sudden change in traffic is compared with a substance changing from vapour to liquid.",
      textZh: "交通状态的骤变被比作物质从蒸气变为液体的过程。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The Physics of Traffic Behavior",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Matching Headings passage, section B",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方公开阅读样题压缩，保留 be similar to 的比较关系。",
    },
  ]),
  official(3, [
    {
      textEn: "The dividing line recognises the importance of the written word.",
      textZh: "这条分界线承认书面文字的重要性。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Modified Large Print Sample — Archaeology",
      sourceUrl: "https://cdn.ielts.org/ielts-access-arrangements-sample-tests/ielts-modified-large-print/ielts-academic-reading-access-arrangement-modified-large-print-text-booklet.pdf",
      section: "Reading passage, archaeology",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方无障碍版公开样题原句压缩；保留英式拼写 recognises。",
    },
  ]),
  official(6, [
    {
      textEn: "Huxley realised that the extra bone was the bird's anklebone.",
      textZh: "赫胥黎意识到那块额外的骨头其实是鸟的踝骨。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The origins of birds",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Sentence Completion passage",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题压缩；原文使用英式拼写 realised。",
    },
  ]),
  official(9, [
    {
      textEn: "Without the preserved feathers, the specimen might have been identified as a small dinosaur.",
      textZh: "若没有保存清晰的羽毛，该标本可能会被认定为一只小型恐龙。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The origins of birds",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Sentence Completion passage",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题压缩，保留 identify A as B 的真实结构。",
    },
  ]),
  official(10, [
    {
      textEn: "Sounds, too, are garbled and difficult to comprehend.",
      textZh: "声音也同样混乱不清，难以理解。",
      sourceType: "official_practice_test",
      sourceTitle: "British Council Academic Reading Practice Test — Electroreception",
      sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading-academic/section-1",
      section: "Reading Passage 1, paragraph A",
      verbatim: true,
      noteZh: "英国文化教育协会公开雅思阅读练习原句。",
    },
  ]),
  official(13, [
    {
      textEn: "The physicists modified the equations to account for differences between vehicles and gas molecules.",
      textZh: "物理学家修改了方程，以考虑车辆和气体分子之间的差异。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The Physics of Traffic Behavior",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Matching Headings passage, section A",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题压缩，保留 modify the equations 的真实搭配。",
    },
  ]),
  official(14, [
    {
      textEn: "Food scarcity may induce cells to shift into a preservation-focused mode.",
      textZh: "食物匮乏可能促使细胞转入以保存机体为重点的模式。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — caloric restriction",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Flow-chart Completion passage",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题压缩，保留 shift into 的方向变化。",
    },
  ]),
  official(16, [
    {
      textEn: "Cladistics provides a new approach to understanding how birds evolved.",
      textZh: "支序分类学为理解鸟类如何进化提供了一种新思路。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The origins of birds",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Sentence Completion passage",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题改写，保留 approach to + 名词/动名词的结构。",
    },
  ]),
  official(17, [
    {
      textEn: "Marie Curie introduced a teaching method based on experimental demonstrations.",
      textZh: "居里夫人采用了一种以实验演示为基础的教学方法。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The life and work of Marie Curie",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Note Completion passage",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题压缩，保留 method based on 的真实搭配。",
    },
  ]),
  official(18, [
    {
      textEn: "It differs from the study of written history in a fundamental way.",
      textZh: "它与书面历史研究有着根本性的不同。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Modified Large Print Sample — Archaeology",
      sourceUrl: "https://cdn.ielts.org/ielts-access-arrangements-sample-tests/ielts-modified-large-print/ielts-academic-reading-access-arrangement-modified-large-print-text-booklet.pdf",
      section: "Reading passage, archaeology",
      verbatim: true,
      noteZh: "IELTS.org 官方无障碍版公开阅读样题原句。",
    },
  ]),
  official(24, [
    {
      textEn: "a measure of the energy value of food",
      textZh: "食物能量值的一种度量",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — caloric restriction",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Passage glossary",
      verbatim: true,
      noteZh: "IELTS.org 官方公开阅读样题词汇表原文片段。",
    },
  ]),
  official(30, [
    {
      textEn: "the discovery in 1934 of artificial radioactivity",
      textZh: "1934年对人工放射性的发现",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The life and work of Marie Curie",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Note Completion passage",
      verbatim: true,
      noteZh: "IELTS.org 官方公开阅读样题原文片段。",
    },
  ]),
  official(34, [
    {
      textEn: "Personal relationships and political tensions often underlie the decisions of International Olympic Committee members.",
      textZh: "人际关系和政治紧张局势常常是国际奥委会成员作出决定的深层原因。",
      sourceType: "official_practice_test",
      sourceTitle: "British Council Academic Reading Practice Test — Fair games?",
      sourceUrl: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading-academic/section-2",
      section: "Question 14–18, sentence ending J",
      verbatim: true,
      noteZh: "英国文化教育协会公开雅思阅读练习题原句。",
    },
  ]),
  official(35, [
    {
      textEn: "Marie Curie's doctorate was based on the results of this research.",
      textZh: "居里夫人的博士学位以这项研究的成果为依据。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — The life and work of Marie Curie",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Note Completion passage",
      verbatim: false,
      noteZh: "根据 IELTS.org 官方阅读样题改写，保留 be based on 的真实结构。",
    },
  ]),
  official(41, [
    {
      textEn: "It has proved toxic at some doses in animals.",
      textZh: "它已被证明在某些剂量下对动物有毒。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023 — caloric restriction",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Flow-chart Completion passage",
      verbatim: true,
      noteZh: "IELTS.org 官方公开阅读样题原句。",
    },
  ]),
  official(49, [
    {
      textEn: "Farmers require a variety of species with overlapping periods of activity.",
      textZh: "农民需要多种活动期彼此重叠的物种。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Table Completion — dung beetles",
      verbatim: false,
      noteZh: "根据官方样题原句压缩，保留 variety of 的真实搭配。",
    },
  ]),
  official(154, [
    {
      textEn: "The beetles soon become a permanent part of the local ecology if they adapt to their new environment.",
      textZh: "如果甲虫适应新环境，它们很快就会成为当地生态系统的永久组成部分。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Table Completion — dung beetles",
      verbatim: false,
      noteZh: "根据官方样题原句调整语序，未标记为逐字引用。",
    },
  ]),
  official(159, [
    {
      textEn: "Free radicals are thought to contribute to aging by damaging cells.",
      textZh: "自由基被认为会通过损伤细胞而促成衰老。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Flow-chart Completion — caloric restriction",
      verbatim: false,
      noteZh: "根据官方样题原句压缩，保留 contribute to 的真实搭配。",
    },
  ]),
  official(161, [
    {
      textEn: "The incentive for the more aggressive use of rockets came from India.",
      textZh: "更积极地把火箭用于战争的推动因素来自印度。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Matching Features — development of rockets",
      verbatim: false,
      noteZh: "根据官方样题原句压缩，未标记为逐字引用。",
    },
  ]),
  official(332, [
    {
      textEn: "In the early nineteenth century the British began to experiment with incendiary barrage rockets.",
      textZh: "十九世纪初，英国人开始试验燃烧弹幕火箭。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Matching Features — development of rockets",
      verbatim: true,
      noteZh: "IELTS.org 官方公开阅读样题原句。",
    },
  ]),
  official(485, [
    {
      textEn: "Dung beetles work inside the pat, where they are sheltered from predators.",
      textZh: "蜣螂在粪团内部活动，因此能躲避捕食者。",
      sourceType: "official_practice_test",
      sourceTitle: "IELTS Academic Reading Sample Tasks 2023",
      sourceUrl: "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
      section: "Table Completion — dung beetles",
      verbatim: false,
      noteZh: "根据官方样题原句压缩，保留 be sheltered from 的真实搭配。",
    },
  ]),
];

export const ielts538OfficialEvidence = [...previewEvidence, ...additionalEvidence];

export const ielts538OfficialEvidenceByAppId = new Map();
for (const entry of ielts538OfficialEvidence) {
  const current = ielts538OfficialEvidenceByAppId.get(entry.appId) || [];
  ielts538OfficialEvidenceByAppId.set(entry.appId, [...current, ...entry.items]);
}

export const getIelts538OfficialEvidence = (appId) =>
  ielts538OfficialEvidenceByAppId.get(Number(appId)) ?? [];
