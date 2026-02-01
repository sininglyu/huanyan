/**
 * AILab Skin Analysis API client
 * Docs: https://ailabtools.mintlify.app/docs/ai-portrait/analysis/skin-analysis/api
 */

import FormData from 'form-data';

const AILAB_BASE_URL = 'https://www.ailabapi.com';

export interface AILabErrorDetail {
  status_code: number;
  code: string;
  code_message: string;
  message: string;
}

export interface AILabPublicResponse {
  request_id?: string;
  log_id?: string;
  error_code: number;
  error_msg?: string;
  error_detail?: AILabErrorDetail;
}

export interface AILabSkinTypeDetails {
  '0'?: { value: number; confidence: number };
  '1'?: { value: number; confidence: number };
  '2'?: { value: number; confidence: number };
  '3'?: { value: number; confidence: number };
}

export interface AILabResultItem {
  value: number;
  confidence: number;
}

export interface AILabSkinTypeResult {
  skin_type: number;
  details?: AILabSkinTypeDetails;
}

export interface AILabSkinAnalysisResult {
  left_eyelids?: AILabResultItem;
  right_eyelids?: AILabResultItem;
  eye_pouch?: AILabResultItem;
  dark_circle?: AILabResultItem;
  forehead_wrinkle?: AILabResultItem;
  crows_feet?: AILabResultItem;
  eye_finelines?: AILabResultItem;
  glabella_wrinkle?: AILabResultItem;
  nasolabial_fold?: AILabResultItem;
  skin_type?: AILabSkinTypeResult;
  pores_forehead?: AILabResultItem;
  pores_left_cheek?: AILabResultItem;
  pores_right_cheek?: AILabResultItem;
  pores_jaw?: AILabResultItem;
  blackhead?: AILabResultItem;
  acne?: AILabResultItem;
  mole?: AILabResultItem;
  skin_spot?: AILabResultItem;
}

export interface AILabSkinAnalysisResponse extends AILabPublicResponse {
  warning?: string[];
  face_rectangle?: { top: number; left: number; width: number; height: number };
  result?: AILabSkinAnalysisResult;
}

export class AILabError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly httpStatus: number,
    public readonly ailabCode?: string
  ) {
    super(message);
    this.name = 'AILabError';
  }
}

/** Map AILab error codes to our app error codes */
function mapAILabErrorToAppCode(ailabCode: string): string {
  const mapping: Record<string, string> = {
    ERROR_NO_FACE_IN_FILE: 'ANALYSIS_002',
    ERROR_FACE_NOT_FOUND: 'ANALYSIS_002',
    ERROR_INVALID_FILE: 'ANALYSIS_001',
    FILE_SIZE_EXCEEDS_LIMIT: 'ANALYSIS_001',
    ERROR_LOW_RESOLUTION: 'ANALYSIS_001',
    ERROR_SMALL_FACE_SIZE: 'ANALYSIS_001',
    ERROR_FACE_SIZE_NOT_MEET_REQUIREMENTS: 'ANALYSIS_001',
    ERROR_POOR_FACE_QUALITY: 'ANALYSIS_002',
    ERROR_BLURRY_FACE: 'ANALYSIS_002',
    ERROR_OBSTRUCTED_FACE: 'ANALYSIS_002',
    ERROR_NOT_ENOUGH_CREDITS: 'ANALYSIS_003',
    EXCEEDING_LIMITS: 'ANALYSIS_003',
    AI_SERVICE_FLOW_RESTRICTION: 'ANALYSIS_003',
  };
  return mapping[ailabCode] ?? 'ANALYSIS_003';
}

/**
 * Call AILab skin-analysis API with image buffer.
 * Image must be JPG/JPEG, max 2 MB.
 */
export async function callAILabSkinAnalysis(imageBuffer: Buffer): Promise<AILabSkinAnalysisResponse> {
  const apiKey = process.env.AILAB_API_KEY;
  if (!apiKey) {
    throw new AILabError('AILab API key not configured', 'ANALYSIS_003', 500);
  }

  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  const body = formData.getBuffer();
  const headers = {
    'ailabapi-api-key': apiKey,
    ...formData.getHeaders(),
  };

  const response = await fetch(`${AILAB_BASE_URL}/api/portrait/analysis/skin-analysis`, {
    method: 'POST',
    headers,
    body,
  });

  const data = (await response.json()) as AILabSkinAnalysisResponse;

  // AILab returns 200 even on business errors; check error_code
  if (data.error_code !== 0) {
    const detail = data.error_detail;
    const ailabCode = detail?.code ?? '';
    const message = detail?.code_message ?? detail?.message ?? data.error_msg ?? 'Skin analysis failed';
    const appCode = mapAILabErrorToAppCode(ailabCode);
    throw new AILabError(message, appCode, data.error_code || response.status, ailabCode);
  }

  // HTTP error but no parsed body
  if (!response.ok) {
    throw new AILabError(
      data.error_msg ?? `Request failed: ${response.statusText}`,
      'ANALYSIS_003',
      response.status
    );
  }

  if (!data.result) {
    throw new AILabError('No analysis result returned', 'ANALYSIS_003', 500);
  }

  return data;
}
