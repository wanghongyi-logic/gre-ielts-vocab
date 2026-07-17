// Data-only aggregation entry. Importing this file does not register anything
// in the existing Web App.

import { entries001To044, synonymGroups001To044, lookalikePacks001To044 } from "./batch-001-044.js";
import { entries045To056, synonymGroups045To056, lookalikePacks045To056 } from "./batch-045-056.js";
import { entries057To089, synonymGroups057To089, lookalikePacks057To089 } from "./batch-057-089.js";
import { entries090To100, synonymGroups090To100, lookalikePacks090To100 } from "./batch-090-100.js";
import { entries101To134, synonymGroups101To134, lookalikePacks101To134 } from "./batch-101-134.js";
import { entries135To178, synonymGroups135To178, lookalikePacks135To178 } from "./batch-135-178.js";
import { entries179To222, synonymGroups179To222, lookalikePacks179To222 } from "./batch-179-222.js";
import { entries223To266, synonymGroups223To266, lookalikePacks223To266 } from "./batch-223-266.js";
import { entries267To310, synonymGroups267To310, lookalikePacks267To310 } from "./batch-267-310.js";
import { entries311To354, synonymGroups311To354, lookalikePacks311To354 } from "./batch-311-354.js";
import { entries355To399, synonymGroups355To399, lookalikePacks355To399 } from "./batch-355-399.js";
import { entries400To443, synonymGroups400To443, lookalikePacks400To443 } from "./batch-400-443.js";
import { entries444To487, synonymGroups444To487, lookalikePacks444To487 } from "./batch-444-487.js";
import { entries488To527, synonymGroups488To527, lookalikePacks488To527 } from "./batch-488-527.js";
import { ielts538SourceEntries, ielts538SourceByAppId } from "./source-entries.js";
import { ielts538SourceGroups } from "./source-groups.js";
import { getIelts538OfficialEvidence } from "./official-evidence.js";
import {
  qualityMemory001To047,
  qualityCoreImages001To047,
  comparisonFocus001To047,
  supplementalComparisonMembers001To047,
  groupStories001To020,
} from "./quality-overrides-001-047.js";
import {
  qualityMemory048To216,
  qualityCoreImages048To216,
  supplementalComparisonMembers048To216,
  groupStories021To120,
} from "./quality-overrides-048-216.js";
import {
  buildQualityProfile217To527,
  supplementalComparisonMembers217To527,
  buildGroupStories121To376,
  qualityOriginOverrides217To527,
  comparisonFocus217To527,
} from "./quality-overrides-217-527.js";

const editorialWordCorrections = new Map([
  [394, "manage to do"],
]);

const correctedWord = (appId, word) => editorialWordCorrections.get(Number(appId)) || word;

const allEntryContent = [
  ...entries001To044,
  ...entries045To056,
  ...entries057To089,
  ...entries090To100,
  ...entries101To134,
  ...entries135To178,
  ...entries179To222,
  ...entries223To266,
  ...entries267To310,
  ...entries311To354,
  ...entries355To399,
  ...entries400To443,
  ...entries444To487,
  ...entries488To527,
]
  .map((entry) => ({ ...entry, word: correctedWord(entry.appId, entry.word) }))
  .sort((a, b) => a.appId - b.appId);

const allEntryContentByAppId = new Map(allEntryContent.map((entry) => [entry.appId, entry]));

const baseSynonymGroups = [
  ...synonymGroups001To044,
  ...synonymGroups045To056,
  ...synonymGroups057To089,
  ...synonymGroups090To100,
  ...synonymGroups101To134,
  ...synonymGroups135To178,
  ...synonymGroups179To222,
  ...synonymGroups223To266,
  ...synonymGroups267To310,
  ...synonymGroups311To354,
  ...synonymGroups355To399,
  ...synonymGroups400To443,
  ...synonymGroups444To487,
  ...synonymGroups488To527,
]
  .map((group) => ({
    ...group,
    primaryWord: correctedWord(group.primaryAppId, group.primaryWord),
    members: group.members.map((member) => ({
      ...member,
      word: correctedWord(member.appId, member.word),
    })),
  }))
  .sort((a, b) => a.primaryAppId - b.primaryAppId);

export const ielts538SynonymGroups = baseSynonymGroups.map((group) => {
  const supplemental = [
    ...(supplementalComparisonMembers001To047[group.groupId] || []),
    ...(supplementalComparisonMembers048To216[group.groupId] || []),
    ...(supplementalComparisonMembers217To527[group.groupId] || []),
  ];
  const groupIndex = Number(group.groupId.slice(1));
  const categoryTwoQuality = groupIndex >= 21 && groupIndex <= 120;
  const categoryThreeQuality = groupIndex >= 121 && groupIndex <= 376;
  const members = [...group.members, ...supplemental].map((member) => {
    const profile = comparisonFocus001To047.get(String(member.word).trim().toLowerCase());
    if (profile) return { ...member, ...profile };
    if (categoryTwoQuality || categoryThreeQuality) {
      const entry = allEntryContentByAppId.get(Number(member.appId));
      const authoredBoundary = categoryThreeQuality && entry
        ? entry.memory?.trapZh
          || entry.memory?.confusionBrakeZh
          || entry.morphology?.trapZh
        : "";
      const focusOverride = categoryThreeQuality
        ? comparisonFocus217To527.get(`${group.groupId}|${String(member.word).trim().toLowerCase()}`)
        : "";
      const focusZh = focusOverride || authoredBoundary || member.focusZh || member.boundaryZh || member.coreZh;
      return {
        ...member,
        role: member.role || (Number(member.appId) === group.primaryAppId ? "组内主词 · 核心基准" : "原表候选 · 语义边界"),
        focusZh,
      };
    }
    return member;
  });
  if (!supplemental.length && !categoryTwoQuality && !categoryThreeQuality && members.every((member, index) => member === group.members[index])) return group;
  return {
    ...group,
    members,
    sourceMethodAudit: {
      ...group.sourceMethodAudit,
      noteZh: "每张卡片都直接对比当前词与候选表达的语义重点、适用对象和句法条件。",
    },
  };
});

export const ielts538LookalikePacks = [
  ...lookalikePacks001To044,
  ...lookalikePacks045To056,
  ...lookalikePacks057To089,
  ...lookalikePacks090To100,
  ...lookalikePacks101To134,
  ...lookalikePacks135To178,
  ...lookalikePacks179To222,
  ...lookalikePacks223To266,
  ...lookalikePacks267To310,
  ...lookalikePacks311To354,
  ...lookalikePacks355To399,
  ...lookalikePacks400To443,
  ...lookalikePacks444To487,
  ...lookalikePacks488To527,
]
  .map((pack) => ({ ...pack, word: correctedWord(pack.appId, pack.word) }))
  .sort((a, b) => a.appId - b.appId);

export const ielts538SynonymGroupById = new Map(
  ielts538SynonymGroups.map((group) => [group.groupId, group]),
);

export const ielts538LookalikeByAppId = new Map(
  ielts538LookalikePacks.map((pack) => [pack.appId, pack]),
);

export const ielts538Entries = allEntryContent.map((content) => {
  const categoryThreeQuality = content.appId >= 217 ? buildQualityProfile217To527(content) : null;
  const quality = qualityMemory001To047.get(content.appId)
    || qualityMemory048To216.get(content.appId)
    || categoryThreeQuality;
  const qualityImage = qualityCoreImages001To047.get(content.appId)
    || qualityCoreImages048To216.get(content.appId)
    || categoryThreeQuality?.imageLensZh;
  return {
    ...content,
    imageZh: qualityImage || content.imageZh,
    morphology: quality
      ? {
          ...content.morphology,
          originZh: qualityOriginOverrides217To527.get(content.appId) || content.morphology?.originZh,
          nonEtymologicalHookZh: quality.soundHookZh,
          familiarBridgeZh: quality.englishHookZh,
        }
      : content.morphology,
    memory: quality
      ? {
          ...content.memory,
          semanticLandingZh: quality.semanticLandingZh || quality.imageLensZh,
        }
      : content.memory,
    source: ielts538SourceByAppId.get(content.appId),
    officialEvidence: getIelts538OfficialEvidence(content.appId),
  };
});

export const ielts538EntryByAppId = new Map(
  ielts538Entries.map((entry) => [entry.appId, entry]),
);

export const ielts538GroupStories = {
  ...groupStories001To020,
  ...groupStories021To120,
  ...buildGroupStories121To376(ielts538SynonymGroups, ielts538EntryByAppId),
};

export const ielts538EntriesByWord = new Map();
for (const entry of ielts538Entries) {
  const key = String(entry.word).trim().toLowerCase();
  const matches = ielts538EntriesByWord.get(key) ?? [];
  matches.push(entry);
  ielts538EntriesByWord.set(key, matches);
}

export const getIelts538Entry = (appId) => ielts538EntryByAppId.get(Number(appId));
export const getIelts538EntriesByWord = (word) =>
  ielts538EntriesByWord.get(String(word).trim().toLowerCase()) ?? [];
export const getIelts538SynonymGroup = (groupId) => ielts538SynonymGroupById.get(groupId);
export const getIelts538LookalikePack = (appId) => ielts538LookalikeByAppId.get(Number(appId));

export const ielts538Manifest = {
  sourceEntryCount: ielts538SourceEntries.length,
  sourceGroupCount: ielts538SourceGroups.length,
  contentEntryCount: ielts538Entries.length,
  synonymGroupCount: ielts538SynonymGroups.length,
  lookalikePackCount: ielts538LookalikePacks.length,
  titleClaimedWordCount: 538,
  sourceWorkbookActualEnglishWordCount: 536,
  appImportEntryCount: 527,
};
