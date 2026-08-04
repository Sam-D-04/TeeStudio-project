import api from "./admin/api";

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
    const { data } = await api.get<{ success: boolean; data: PricingConfiguration }>("/pricing/config");
    return data.data;
  },
};
