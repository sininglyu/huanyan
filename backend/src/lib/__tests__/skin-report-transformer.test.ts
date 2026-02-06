/**
 * Unit tests for transformAdvancedToReport.
 * Run with: npx tsx src/lib/__tests__/skin-report-transformer.test.ts
 */

import assert from 'node:assert';
import { transformAdvancedToReport } from '../skin-report-transformer';
import type { AILabSkinAnalysisAdvancedResult } from '../ailab';

function createMinimalResult(overrides: Partial<AILabSkinAnalysisAdvancedResult> = {}): AILabSkinAnalysisAdvancedResult {
  return {
    skin_type: { skin_type: 2, details: { '0': { value: 0, confidence: 0.1 }, '1': { value: 0, confidence: 0.1 }, '2': { value: 1, confidence: 0.9 }, '3': { value: 0, confidence: 0.1 } } },
    skin_color: { value: 2, confidence: 0.9 },
    skin_age: { value: 28 },
    skin_hue_ha: { skintone: 1 },
    left_eyelids: { value: 1, confidence: 0.9 },
    right_eyelids: { value: 1, confidence: 0.9 },
    eye_pouch: { value: 0, confidence: 0.9 },
    dark_circle: { value: 0, confidence: 0.9 },
    forehead_wrinkle: { value: 0, confidence: 0.9 },
    crows_feet: { value: 0, confidence: 0.9 },
    eye_finelines: { value: 0, confidence: 0.9 },
    glabella_wrinkle: { value: 0, confidence: 0.9 },
    nasolabial_fold: { value: 0, confidence: 0.9 },
    pores_forehead: { value: 0, confidence: 1 },
    pores_left_cheek: { value: 0, confidence: 1 },
    pores_right_cheek: { value: 0, confidence: 1 },
    pores_jaw: { value: 0, confidence: 1 },
    blackhead: { value: 0, confidence: 1 },
    acne: { rectangle: [] },
    closed_comedones: { rectangle: [] },
    mole: { rectangle: [] },
    skin_spot: { rectangle: [] },
    ...overrides,
  };
}

function runTests() {
  // No issues -> high score
  const minimal = createMinimalResult();
  const reportMinimal = transformAdvancedToReport(minimal, null, null);
  assert.ok(reportMinimal.overallScore >= 85 && reportMinimal.overallScore <= 100, 'score should be high when no issues');
  assert.strictEqual(reportMinimal.skinType, '中性');
  assert.strictEqual(reportMinimal.skinColor, '自然');
  assert.strictEqual(reportMinimal.acne.count, 0);
  assert.strictEqual(reportMinimal.pores.zonesWithPores.length, 0);
  assert.strictEqual(reportMinimal.blackhead.severity, 0);
  assert.ok(Array.isArray(reportMinimal.indicators) && reportMinimal.indicators!.length >= 9);
  assert.ok(reportMinimal.wrinkles.length === 5);

  // With issues -> lower score
  const withIssues = createMinimalResult({
    blackhead: { value: 2, confidence: 0.9 },
    acne: { rectangle: [{ width: 10, height: 10, left: 0, top: 0 }, { width: 10, height: 10, left: 20, top: 20 }] },
    pores_forehead: { value: 1, confidence: 1 },
    pores_left_cheek: { value: 1, confidence: 1 },
    dark_circle: { value: 1, confidence: 0.9 },
    nasolabial_fold: { value: 1, confidence: 0.9 },
    nasolabial_fold_severity: { value: 1, confidence: 0.9 },
  });
  const reportIssues = transformAdvancedToReport(withIssues, { top: 0, left: 0, width: 100, height: 100 }, null);
  assert.ok(reportIssues.overallScore < reportMinimal.overallScore);
  assert.strictEqual(reportIssues.acne.count, 2);
  assert.strictEqual(reportIssues.pores.zonesWithPores.length, 2);
  assert.strictEqual(reportIssues.blackhead.severity, 2);
  assert.strictEqual(reportIssues.darkCircle.type, 1);
  assert.ok(reportIssues.wrinkles.some((w) => w.id === 'nasolabial_fold' && w.present && w.severity === 1));

  // Optional fields absent
  const noOptional = createMinimalResult();
  const reportNoOpt = transformAdvancedToReport(noOptional, null, []);
  assert.ok(reportNoOpt.faceRectangle === undefined);
  assert.deepStrictEqual(reportNoOpt.warnings, []);
  assert.ok(reportNoOpt.sensitivity === undefined || reportNoOpt.sensitivity == null);
  assert.ok(reportNoOpt.redAreaMapBase64 === undefined || reportNoOpt.redAreaMapBase64 == null);

  // Face rectangle and warning pass-through
  const withTopLevel = createMinimalResult();
  const reportTop = transformAdvancedToReport(
    withTopLevel,
    { top: 10, left: 20, width: 200, height: 250 },
    ['imporper_headpose']
  );
  assert.deepStrictEqual(reportTop.faceRectangle, { top: 10, left: 20, width: 200, height: 250 });
  assert.deepStrictEqual(reportTop.warnings, ['imporper_headpose']);

  console.log('All transformer tests passed.');
}

runTests();
