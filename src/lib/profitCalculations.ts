import type { Database } from "@/integrations/supabase/types";

type FarmSettings = Database["public"]["Tables"]["farm_settings"]["Row"];
type Crop = Database["public"]["Tables"]["crops"]["Row"];

export interface CropProfit {
  cropId: string;
  cropName: string;
  variety: string | null;
  costPerTray: number;
  revenuePerTray: number;
  profitPerTray: number;
  marginPercent: number;
  costPerClamshell: number;
  revenuePerClamshell: number;
  profitPerClamshell: number;
  totalGrowDays: number;
}

export function calculateCropProfit(crop: Crop, settings: FarmSettings): CropProfit {
  const seedCost = crop.seed_cost_per_tray ?? settings.seed_cost_default ?? 1;
  const soilCost = settings.soil_cost_per_tray ?? 0.5;
  const trayCost = settings.tray_cost ?? 0.75;
  const fertilizerCost = settings.fertilizer_cost_per_tray ?? 0.15;
  const waterCost = settings.water_cost_per_tray ?? 0.05;
  const laborRate = settings.labor_rate_per_hour ?? 15;
  const laborMinutes = settings.labor_minutes_per_tray ?? 10;
  const laborCost = (laborRate * laborMinutes) / 60;

  const totalGrowDays = (crop.soak_hours ?? 0) / 24 + (crop.blackout_days ?? 0) + (crop.grow_days ?? 7);
  const lightCostPerDay = settings.light_cost_per_day ?? 0.25;
  const lightCost = lightCostPerDay * (crop.grow_days ?? 7);
  const electricityCost =
    (settings.electricity_cost_per_kwh ?? 0.12) *
    (settings.electricity_hours_per_day ?? 16) *
    totalGrowDays / 100; // rough approx per tray

  const packagingCost = settings.packaging_cost_per_unit ?? 0.1;
  const clamshellCost = settings.clamshell_cost ?? 0.35;

  const costPerTray =
    seedCost + soilCost + trayCost + fertilizerCost + waterCost + laborCost + lightCost + electricityCost + packagingCost;

  const yieldOz = crop.expected_yield_oz_per_tray ?? 8;
  const pricePerOz = crop.selling_price_per_oz ?? 2;
  const revenuePerTray = yieldOz * pricePerOz;
  const profitPerTray = revenuePerTray - costPerTray;
  const marginPercent = revenuePerTray > 0 ? (profitPerTray / revenuePerTray) * 100 : 0;

  const clamshellSizeOz = crop.clamshell_size_oz ?? 2;
  const clamshellsPerTray = clamshellSizeOz > 0 ? yieldOz / clamshellSizeOz : 1;
  const costPerClamshell = costPerTray / clamshellsPerTray + clamshellCost;
  const revenuePerClamshell = crop.selling_price_per_clamshell ?? pricePerOz * clamshellSizeOz;
  const profitPerClamshell = revenuePerClamshell - costPerClamshell;

  return {
    cropId: crop.id,
    cropName: crop.name,
    variety: crop.variety,
    costPerTray: Math.round(costPerTray * 100) / 100,
    revenuePerTray: Math.round(revenuePerTray * 100) / 100,
    profitPerTray: Math.round(profitPerTray * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
    costPerClamshell: Math.round(costPerClamshell * 100) / 100,
    revenuePerClamshell: Math.round(revenuePerClamshell * 100) / 100,
    profitPerClamshell: Math.round(profitPerClamshell * 100) / 100,
    totalGrowDays: Math.round(totalGrowDays * 10) / 10,
  };
}

export function calculateMonthlyProjection(
  profits: CropProfit[],
  traysPerCropPerMonth: number,
  settings: FarmSettings
) {
  const totalRevenue = profits.reduce((sum, p) => sum + p.revenuePerTray * traysPerCropPerMonth, 0);
  const totalCost = profits.reduce((sum, p) => sum + p.costPerTray * traysPerCropPerMonth, 0);
  const overhead = (settings.rent_per_month ?? 0) + (settings.insurance_per_month ?? 0) + (settings.misc_overhead_per_month ?? 0);
  const totalProfit = totalRevenue - totalCost - overhead;
  const totalTrays = profits.length * traysPerCropPerMonth;
  const traysPerRack = settings.trays_per_rack ?? 4;
  const racksNeeded = Math.ceil(totalTrays / traysPerRack);

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    overhead: Math.round(overhead * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    margin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0,
    totalTrays,
    racksNeeded,
  };
}
