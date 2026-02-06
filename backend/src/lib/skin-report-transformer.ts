/**
 * Transform AILab skin-analysis API result into user-facing report format.
 */

import type {
  AILabSkinAnalysisResult,
  AILabResultItem,
  AILabSkinAnalysisAdvancedResult,
  AILabRectangle,
} from './ailab';

export interface SkinReportIssue {
  type: string;
  label: string;
  severity: 1 | 2 | 3;
}

export interface SkinReport {
  skinType: string;
  issues: SkinReportIssue[];
  wrinkles: string[];
  pores: string[];
  score: number;
  skincareRoutine: {
    morning: string[];
    evening: string[];
    weekly: string[];
  };
  makeupStyles?: Array<{ id: string; name: string; steps: string[] }>;
}

/** Extended report from Advanced API; includes all fields for UI indicators. */
export interface SkinReportAdvanced {
  overallScore: number;
  score: number; // alias for overallScore for backward compatibility
  skinType: string;
  skinColor: string;
  skinTone: string;
  skinToneITA?: string;
  skinAge: number;
  faceRectangle?: { top: number; left: number; width: number; height: number };
  warnings: string[];
  sensitivity?: { areaPercent: number; intensity: number } | null;
  redAreaMapBase64?: string | null;
  acne: { count: number; percentageOfFace: number };
  pores: { zonesWithPores: string[]; percentageOfZones: number };
  blackhead: { severity: number; label: string };
  closedComedones: { count: number };
  mole: { count: number };
  skinSpot: { count: number };
  darkCircle: { type: number; label: string };
  eyePouch: { present: boolean; severity: number | null };
  wrinkles: Array<{ id: string; label: string; present: boolean; severity?: number }>;
  eyelids: { left: string; right: string };
  skinTypeDetails?: Record<string, { value: number; confidence: number }>;
  skincareRoutine: { morning: string[]; evening: string[]; weekly: string[] };
  makeupStyles: Array<{ id: string; name: string; steps: string[] }>;
  /** Precomputed 0-100% for each indicator for mobile. */
  indicators?: Array<{ id: string; label: string; percent: number }>;
}

const SKIN_TYPE_LABELS: Record<number, string> = {
  0: '油性',
  1: '干性',
  2: '中性',
  3: '混合性',
};

const ISSUE_LABELS: Record<string, string> = {
  dark_circle: '黑眼圈',
  eye_pouch: '眼袋',
  acne: '痘痘',
  skin_spot: '色斑',
  blackhead: '黑头',
  mole: '痣',
};

const WRINKLE_LABELS: Record<string, string> = {
  forehead_wrinkle: '抬头纹',
  crows_feet: '鱼尾纹',
  eye_finelines: '眼下细纹',
  glabella_wrinkle: '眉间纹',
  nasolabial_fold: '法令纹',
};

const PORE_LABELS: Record<string, string> = {
  pores_forehead: '额头毛孔',
  pores_left_cheek: '左颊毛孔',
  pores_right_cheek: '右颊毛孔',
  pores_jaw: '下颌毛孔',
};

const SKIN_COLOR_LABELS: Record<number, string> = {
  0: '透明白',
  1: '白皙',
  2: '自然',
  3: '小麦',
  4: '深色',
};

const SKIN_TONE_HA_LABELS: Record<number, string> = {
  0: '偏黄',
  1: '中性',
  2: '偏红',
  3: '异常',
};

const SKIN_TONE_ITA_LABELS: Record<number, string> = {
  0: '极浅',
  1: '浅',
  2: '中间',
  3: '棕褐',
  4: '棕',
  5: '深',
  6: '异常',
};

const BLACKHEAD_LABELS: Record<number, string> = {
  0: '无',
  1: '轻度',
  2: '中度',
  3: '重度',
};

const DARK_CIRCLE_LABELS: Record<number, string> = {
  0: '无',
  1: '色素型',
  2: '血管型',
  3: '阴影型',
};

const EYELID_LABELS: Record<number, string> = {
  0: '单眼皮',
  1: '平行双眼皮',
  2: '开扇双眼皮',
};

const WRINKLE_IDS: Array<{ key: keyof AILabSkinAnalysisAdvancedResult; label: string }> = [
  { key: 'forehead_wrinkle', label: '抬头纹' },
  { key: 'crows_feet', label: '鱼尾纹' },
  { key: 'eye_finelines', label: '眼下细纹' },
  { key: 'glabella_wrinkle', label: '眉间纹' },
  { key: 'nasolabial_fold', label: '法令纹' },
];

function hasIssue(item: AILabResultItem | undefined): boolean {
  return item?.value === 1;
}

function getSeverity(item: AILabResultItem | undefined): 1 | 2 | 3 {
  if (!item) return 1;
  const conf = item.confidence ?? 0;
  if (conf >= 0.8) return 3;
  if (conf >= 0.5) return 2;
  return 1;
}

export function transformToReport(ailabResult: AILabSkinAnalysisResult): SkinReport {
  const issues: SkinReportIssue[] = [];
  const wrinkles: string[] = [];
  const pores: string[] = [];

  // Skin type
  const skinTypeNum = ailabResult.skin_type?.skin_type ?? 2;
  const skinType = SKIN_TYPE_LABELS[skinTypeNum] ?? '中性';

  // Issues
  const issueKeys = ['dark_circle', 'eye_pouch', 'acne', 'skin_spot', 'blackhead', 'mole'] as const;
  for (const key of issueKeys) {
    const item = ailabResult[key];
    if (hasIssue(item)) {
      issues.push({
        type: key,
        label: ISSUE_LABELS[key] ?? key,
        severity: getSeverity(item),
      });
    }
  }

  // Wrinkles
  const wrinkleKeys = [
    'forehead_wrinkle',
    'crows_feet',
    'eye_finelines',
    'glabella_wrinkle',
    'nasolabial_fold',
  ] as const;
  for (const key of wrinkleKeys) {
    const item = ailabResult[key];
    if (hasIssue(item)) {
      wrinkles.push(WRINKLE_LABELS[key] ?? key);
    }
  }

  // Pores
  const poreKeys = ['pores_forehead', 'pores_left_cheek', 'pores_right_cheek', 'pores_jaw'] as const;
  for (const key of poreKeys) {
    const item = ailabResult[key];
    if (hasIssue(item)) {
      pores.push(PORE_LABELS[key] ?? key);
    }
  }

  // Score: start at 100, deduct by severity
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 3) score -= 15;
    else if (issue.severity === 2) score -= 10;
    else score -= 5;
  }
  for (let i = 0; i < wrinkles.length; i++) {
    score -= 5;
  }
  for (let i = 0; i < pores.length; i++) {
    score -= 3;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Skincare routine based on skin type and issues
  const baseMorning = ['洁面', '爽肤水', '精华', '乳液', '防晒'];
  const baseEvening = ['卸妆', '洁面', '爽肤水', '精华', '面霜'];
  const baseWeekly = ['面膜'];

  const morning = [...baseMorning];
  const evening = [...baseEvening];
  const weekly = [...baseWeekly];

  if (skinTypeNum === 0) {
    morning.splice(morning.indexOf('乳液'), 1, '控油乳液');
    evening.splice(evening.indexOf('面霜'), 1, '控油面霜');
  } else if (skinTypeNum === 1) {
    morning.splice(morning.indexOf('乳液'), 1, '保湿乳液');
    evening.splice(evening.indexOf('面霜'), 1, '保湿面霜');
  } else if (skinTypeNum === 3) {
    morning.splice(morning.indexOf('乳液'), 1, '分区护理（T区控油、U区保湿）');
  }

  if (issues.some((i) => i.type === 'acne')) {
    morning.splice(morning.indexOf('精华'), 0, '祛痘精华');
    evening.splice(evening.indexOf('精华'), 0, '祛痘精华');
  }
  if (issues.some((i) => i.type === 'dark_circle')) {
    morning.splice(morning.indexOf('精华'), 0, '眼霜');
    evening.splice(evening.indexOf('精华'), 0, '眼霜');
  }
  if (issues.some((i) => i.type === 'skin_spot') || issues.some((i) => i.type === 'mole')) {
    morning.splice(morning.indexOf('精华'), 0, '美白/淡斑精华');
  }
  if (issues.some((i) => i.type === 'blackhead')) {
    weekly.push('清洁面膜');
  }

  const makeupStyles: Array<{ id: string; name: string; steps: string[] }> = [
    { id: '1', name: '日常', steps: ['保湿打底', '轻透底妆', '自然眉'] },
    { id: '2', name: '职场', steps: ['遮瑕', '哑光底妆', '大地色眼影'] },
    { id: '3', name: '约会', steps: ['提亮', '轻薄底妆', '粉色系眼唇'] },
  ];

  if (issues.some((i) => i.type === 'dark_circle')) {
    makeupStyles[0].steps.splice(1, 0, '眼下遮瑕');
    makeupStyles[1].steps[0] = '眼下遮瑕 · 局部遮瑕';
  }
  if (issues.some((i) => i.type === 'acne')) {
    makeupStyles[0].steps.splice(1, 0, '痘痘遮瑕');
  }

  return {
    skinType,
    issues,
    wrinkles,
    pores,
    score,
    skincareRoutine: { morning, evening, weekly },
    makeupStyles,
  };
}

function rectArea(rect: AILabRectangle): number {
  return (rect.width || 0) * (rect.height || 0);
}

/**
 * Transform AILab Skin Analysis Advanced API response into simplified report.
 * Uses every field from the API; pass face_rectangle and warning from top-level response.
 */
export function transformAdvancedToReport(
  result: AILabSkinAnalysisAdvancedResult,
  faceRectangle?: { top: number; left: number; width: number; height: number } | null,
  warning?: string[] | null
): SkinReportAdvanced {
  const faceRect = faceRectangle ?? undefined;
  const warnings = Array.isArray(warning) ? warning : [];

  const skinTypeNum = result.skin_type?.skin_type ?? 2;
  const skinType = SKIN_TYPE_LABELS[skinTypeNum] ?? '中性';

  const skinColorVal = result.skin_color?.value ?? 2;
  const skinColor = SKIN_COLOR_LABELS[skinColorVal] ?? '自然';

  const skinToneHa = result.skin_hue_ha?.skintone ?? 1;
  const skinTone = SKIN_TONE_HA_LABELS[skinToneHa] ?? '中性';

  const skinToneITA =
    result.skintone_ita?.skintone !== undefined
      ? SKIN_TONE_ITA_LABELS[result.skintone_ita.skintone!] ?? '异常'
      : undefined;

  const skinAge = result.skin_age?.value ?? 0;

  const sensitivity =
    result.sensitivity != null
      ? {
          areaPercent: (result.sensitivity.sensitivity_area ?? 0) * 100,
          intensity: result.sensitivity.sensitivity_intensity ?? 0,
        }
      : null;

  const redAreaMapBase64 = result.face_maps?.red_area ?? null;

  const acneRects = result.acne?.rectangle ?? [];
  const acneCount = acneRects.length;
  const faceArea =
    faceRect && faceRect.width > 0 && faceRect.height > 0
      ? faceRect.width * faceRect.height
      : 1;
  const acneAreaSum = acneRects.reduce((sum, r) => sum + rectArea(r), 0);
  const percentageOfFace = Math.min(100, (acneAreaSum / faceArea) * 100);

  const poreKeys = [
    { key: 'pores_forehead' as const, name: '额头' },
    { key: 'pores_left_cheek' as const, name: '左颊' },
    { key: 'pores_right_cheek' as const, name: '右颊' },
    { key: 'pores_jaw' as const, name: '下颌' },
  ];
  const zonesWithPores: string[] = [];
  for (const { key, name } of poreKeys) {
    const item = result[key];
    if (item && 'value' in item && item.value === 1) zonesWithPores.push(name);
  }
  const poresPercentageOfZones = (zonesWithPores.length / 4) * 100;

  const blackheadSeverity = result.blackhead?.value ?? 0;
  const blackheadLabel = BLACKHEAD_LABELS[blackheadSeverity] ?? '无';

  const closedComedonesCount = result.closed_comedones?.rectangle?.length ?? 0;
  const moleCount = result.mole?.rectangle?.length ?? 0;
  const skinSpotCount = result.skin_spot?.rectangle?.length ?? 0;

  const darkCircleType = result.dark_circle?.value ?? 0;
  const darkCircleLabel = DARK_CIRCLE_LABELS[darkCircleType] ?? '无';

  const eyePouchPresent = result.eye_pouch?.value === 1;
  const eyePouchSeverity =
    eyePouchPresent && result.eye_pouch_severity?.value != null
      ? result.eye_pouch_severity.value
      : null;

  const wrinklesList = WRINKLE_IDS.map(({ key, label }) => {
    const item = result[key];
    const present = !!(item && 'value' in item && item.value === 1);
    let severity: number | undefined;
    if (key === 'nasolabial_fold' && present && result.nasolabial_fold_severity?.value != null) {
      severity = result.nasolabial_fold_severity.value;
    }
    return { id: key, label, present, severity };
  });

  const leftEyelid = result.left_eyelids?.value ?? 0;
  const rightEyelid = result.right_eyelids?.value ?? 0;
  const eyelids = {
    left: EYELID_LABELS[leftEyelid] ?? '单眼皮',
    right: EYELID_LABELS[rightEyelid] ?? '单眼皮',
  };

  const skinTypeDetails = result.skin_type?.details
    ? (result.skin_type.details as Record<string, { value: number; confidence: number }>)
    : undefined;

  let overallScore = 100;
  overallScore -= blackheadSeverity === 0 ? 0 : blackheadSeverity === 1 ? 5 : blackheadSeverity === 2 ? 10 : 15;
  overallScore -= Math.min(20, acneCount * 2);
  overallScore -= Math.min(10, closedComedonesCount * 1);
  overallScore -= Math.min(8, zonesWithPores.length * 2);
  overallScore -= Math.min(10, skinSpotCount * 2);
  overallScore -= Math.min(5, moleCount * 1);
  if (darkCircleType > 0) overallScore -= 5 + darkCircleType * 2;
  if (eyePouchPresent) overallScore -= 3 + (eyePouchSeverity ?? 0) * 2;
  const wrinkleCount = wrinklesList.filter((w) => w.present).length;
  const nasolabialSev = wrinklesList.find((w) => w.id === 'nasolabial_fold')?.severity ?? 0;
  overallScore -= Math.min(20, wrinkleCount * 2 + nasolabialSev * 2);
  if (sensitivity != null) overallScore -= Math.min(5, Math.floor(sensitivity.intensity / 20));
  overallScore = Math.max(0, Math.round(overallScore));

  const baseMorning = ['洁面', '爽肤水', '精华', '乳液', '防晒'];
  const baseEvening = ['卸妆', '洁面', '爽肤水', '精华', '面霜'];
  const baseWeekly = ['面膜'];
  const morning = [...baseMorning];
  const evening = [...baseEvening];
  const weekly = [...baseWeekly];
  if (skinTypeNum === 0) {
    morning.splice(morning.indexOf('乳液'), 1, '控油乳液');
    evening.splice(evening.indexOf('面霜'), 1, '控油面霜');
  } else if (skinTypeNum === 1) {
    morning.splice(morning.indexOf('乳液'), 1, '保湿乳液');
    evening.splice(evening.indexOf('面霜'), 1, '保湿面霜');
  } else if (skinTypeNum === 3) {
    morning.splice(morning.indexOf('乳液'), 1, '分区护理（T区控油、U区保湿）');
  }
  if (acneCount > 0) {
    morning.splice(morning.indexOf('精华'), 0, '祛痘精华');
    evening.splice(evening.indexOf('精华'), 0, '祛痘精华');
  }
  if (darkCircleType > 0) {
    morning.splice(morning.indexOf('精华'), 0, '眼霜');
    evening.splice(evening.indexOf('精华'), 0, '眼霜');
  }
  if (skinSpotCount > 0 || moleCount > 0) {
    morning.splice(morning.indexOf('精华'), 0, '美白/淡斑精华');
  }
  if (blackheadSeverity > 0) weekly.push('清洁面膜');

  const makeupStyles: Array<{ id: string; name: string; steps: string[] }> = [
    { id: '1', name: '日常', steps: ['保湿打底', '轻透底妆', '自然眉'] },
    { id: '2', name: '职场', steps: ['遮瑕', '哑光底妆', '大地色眼影'] },
    { id: '3', name: '约会', steps: ['提亮', '轻薄底妆', '粉色系眼唇'] },
  ];
  if (darkCircleType > 0) {
    makeupStyles[0].steps.splice(1, 0, '眼下遮瑕');
    makeupStyles[1].steps[0] = '眼下遮瑕 · 局部遮瑕';
  }
  if (acneCount > 0) makeupStyles[0].steps.splice(1, 0, '痘痘遮瑕');

  const dryConf = skinTypeDetails?.['1']?.confidence ?? 0;
  const oilyConf = skinTypeDetails?.['0']?.confidence ?? 0;
  const moisturePercent = Math.round(100 - dryConf * 50);
  const oilPercent = Math.round(oilyConf * 100);
  const poreHealthPercent = Math.round(100 - poresPercentageOfZones);
  const blackheadHealthPercent = Math.round(100 - (blackheadSeverity / 3) * 100);
  const acneHealthPercent = Math.max(0, Math.round(100 - acneCount * 10 - percentageOfFace));
  const spotHealthPercent = Math.max(0, Math.round(100 - skinSpotCount * 15));
  const wrinkleHealthPercent = Math.max(
    0,
    Math.round(100 - wrinkleCount * 15 - nasolabialSev * 10)
  );
  const sensitivityHealthPercent =
    sensitivity != null ? Math.max(0, Math.round(100 - sensitivity.intensity)) : undefined;
  const closedHealthPercent = Math.max(0, Math.round(100 - closedComedonesCount * 8));
  let eyeHealthPercent = 100;
  if (darkCircleType > 0) eyeHealthPercent -= 25 + darkCircleType * 10;
  if (eyePouchPresent) eyeHealthPercent -= 15 + (eyePouchSeverity ?? 0) * 10;
  eyeHealthPercent = Math.max(0, eyeHealthPercent);

  const indicators: Array<{ id: string; label: string; percent: number }> = [
    { id: 'moisture', label: '水分', percent: Math.max(0, Math.min(100, moisturePercent)) },
    { id: 'oil', label: '油分', percent: Math.max(0, Math.min(100, oilPercent)) },
    { id: 'pores', label: '毛孔', percent: Math.max(0, Math.min(100, poreHealthPercent)) },
    { id: 'blackhead', label: '黑头', percent: Math.max(0, Math.min(100, blackheadHealthPercent)) },
    { id: 'acne', label: '痘痘', percent: Math.max(0, Math.min(100, acneHealthPercent)) },
    { id: 'spots', label: '色斑', percent: Math.max(0, Math.min(100, spotHealthPercent)) },
    { id: 'wrinkles', label: '皱纹', percent: Math.max(0, Math.min(100, wrinkleHealthPercent)) },
    { id: 'closed', label: '闭口', percent: Math.max(0, Math.min(100, closedHealthPercent)) },
    { id: 'eye', label: '眼周', percent: Math.max(0, Math.min(100, eyeHealthPercent)) },
  ];
  if (sensitivityHealthPercent != null) {
    indicators.push({
      id: 'sensitivity',
      label: '敏感',
      percent: Math.max(0, Math.min(100, sensitivityHealthPercent)),
    });
  }

  return {
    overallScore,
    score: overallScore,
    skinType,
    skinColor,
    skinTone,
    skinToneITA,
    skinAge,
    faceRectangle: faceRect,
    warnings,
    sensitivity: sensitivity ?? undefined,
    redAreaMapBase64: redAreaMapBase64 ?? undefined,
    acne: { count: acneCount, percentageOfFace },
    pores: { zonesWithPores, percentageOfZones: poresPercentageOfZones },
    blackhead: { severity: blackheadSeverity, label: blackheadLabel },
    closedComedones: { count: closedComedonesCount },
    mole: { count: moleCount },
    skinSpot: { count: skinSpotCount },
    darkCircle: { type: darkCircleType, label: darkCircleLabel },
    eyePouch: { present: eyePouchPresent, severity: eyePouchSeverity },
    wrinkles: wrinklesList,
    eyelids,
    skinTypeDetails,
    skincareRoutine: { morning, evening, weekly },
    makeupStyles,
    indicators,
  };
}
