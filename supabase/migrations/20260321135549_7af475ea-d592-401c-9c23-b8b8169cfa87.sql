
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'manager', 'grower', 'viewer');

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- USER ROLES (create first so has_role can reference it)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FARMS
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage own farms" ON public.farms FOR ALL USING (auth.uid() = owner_id);
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FARM MEMBERS
CREATE TABLE public.farm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (farm_id, user_id)
);
ALTER TABLE public.farm_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm members can view memberships" ON public.farm_members FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Farm owners can manage members" ON public.farm_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);

-- FARM SETTINGS
CREATE TABLE public.farm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL UNIQUE,
  soil_cost_per_tray NUMERIC(10,4) DEFAULT 0.50,
  seed_cost_default NUMERIC(10,4) DEFAULT 1.00,
  electricity_cost_per_kwh NUMERIC(10,4) DEFAULT 0.12,
  electricity_hours_per_day NUMERIC(6,2) DEFAULT 16,
  labor_rate_per_hour NUMERIC(10,2) DEFAULT 15.00,
  labor_minutes_per_tray NUMERIC(6,2) DEFAULT 10,
  tray_cost NUMERIC(10,4) DEFAULT 0.75,
  clamshell_cost NUMERIC(10,4) DEFAULT 0.35,
  packaging_cost_per_unit NUMERIC(10,4) DEFAULT 0.10,
  fertilizer_cost_per_tray NUMERIC(10,4) DEFAULT 0.15,
  light_cost_per_day NUMERIC(10,4) DEFAULT 0.25,
  water_cost_per_tray NUMERIC(10,4) DEFAULT 0.05,
  rent_per_month NUMERIC(10,2) DEFAULT 0,
  insurance_per_month NUMERIC(10,2) DEFAULT 0,
  misc_overhead_per_month NUMERIC(10,2) DEFAULT 0,
  trays_per_rack INTEGER DEFAULT 4,
  racks_available INTEGER DEFAULT 4,
  target_monthly_revenue NUMERIC(12,2) DEFAULT 5000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage settings" ON public.farm_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE TRIGGER update_farm_settings_updated_at BEFORE UPDATE ON public.farm_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CROPS
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  variety TEXT,
  seed_cost_per_tray NUMERIC(10,4),
  seed_weight_per_tray_grams NUMERIC(8,2),
  soak_hours INTEGER DEFAULT 0,
  blackout_days INTEGER DEFAULT 0,
  grow_days INTEGER DEFAULT 7,
  expected_yield_oz_per_tray NUMERIC(8,2) DEFAULT 8,
  shelf_life_days INTEGER DEFAULT 7,
  selling_price_per_oz NUMERIC(10,2) DEFAULT 2.00,
  selling_price_per_clamshell NUMERIC(10,2) DEFAULT 4.00,
  clamshell_size_oz NUMERIC(6,2) DEFAULT 2,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage crops" ON public.crops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE INDEX idx_crops_farm_active ON public.crops(farm_id, is_active);
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MIXES
CREATE TABLE public.mixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  selling_price_per_oz NUMERIC(10,2),
  selling_price_per_clamshell NUMERIC(10,2),
  clamshell_size_oz NUMERIC(6,2) DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage mixes" ON public.mixes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE TRIGGER update_mixes_updated_at BEFORE UPDATE ON public.mixes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MIX INGREDIENTS
CREATE TABLE public.mix_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id UUID REFERENCES public.mixes(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE public.mix_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mix ingredients follow mix access" ON public.mix_ingredients FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.mixes m
    JOIN public.farms f ON f.id = m.farm_id
    WHERE m.id = mix_id AND f.owner_id = auth.uid()
  )
);

-- CUSTOMERS
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'individual',
  email TEXT,
  phone TEXT,
  address TEXT,
  delivery_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage customers" ON public.customers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  order_number TEXT,
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'pending',
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE INDEX idx_orders_farm_date ON public.orders(farm_id, order_date);
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id),
  mix_id UUID REFERENCES public.mixes(id),
  quantity_oz NUMERIC(10,2),
  quantity_clamshells INTEGER,
  unit_price NUMERIC(10,2),
  line_total NUMERIC(10,2)
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items follow order access" ON public.order_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.farms f ON f.id = o.farm_id
    WHERE o.id = order_id AND f.owner_id = auth.uid()
  )
);

-- INVENTORY
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id),
  mix_id UUID REFERENCES public.mixes(id),
  quantity_oz NUMERIC(10,2) DEFAULT 0,
  quantity_trays INTEGER DEFAULT 0,
  harvested_date DATE,
  expires_date DATE,
  status TEXT DEFAULT 'growing',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage inventory" ON public.inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE INDEX idx_inventory_farm_status ON public.inventory(farm_id, status);

-- PRODUCTION PLANS
CREATE TABLE public.production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.production_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage plans" ON public.production_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE TRIGGER update_production_plans_updated_at BEFORE UPDATE ON public.production_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTION PLAN ITEMS
CREATE TABLE public.production_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.production_plans(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id),
  mix_id UUID REFERENCES public.mixes(id),
  trays_planned INTEGER DEFAULT 1,
  plant_date DATE,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  actual_yield_oz NUMERIC(10,2),
  status TEXT DEFAULT 'planned',
  notes TEXT
);
ALTER TABLE public.production_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plan items follow plan access" ON public.production_plan_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.production_plans pp
    JOIN public.farms f ON f.id = pp.farm_id
    WHERE pp.id = plan_id AND f.owner_id = auth.uid()
  )
);

-- TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage tasks" ON public.tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE INDEX idx_tasks_farm_status ON public.tasks(farm_id, status, due_date);

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can view logs" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Authenticated can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_activity_logs_farm ON public.activity_logs(farm_id, created_at DESC);

-- SUPPLIES
CREATE TABLE public.supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  unit TEXT DEFAULT 'each',
  quantity_on_hand NUMERIC(10,2) DEFAULT 0,
  cost_per_unit NUMERIC(10,4) DEFAULT 0,
  reorder_point NUMERIC(10,2) DEFAULT 0,
  supplier TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm owners can manage supplies" ON public.supplies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON public.supplies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create farm settings when farm is created
CREATE OR REPLACE FUNCTION public.handle_new_farm()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.farm_settings (farm_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_farm_created AFTER INSERT ON public.farms FOR EACH ROW EXECUTE FUNCTION public.handle_new_farm();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || SUBSTR(NEW.id::text, 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
