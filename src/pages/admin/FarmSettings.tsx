import { useFarmSettings } from "@/hooks/useFarmData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";

const settingsFields = [
  { section: "Growing Costs", fields: [
    { key: "soil_cost_per_tray", label: "Soil Cost / Tray", step: "0.01", prefix: "MAD" },
    { key: "seed_cost_default", label: "Default Seed Cost / Tray", step: "0.01", prefix: "MAD" },
    { key: "fertilizer_cost_per_tray", label: "Fertilizer / Tray", step: "0.01", prefix: "MAD" },
    { key: "water_cost_per_tray", label: "Water / Tray", step: "0.01", prefix: "MAD" },
    { key: "tray_cost", label: "Tray Cost", step: "0.01", prefix: "MAD" },
  ]},
  { section: "Energy", fields: [
    { key: "electricity_cost_per_kwh", label: "Electricity / kWh", step: "0.01", prefix: "MAD" },
    { key: "electricity_hours_per_day", label: "Light Hours / Day", step: "0.5" },
    { key: "light_cost_per_day", label: "Light Cost / Day", step: "0.01", prefix: "MAD" },
  ]},
  { section: "Labor", fields: [
    { key: "labor_rate_per_hour", label: "Labor Rate / Hour", step: "0.5", prefix: "MAD" },
    { key: "labor_minutes_per_tray", label: "Labor Minutes / Tray", step: "1" },
  ]},
  { section: "Packaging", fields: [
    { key: "clamshell_cost", label: "Clamshell Cost", step: "0.01", prefix: "MAD" },
    { key: "packaging_cost_per_unit", label: "Packaging / Unit", step: "0.01", prefix: "MAD" },
  ]},
  { section: "Overhead (Monthly)", fields: [
    { key: "rent_per_month", label: "Rent", step: "1", prefix: "MAD" },
    { key: "insurance_per_month", label: "Insurance", step: "1", prefix: "MAD" },
    { key: "misc_overhead_per_month", label: "Misc Overhead", step: "1", prefix: "MAD" },
  ]},
  { section: "Capacity", fields: [
    { key: "trays_per_rack", label: "Trays / Rack", step: "1" },
    { key: "racks_available", label: "Racks Available", step: "1" },
    { key: "target_monthly_revenue", label: "Target Monthly Revenue", step: "100", prefix: "MAD" },
  ]},
];

const FarmSettingsPage = () => {
  const { data: settings, isLoading, updateSettings } = useFarmSettings();
  const [form, setForm] = useState<Record<string, number>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      const f: Record<string, number> = {};
      settingsFields.forEach((s) => s.fields.forEach((field) => {
        f[field.key] = (settings as any)[field.key] ?? 0;
      }));
      setForm(f);
      setDirty(false);
    }
  }, [settings]);

  const handleChange = (key: string, value: number) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Settings saved");
      setDirty(false);
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-48 mb-6" /><div className="h-96 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-foreground">Farm Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Your real operational costs — used for all profit calculations</p>
        </div>
        {dirty && (
          <Button variant="hero" onClick={handleSave} disabled={updateSettings.isPending}>
            Save Changes
          </Button>
        )}
      </div>

      {settingsFields.map((section) => (
        <div key={section.section} className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground text-body mb-4">{section.section}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{field.prefix}</span>
                  )}
                  <Input
                    type="number"
                    step={field.step}
                    value={form[field.key] ?? 0}
                    onChange={(e) => handleChange(field.key, Number(e.target.value))}
                    className={field.prefix ? "pl-12" : ""}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FarmSettingsPage;
