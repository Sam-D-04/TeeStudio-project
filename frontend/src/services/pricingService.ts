import apiClient from "@/lib/apiClient";

export interface PricingConfiguration {
  id: number;
  roundingUnit: number;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  vatPercent: number;
}

export const pricingService = {
  /**
   * Fetch the current pricing configuration.
   */
  async getConfig(): Promise<PricingConfiguration> {
    const { data } = await apiClient.get<{ success: boolean; data: PricingConfiguration }>("/pricing/config");
    return data.data;
  },
};
