import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import { Step2AutoFillRequest, Step2AutoFillResponse } from './types/ai.types';

class AIBackendService extends BaseApiService {
  protected baseEndpoint = '/AI';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true,
    });
  }

  async autocompletarStep2(
    request: Step2AutoFillRequest
  ): Promise<ApiResponse<Step2AutoFillResponse>> {
    const url = `${this.baseEndpoint}/anthropic/step2/autocompletar`;
    return await this.post<Step2AutoFillResponse>(url, request);
  }
}

export const aiBackendService = new AIBackendService();