/**
 * Transform AILab skin-analysis API result into user-facing report format.
 */

import type { AILabSkinAnalysisResult, AILabResultItem } from './ailab';

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
