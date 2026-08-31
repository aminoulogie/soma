// ============================================================================
// SOMA SMART COACH & RECOVERY HUD PRO (v3.4.0 UNIFIED ENGINE)
// ============================================================================

const { Plugin, Modal, Notice, requestUrl, PluginSettingTab, Setting, setIcon, MarkdownRenderChild } = require("obsidian");

const HISTORY_FILE_PATH = "apps/scripts/soma-history.json";
const CUSTOM_EX_FILE_PATH = "apps/scripts/custom-exercises.json";
const SETTINGS_FILE_PATH = "apps/scripts/soma-settings.json";
const NUTRITION_FILE_PATH = "apps/scripts/soma-nutrition.json";
const CUSTOM_FOODS_FILE = "apps/scripts/custom-foods.json";
const DATA_FILE_PATH = "apps/scripts/soma-data.json";
const REGISTRY_FILE_PATH = "apps/scripts/muscleRegistry.json";
const WEEKLY_FILE_PATH = "apps/scripts/weekly-gym-data.json";
const HABITS_FILE_PATH = "apps/scripts/soma-habits.json";

function getLocalDateKey(dateObj = new Date()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDateKey(dateKeyStr) {
  if (!dateKeyStr || typeof dateKeyStr !== "string") return new Date();
  const parts = dateKeyStr.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

// ============================================================================
// SECTION 1: MASTER BIOMECHANICS & NUTRITION DATABASES
// ============================================================================

const DEFAULT_GOALS = {
  cals: 2400,
  protein: 160,
  carbs: 260,
  fat: 70,
  water: 3500,
  fiber: 35,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 3500,
  sodium: 2300,
  zinc: 11
};

const BASE_FOOD_LIBRARY = [
  { name: "Whole Eggs", serving: 100, unit: "g", cals: 143, p: 13.0, c: 0.7, f: 9.9, fiber: 0, sodium: 142, potassium: 138, calcium: 56, iron: 1.8, magnesium: 12, zinc: 1.3, isBase: true, usageCount: 15 },
  { name: "Chicken Breast (Cooked)", serving: 100, unit: "g", cals: 165, p: 31.0, c: 0.0, f: 3.6, fiber: 0, sodium: 74, potassium: 256, calcium: 15, iron: 1.0, magnesium: 29, zinc: 1.0, isBase: true, usageCount: 20 },
  { name: "White Rice (Cooked)", serving: 150, unit: "g", cals: 195, p: 4.1, c: 43.0, f: 0.4, fiber: 0.6, sodium: 1, potassium: 55, calcium: 16, iron: 1.8, magnesium: 19, zinc: 0.8, isBase: true, usageCount: 18 },
  { name: "Egg Whites", serving: 100, unit: "g", cals: 52, p: 11.0, c: 0.7, f: 0.2, fiber: 0, sodium: 166, potassium: 163, calcium: 7, iron: 0.1, magnesium: 11, zinc: 0.0, isBase: true, usageCount: 12 },
  { name: "Oatmeal (Dry)", serving: 50, unit: "g", cals: 190, p: 6.5, c: 34.0, f: 3.5, fiber: 5.0, sodium: 2, potassium: 180, calcium: 26, iron: 2.1, magnesium: 69, zinc: 1.5, isBase: true, usageCount: 14 },
  { name: "Whey Protein Isolate", serving: 30, unit: "g", cals: 120, p: 25.0, c: 1.5, f: 1.0, fiber: 0, sodium: 140, potassium: 160, calcium: 130, iron: 0.4, magnesium: 20, zinc: 0.5, isBase: true, usageCount: 16 },
  { name: "Greek / Plain Yogurt", serving: 150, unit: "g", cals: 90, p: 15.0, c: 5.0, f: 0.5, fiber: 0, sodium: 55, potassium: 210, calcium: 165, iron: 0.1, magnesium: 17, zinc: 0.9, isBase: true, usageCount: 10 },
  { name: "Canned Tuna (Drained)", serving: 120, unit: "g", cals: 130, p: 29.0, c: 0.0, f: 1.0, fiber: 0, sodium: 380, potassium: 280, calcium: 12, iron: 1.6, magnesium: 34, zinc: 0.9, isBase: true, usageCount: 11 },
  { name: "Pasta (Dry)", serving: 80, unit: "g", cals: 280, p: 10.0, c: 58.0, f: 1.2, fiber: 2.5, sodium: 5, potassium: 180, calcium: 18, iron: 1.4, magnesium: 42, zinc: 1.1, isBase: true, usageCount: 8 },
  { name: "Olive Oil", serving: 14, unit: "g", cals: 120, p: 0.0, c: 0.0, f: 14.0, fiber: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0.1, magnesium: 0, zinc: 0.0, isBase: true, usageCount: 9 },
  { name: "Peanut Butter", serving: 32, unit: "g", cals: 190, p: 8.0, c: 7.0, f: 16.0, fiber: 2.0, sodium: 140, potassium: 210, calcium: 14, iron: 0.6, magnesium: 54, zinc: 0.9, isBase: true, usageCount: 6 },
  { name: "Banana", serving: 118, unit: "g", cals: 105, p: 1.3, c: 27.0, f: 0.3, fiber: 3.1, sodium: 1, potassium: 422, calcium: 6, iron: 0.3, magnesium: 32, zinc: 0.2, isBase: true, usageCount: 10 }
];

const BASE_EXERCISE_DB = [
  // CHEST
  { name: "Incline Dumbbell Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Incline Barbell Bench", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Smith Machine Incline Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Low-to-High Cable Fly", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "High-to-Low Cable Fly", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Flat Barbell Bench Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Flat Dumbbell Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Pec Deck Fly (Machine)", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bodyweight Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Weighted Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Machine Chest Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },

  // BACK
  { name: "Bodyweight Pull-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back", "biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Weighted Pull-ups / Chin-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back", "biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Lat Pulldown (Wide/Neutral)", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Single-Arm Lat Cable Row", muscle: "Back", subTarget: "Lats (Iliac / Lower)", targetKeys: ["upper_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Single-Arm Dumbbell Row", muscle: "Back", subTarget: "Lats & Upper Back", targetKeys: ["upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back / Rhomboids", targetKeys: ["trapezius_back", "upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Meadows Row", muscle: "Back", subTarget: "Upper Lats & Teres Major", targetKeys: ["upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Barbell Bent-Over Row", muscle: "Back", subTarget: "Upper Back / Lats", targetKeys: ["upper_back", "trapezius_back", "lower_back"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Seated Cable Row (Wide)", muscle: "Back", subTarget: "Upper Back / Mid-Traps", targetKeys: ["trapezius_back", "upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Barbell Deadlift", muscle: "Back", subTarget: "Erectors / Posterior Chain", targetKeys: ["lower_back", "hamstring", "gluteal"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },

  // SHOULDERS
  { name: "Standing Overhead Press (OHP)", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps", "triceps_back"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Machine Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Cable Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Cable Y-Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Dumbbell Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Face Pulls", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back", "trapezius_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Reverse Pec Deck", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },

  // ARMS
  { name: "Standing Barbell / EZ-Bar Curl", muscle: "Biceps", subTarget: "Overall Biceps", targetKeys: ["biceps"], position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Dumbbell Preacher Curl", muscle: "Biceps", subTarget: "Short Head (Inner)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "One-Arm Dumbbell Preacher Curl", muscle: "Biceps", subTarget: "Short Head (Inner / Unilateral)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Incline Dumbbell Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bayesian Cable Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Hammer Curl (Dumbbell/Cable)", muscle: "Biceps", subTarget: "Brachialis & Forearms", targetKeys: ["biceps"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "EZ Bar Skullcrusher", muscle: "Triceps", subTarget: "Long & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Standing Low Pulley Overhead Tricep Extension", muscle: "Triceps", subTarget: "Long Head (Lengthened)", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Lateral & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },

  // LEGS & CALVES
  { name: "Hack Squat", muscle: "Legs", subTarget: "Quads (Knee Extensors)", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Barbell Back Squat", muscle: "Legs", subTarget: "Quads & Glutes", targetKeys: ["quadriceps", "gluteal", "lower_back"], position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Leg Press", muscle: "Legs", subTarget: "Quads & Adductors", targetKeys: ["quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Leg Extensions", muscle: "Legs", subTarget: "Rectus Femoris", targetKeys: ["quadriceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["gluteal", "quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Romanian Deadlift (DB/Barbell)", muscle: "Legs", subTarget: "Hamstrings (Lengthened)", targetKeys: ["hamstring", "gluteal", "lower_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: true, isBW: false },
  { name: "Seated Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Knee Flexion)", targetKeys: ["hamstring"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Lying Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Shortened)", targetKeys: ["hamstring"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Barbell / Machine Hip Thrust", muscle: "Legs", subTarget: "Glutes (Maximus)", targetKeys: ["gluteal"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Standing Machine Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Seated Calf Raise Machine", muscle: "Legs", subTarget: "Calves (Soleus)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false }
];

const ROUTINE_PRESETS = {
  "Legs A (Quad / Squat Dominant)": [
    { name: "Hack Squat" },
    { name: "Romanian Deadlift (DB/Barbell)" },
    { name: "Leg Extensions" },
    { name: "Seated Leg Curl" },
    { name: "Standing Machine Calf Raise" }
  ],
  "Push B (Hypertrophy & Long Muscle Length)": [
    { name: "Smith Machine Incline Press" },
    { name: "Pec Deck Fly (Machine)" },
    { name: "Machine Shoulder Press" },
    { name: "Cable Y-Raise" },
    { name: "Cable Triceps Pushdown (Straight/V)" },
    { name: "Weighted Chest Dips" }
  ],
  "Pull B (Back Width & Arm Bias)": [
    { name: "Single-Arm Lat Cable Row" },
    { name: "Seated Cable Row (Wide)" },
    { name: "Reverse Pec Deck" },
    { name: "Bayesian Cable Curl" },
    { name: "Hammer Curl (Dumbbell/Cable)" }
  ],
  "Legs B (Posterior Chain & Glute Bias)": [
    { name: "Romanian Deadlift (DB/Barbell)" },
    { name: "Leg Press" },
    { name: "Lying Leg Curl" },
    { name: "Barbell / Machine Hip Thrust" },
    { name: "Seated Calf Raise Machine" }
  ],
  "Upper A (Chest/Back/Shoulder Focus)": [
    { name: "Incline Dumbbell Press" },
    { name: "Chest-Supported T-Bar Row" },
    { name: "Cable Lateral Raise" },
    { name: "Lat Pulldown (Wide/Neutral)" },
    { name: "Standing Low Pulley Overhead Tricep Extension" },
    { name: "One-Arm Dumbbell Preacher Curl" }
  ],
  "Rest & Active Recovery": []
};

const ROTATION_SEQUENCE = [
  "Legs A (Quad / Squat Dominant)",
  "Push B (Hypertrophy & Long Muscle Length)",
  "Pull B (Back Width & Arm Bias)",
  "Legs B (Posterior Chain & Glute Bias)",
  "Upper A (Chest/Back/Shoulder Focus)",
  "Rest & Active Recovery"
];

// ============================================================
// SECTION 2: PROGRESSIVE OVERLOAD & PERIODIZATION ENGINES
// ============================================================

class SomaIntelligenceEngine {
  static calculate1RM(weight, reps) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    const epley = w * (1 + r / 30);
    const brzycki = r < 37 ? w * (36 / (37 - r)) : epley;
    return Math.round(((epley + brzycki) / 2) * 10) / 10;
  }

  static calculateWorkVolume(weight, reps, isBW = false, userBodyweight = 75) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (isBW && w === 0) return Math.round((userBodyweight * 0.65) * r);
    return Math.round(w * r);
  }

  static calculateCaloriesBurned(minutes, totalVolumeKg, totalSets, avgIntensity = 3) {
    const baseBurnPerMin = 6.0;
    const intensityMultiplier = 0.8 + (avgIntensity * 0.12);
    const volumeBonus = totalVolumeKg * 0.0055;
    return Math.max(20, Math.round((minutes * baseBurnPerMin * intensityMultiplier) + volumeBonus));
  }

  static calculatePlateStack(targetWeight, barWeight = 20, unit = "kg") {
    let perSide = (parseFloat(targetWeight) - barWeight) / 2;
    if (perSide <= 0) return [];
    const plateTypes = unit === "kg"
      ? [
          { weight: 25, color: "#ef4444" },
          { weight: 20, color: "#3b82f6" },
          { weight: 15, color: "#eab308" },
          { weight: 10, color: "#10b981" },
          { weight: 5,  color: "#ffffff" },
          { weight: 2.5,color: "#64748b" },
          { weight: 1.25,color: "#94a3b8" }
        ]
      : [
          { weight: 45, color: "#3b82f6" },
          { weight: 35, color: "#eab308" },
          { weight: 25, color: "#10b981" },
          { weight: 10, color: "#ffffff" },
          { weight: 5,  color: "#64748b" }
        ];

    const EPSILON = 0.001;
    const plates = [];
    for (const p of plateTypes) {
      while (perSide - p.weight >= -EPSILON) {
        plates.push(p);
        perSide -= p.weight;
        if (perSide < EPSILON) perSide = 0;
      }
    }
    return plates;
  }

  static calculateWarmupRamp(targetWeight, barWeight = 20, unit = "kg") {
    const target = parseFloat(targetWeight) || 0;
    const percentages = [0.4, 0.6, 0.8];
    return percentages.map(pct => {
      let raw = target * pct;
      // Round to nearest achievable increment (2.5kg / 5lb) so the ramp is loadable
      const increment = unit === "kg" ? 2.5 : 5;
      let rounded = Math.round(raw / increment) * increment;
      if (rounded < barWeight) rounded = barWeight;
      return {
        pct: Math.round(pct * 100),
        weight: rounded,
        plates: this.calculatePlateStack(rounded, barWeight, unit)
      };
    });
  }

  static computeOverloadRecommendation(lastSet, isBW = false) {
    if (!lastSet) {
      return isBW
        ? { weight: 0, reps: 10, note: "BW Baseline Start", diffTier: "New" }
        : { weight: 20, reps: 10, note: "Baseline Start (Empty Bar / Light)", diffTier: "New" };
    }

    const lastW = parseFloat(lastSet.weight) || 0;
    const lastR = parseInt(lastSet.reps) || (isBW ? 10 : 8);
    const lastFail = parseInt(lastSet.failure) || 3;

    if (lastFail === 1) {
      if (isBW && lastW === 0) {
        return { weight: 0, reps: lastR + 2, note: `+2 Reps Target (Level 1 Easy RPE • Hit ${lastR}r)`, diffTier: "Lvl 1 (Surge)" };
      }
      return { weight: lastW + 5.0, reps: Math.max(8, lastR - 2), note: `+5.0kg Aggressive Load Surge (Level 1 RPE)`, diffTier: "Lvl 1 (Surge)" };
    } else if (lastFail === 2) {
      if (isBW && lastW === 0) {
        return { weight: 0, reps: lastR + 1, note: `+1 Rep Target (Level 2 Primed RPE)`, diffTier: "Lvl 2 (Overload)" };
      }
      return { weight: lastW + 2.5, reps: Math.max(8, lastR - 1), note: `+2.5kg Load Overload (Level 2 RPE • Previous: ${lastW}kg)`, diffTier: "Lvl 2 (Overload)" };
    } else if (lastFail === 3) {
      if (lastR >= 12 && !isBW) {
        return { weight: lastW + 2.5, reps: 8, note: `+2.5kg Step-Up (Reached 12-Rep Ceiling)`, diffTier: "Lvl 3 (Target)" };
      }
      return { weight: lastW, reps: lastR + 1, note: `+1 Rep Consolidation (Target: ${lastR + 1}r @ ${lastW > 0 ? lastW + 'kg' : 'BW'})`, diffTier: "Lvl 3 (Target)" };
    } else {
      return { weight: lastW, reps: lastR, note: `Hold Load & Solidify Form (Consolidate @ ${lastW > 0 ? lastW + 'kg' : 'BW'})`, diffTier: "Lvl 4-5 (Hold)" };
    }
  }

  static getProgramProjectedDay(targetDateObj, scheduleOverrides = {}) {
    const anchorDate = new Date(2026, 7, 23, 12, 0, 0); // Aligned to Aug 23 Base Anchor
    const targetMidday = new Date(targetDateObj.getFullYear(), targetDateObj.getMonth(), targetDateObj.getDate(), 12, 0, 0);
    const dateKey = getLocalDateKey(targetMidday);

    if (scheduleOverrides && scheduleOverrides[dateKey]) {
      const customSplit = scheduleOverrides[dateKey];
      const isRest = customSplit.toLowerCase().includes("rest");
      return { split: customSplit, phase: "Custom Schedule Alignment", phaseBadge: "User Overridden", repScheme: "8–12 Reps • 2–3 RIR", isDeload: false, isRest };
    }

    const diffTime = targetMidday.getTime() - anchorDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(1, Math.floor(diffDays / 7) + 1);

    let phase = "Mesocycle 1: Hypertrophy Foundation";
    let phaseBadge = `Meso 1 (W${totalWeeks}) • Base`;
    let repScheme = "8–12 Reps • 2–3 RIR";
    let isDeload = false;

    if (totalWeeks === 9 || totalWeeks === 18) {
      phase = "Deload & Connective Recovery";
      phaseBadge = "Deload Week • 50% Sets";
      repScheme = "8–10 Reps • 4–5 RIR";
      isDeload = true;
    } else if (totalWeeks >= 10 && totalWeeks <= 17) {
      phase = "Mesocycle 2: Strength & Load Progression";
      phaseBadge = `Meso 2 (W${totalWeeks - 9}) • Strength`;
      repScheme = "5–8 Reps • 1–2 RIR";
    }

    const seqLen = ROTATION_SEQUENCE.length;
    const seqIndex = ((diffDays % seqLen) + seqLen) % seqLen;
    const splitName = ROTATION_SEQUENCE[seqIndex];
    const isRest = splitName.toLowerCase().includes("rest");

    return { split: splitName, phase, phaseBadge, repScheme, isDeload, isRest, weekNumber: totalWeeks };
  }

  static detectPersonalRecords(history, currentExerciseName, newWeight, newReps) {
    const w = parseFloat(newWeight) || 0;
    const r = parseInt(newReps) || 0;
    if (w <= 0 || r <= 0) return null;

    const currentEst1RM = this.calculate1RM(w, r);
    let maxPreviousWeight = 0;
    let maxPreviousRepsAtWeight = 0;
    let maxPreviousEst1RM = 0;

    for (const session of Object.values(history || {})) {
      for (const ex of session.exercises || []) {
        if (ex.name && ex.name.toLowerCase() === currentExerciseName.toLowerCase()) {
          for (const s of ex.sets || []) {
            if (s.done) {
              const rawW = parseFloat(s.weight) || 0;
              const prevW = (ex.usesBar && rawW > 0) ? (ex.barWeight || 20) + rawW : rawW;
              const prevR = parseInt(s.reps) || 0;
              if (prevW > maxPreviousWeight) maxPreviousWeight = prevW;
              if (prevW === w && prevR > maxPreviousRepsAtWeight) maxPreviousRepsAtWeight = prevR;
              const est = this.calculate1RM(prevW, prevR);
              if (est > maxPreviousEst1RM) maxPreviousEst1RM = est;
            }
          }
        }
      }
    }

    const isWeightPR = maxPreviousWeight > 0 && w > maxPreviousWeight;
    const isRepPR = maxPreviousRepsAtWeight > 0 && r > maxPreviousRepsAtWeight;
    const isEst1RMPR = maxPreviousEst1RM > 0 && currentEst1RM > maxPreviousEst1RM;

    if (isWeightPR || isRepPR || isEst1RMPR) {
      return { isWeightPR, isRepPR, isEst1RMPR, weight: w, reps: r, est1RM: currentEst1RM, prev1RM: maxPreviousEst1RM };
    }
    return null;
  }
}

// ============================================================
// SECTION 3: AUDIO SYNTHESIZER & CELEBRATION ENGINE
// ============================================================

class SomaAudioCelebration {
  static playSound(type = "chime") {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "chime") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "pr") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch (e) {}
  }

  static triggerConfetti(containerEl) {
    try {
      const canvas = document.createElement("canvas");
      canvas.className = "soma-confetti-canvas";
      containerEl.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      canvas.width = containerEl.clientWidth || 600;
      canvas.height = containerEl.clientHeight || 700;

      const particles = [];
      const colors = ["#10b981", "#f59e0b", "#e5e7eb", "#9ca3af", "#34d399", "#60a5fa"];
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.7) * 14,
          size: Math.random() * 5 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }

      let frames = 0;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35;
          p.alpha -= 0.02;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        frames++;
        if (frames < 50) requestAnimationFrame(render);
        else canvas.remove();
      };
      render();
    } catch (e) {}
  }
}

// ============================================================
// SECTION 4: STATE STORE & PERSISTENCE
// ============================================================

class SomaWorkoutState {
  constructor() {
    this.sessionStartTime = Date.now();
    this.activeSplit = "Legs A (Quad / Squat Dominant)";
    this.sessionExercises = [];
    this.undoStack = [];
    this.redoStack = [];
  }

  recordSnapshot() {
    if (this.undoStack.length > 25) this.undoStack.shift();
    this.undoStack.push(JSON.stringify(this.sessionExercises));
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    this.redoStack.push(JSON.stringify(this.sessionExercises));
    this.sessionExercises = JSON.parse(this.undoStack.pop());
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    this.undoStack.push(JSON.stringify(this.sessionExercises));
    this.sessionExercises = JSON.parse(this.redoStack.pop());
    return true;
  }
}

// ============================================================
// SECTION 5: OBSIDIAN PLUGIN REGISTRATION & CONTROLLER
// ============================================================

/* ==========================================================================
   Habit Tracker Engine (merged from the standalone Habit Radar plugin)
   Registered as the ```habittracker``` code block, and also embedded as
   the "Habits" tab inside the main soma-coach dashboard.
   ========================================================================== */

const DEFAULT_HABITS = [
  {
    id: "gym-movement",
    name: "Gym & Movement",
    desc: "Hit daily training split",
    icon: "🏋️",
    color: "#22c55e",
    goalDaysPerWeek: 5,
    history: {},
    photos: {}
  },
  {
    id: "clean-nutrition",
    name: "Clean Nutrition",
    desc: "Hit calorie & protein target",
    icon: "🥗",
    color: "#ef4444",
    goalDaysPerWeek: 7,
    history: {},
    photos: {}
  },
  {
    id: "hydration",
    name: "Hydration",
    desc: "Drink 2.5L+ water",
    icon: "💧",
    color: "#38bdf8",
    goalDaysPerWeek: 7,
    history: {},
    photos: {}
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    desc: "90+ min engineering / deep sprint",
    icon: "🧠",
    color: "#a855f7",
    goalDaysPerWeek: 5,
    history: {},
    photos: {}
  }
];

const DEFAULT_HABIT_SETTINGS = {
  defaultTimerDuration: 90,
  startOfWeek: "monday",
  accentColor: "#22c55e",
  habits: DEFAULT_HABITS
};

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateLong(dateStr) {
  const d = parseLocalDateKey(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTimeShort(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function readAndCompressImage(file, maxDim = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function pickPhoto() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) {
        reject(new Error("cancelled"));
        return;
      }
      try {
        const dataUrl = await readAndCompressImage(file);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    input.click();
  });
}

function calculateHabitStats(habit) {
  if (!habit.history) habit.history = {};
  const todayStr = getLocalDateKey(new Date());
  const today = parseLocalDateKey(todayStr);

  let currentStreak = 0;
  let check = new Date(today);

  if (!habit.history[getLocalDateKey(check)]) {
    check = addDays(check, -1);
  }

  while (habit.history[getLocalDateKey(check)] === true) {
    currentStreak++;
    check = addDays(check, -1);
  }

  const dates = Object.keys(habit.history)
    .filter((k) => habit.history[k] === true)
    .sort();

  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of dates) {
    const d = parseLocalDateKey(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diff = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
      if (diff === 1) tempStreak++;
      else if (diff > 1) tempStreak = 1;
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
    prevDate = d;
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak;

  const totalCompletions = dates.length;
  let weekDone = 0;
  for (let i = 0; i < 7; i++) {
    const dStr = getLocalDateKey(addDays(today, -i));
    if (habit.history[dStr] === true) weekDone++;
  }
  const weekRate = Math.round((weekDone / 7) * 100);

  return { currentStreak, bestStreak, totalCompletions, weekRate };
}

class HabitRadarUIController {
  constructor(app, plugin, targetEl, options = {}) {
    this.app = app;
    this.plugin = plugin;
    this.targetEl = targetEl;
    this.options = options;
    this.activeTab = options.view || "today";

    this.showHeader = options.header !== false;
    this.showSummary = options.summary !== false;
    this.showTabs = options.tabs !== false;

    this.timerInterval = null;
    this.timerSecondsLeft = (this.plugin.settings?.defaultTimerDuration || 90) * 60;
    this.timerTotalSeconds = this.timerSecondsLeft;
    this.timerIsRunning = false;
    this.timerSelectedHabitId = this.plugin.settings?.habits?.[0]?.id || "";
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  render() {
    const container = this.targetEl;
    container.empty();
    container.addClass("habit-radar-container");

    if (this.showHeader) {
      this.renderHeader(container);
    }

    if (this.showSummary) {
      this.renderSummaryCards(container);
    }

    const contentArea = container.createDiv({ cls: "hr-content-area" });

    switch (this.activeTab) {
      case "today":
        this.renderTodayView(contentArea);
        break;
      case "weekly":
        this.renderWeeklyView(contentArea);
        break;
      case "monthly":
        this.renderMonthlyView(contentArea);
        break;
      case "yearly":
        this.renderYearlyView(contentArea);
        break;
      case "timer":
        this.renderTimerView(contentArea);
        break;
      default:
        this.renderTodayView(contentArea);
        break;
    }
  }

  renderHeader(container) {
    const header = container.createDiv({ cls: "hr-header" });
    const titleWrap = header.createDiv({ cls: "hr-title-wrap" });

    const titleH1 = titleWrap.createEl("h1", { text: "Habit Radar" });
    titleH1.createSpan({ cls: "hr-title-badge", text: "Pro" });

    titleWrap.createEl("p", {
      cls: "hr-subtitle",
      text: "Build consistency. Track what matters."
    });

    if (this.showTabs) {
      const nav = header.createDiv({ cls: "hr-nav-tabs" });
      const tabs = ["Today", "Weekly", "Monthly", "Yearly", "Timer"];

      tabs.forEach((tab) => {
        const tabKey = tab.toLowerCase();
        const btn = nav.createEl("button", {
          cls: `hr-tab-btn ${this.activeTab === tabKey ? "active" : ""}`,
          text: tab
        });
        btn.onclick = () => {
          this.activeTab = tabKey;
          this.render();
        };
      });
    }
  }

  renderSummaryCards(container) {
    const habits = this.plugin.settings.habits || [];
    const todayStr = getLocalDateKey(new Date());

    let completedToday = 0;
    habits.forEach((h) => {
      if (h.history && h.history[todayStr] === true) completedToday++;
    });

    const totalHabits = habits.length;
    const todayPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    let maxCurrentStreak = 0;
    let maxBestStreak = 0;
    let avgWeekRate = 0;

    habits.forEach((h) => {
      const stats = calculateHabitStats(h);
      if (stats.currentStreak > maxCurrentStreak) maxCurrentStreak = stats.currentStreak;
      if (stats.bestStreak > maxBestStreak) maxBestStreak = stats.bestStreak;
      avgWeekRate += stats.weekRate;
    });

    avgWeekRate = habits.length > 0 ? Math.round(avgWeekRate / habits.length) : 0;

    const summaryGrid = container.createDiv({ cls: "hr-summary-grid" });

    const cardData = [
      { label: "TODAY", val: `${completedToday}/${totalHabits}`, sub: `${todayPercent}% Done` },
      { label: "STREAK", val: `${maxCurrentStreak}d`, sub: "Active Streak" },
      { label: "BEST", val: `${maxBestStreak}d`, sub: "Record Streak" },
      { label: "THIS WEEK", val: `${avgWeekRate}%`, sub: "Consistency" }
    ];

    cardData.forEach((cd) => {
      const card = summaryGrid.createDiv({ cls: "hr-stat-card" });
      card.createDiv({ cls: "hr-stat-label", text: cd.label });
      card.createDiv({ cls: "hr-stat-val", text: cd.val });
      card.createDiv({ cls: "hr-stat-sub", text: cd.sub });
    });
  }

  renderTodayView(container) {
    const actionBar = container.createDiv({ cls: "hr-action-bar" });
    actionBar.createEl("h2", { cls: "hr-section-heading", text: "Today's Routine" });

    const addBtn = actionBar.createEl("button", { cls: "hr-add-btn", text: "+ Add Habit" });
    addBtn.onclick = () => {
      new HabitEditModal(this.app, this.plugin, null, () => this.render()).open();
    };

    const stack = container.createDiv({ cls: "hr-habit-stack" });
    const todayStr = getLocalDateKey(new Date());

    (this.plugin.settings.habits || []).forEach((habit) => {
      if (!habit.photos) habit.photos = {};
      if (!habit.history) habit.history = {};

      const isDoneToday = habit.history[todayStr] === true;
      const stats = calculateHabitStats(habit);
      const photoCount = Object.keys(habit.photos).length;

      const card = stack.createDiv({ cls: "hr-habit-card" });
      const header = card.createDiv({ cls: "hr-card-header" });

      const info = header.createDiv({ cls: "hr-card-info" });
      const iconBox = info.createDiv({ cls: "hr-card-icon-box" });
      iconBox.setText(habit.icon || "🎯");
      iconBox.style.backgroundColor = `${habit.color}22`;
      iconBox.style.color = habit.color;

      const text = info.createDiv({ cls: "hr-card-text" });
      text.createEl("h3", { cls: "hr-card-title", text: habit.name });
      const goalLabel = habit.goalDaysPerWeek >= 7 ? "Every day" : `${habit.goalDaysPerWeek}x / week`;
      text.createEl("p", { cls: "hr-card-desc", text: `${habit.desc || ""} · 🎯 ${goalLabel}` });

      const controls = header.createDiv({ cls: "hr-card-controls" });

      if (stats.currentStreak > 0) {
        controls.createDiv({ cls: "hr-streak-badge", text: `🔥 ${stats.currentStreak}d` });
      }

      const galleryBtn = controls.createEl("button", { cls: "hr-icon-btn" });
      setIcon(galleryBtn, "images");
      if (photoCount > 0) {
        galleryBtn.createSpan({ cls: "hr-icon-btn-badge", text: String(photoCount) });
      }
      galleryBtn.onclick = (e) => {
        e.stopPropagation();
        new HabitPhotoGalleryModal(this.app, this.plugin, habit, () => this.render()).open();
      };

      const cameraBtn = controls.createEl("button", { cls: "hr-icon-btn" });
      setIcon(cameraBtn, "camera");
      cameraBtn.onclick = async (e) => {
        e.stopPropagation();
        try {
          const dataUrl = await pickPhoto();
          habit.photos[todayStr] = { data: dataUrl, ts: Date.now() };
          habit.history[todayStr] = true;
          await this.plugin.saveSettings();
          new Notice(`📸 Proof photo saved for ${habit.name}`);
          this.render();
        } catch (err) {}
      };

      const checkBtn = controls.createEl("button", {
        cls: `hr-check-circle ${isDoneToday ? "completed" : ""}`,
        text: isDoneToday ? "✓" : "+"
      });

      if (isDoneToday) checkBtn.style.backgroundColor = habit.color;

      checkBtn.onclick = async (e) => {
        e.stopPropagation();
        habit.history[todayStr] = !isDoneToday;
        await this.plugin.saveSettings();
        this.render();
      };

      const weekRow = card.createDiv({ cls: "hr-week-row" });
      const weekDays = this.getWeekDays(new Date());

      weekDays.forEach((d) => {
        const dStr = getLocalDateKey(d.date);
        const done = habit.history[dStr] === true;
        const isToday = dStr === todayStr;
        const hasPhoto = !!habit.photos[dStr];

        const cell = weekRow.createDiv({ cls: "hr-week-day-cell" });
        cell.createDiv({ cls: `hr-day-label ${isToday ? "today" : ""}`, text: d.label });

        const dot = cell.createDiv({
          cls: `hr-day-dot ${done ? "completed" : ""} ${isToday ? "is-today" : ""} ${hasPhoto ? "has-photo" : ""}`
        });

        if (done) {
          dot.setText("✓");
          dot.style.backgroundColor = habit.color;
        }

        cell.onclick = async () => {
          habit.history[dStr] = !done;
          await this.plugin.saveSettings();
          this.render();
        };
      });
    });
  }

  renderWeeklyView(container) {
    const actionBar = container.createDiv({ cls: "hr-action-bar" });
    actionBar.createEl("h2", { cls: "hr-section-heading", text: "Weekly Consistency" });

    const stack = container.createDiv({ cls: "hr-habit-stack" });
    const todayStr = getLocalDateKey(new Date());
    const weekDays = this.getWeekDays(new Date());

    (this.plugin.settings.habits || []).forEach((habit) => {
      const stats = calculateHabitStats(habit);
      const card = stack.createDiv({ cls: "hr-habit-card" });

      const header = card.createDiv({ cls: "hr-card-header" });
      const info = header.createDiv({ cls: "hr-card-info" });
      const iconBox = info.createDiv({ cls: "hr-card-icon-box" });
      iconBox.setText(habit.icon || "🎯");
      iconBox.style.backgroundColor = `${habit.color}22`;
      iconBox.style.color = habit.color;

      const text = info.createDiv({ cls: "hr-card-text" });
      text.createEl("h3", { cls: "hr-card-title", text: habit.name });
      text.createEl("p", { cls: "hr-card-desc", text: `${stats.weekRate}% this week` });

      const weekRow = card.createDiv({ cls: "hr-week-row" });

      weekDays.forEach((d) => {
        const dStr = getLocalDateKey(d.date);
        const done = habit.history[dStr] === true;
        const isToday = dStr === todayStr;
        const isPast = d.date < new Date(todayStr) && !isToday;

        const cell = weekRow.createDiv({ cls: "hr-week-day-cell" });
        cell.createDiv({ cls: `hr-day-label ${isToday ? "today" : ""}`, text: d.label });

        const dot = cell.createDiv({
          cls: `hr-day-dot ${done ? "completed" : isPast ? "missed" : ""} ${isToday ? "is-today" : ""}`
        });

        if (done) {
          dot.setText("✓");
          dot.style.backgroundColor = habit.color;
        } else if (isPast) {
          dot.setText("✕");
        }

        cell.onclick = async () => {
          habit.history[dStr] = !done;
          await this.plugin.saveSettings();
          this.render();
        };
      });
    });
  }

  renderMonthlyView(container) {
    const actionBar = container.createDiv({ cls: "hr-action-bar" });
    actionBar.createEl("h2", { cls: "hr-section-heading", text: "30-Day Activity Matrix" });

    const grid = container.createDiv({ cls: "hr-monthly-grid" });
    const today = new Date();

    (this.plugin.settings.habits || []).forEach((habit) => {
      const card = grid.createDiv({ cls: "hr-habit-card" });
      const header = card.createDiv({ cls: "hr-card-header" });

      const info = header.createDiv({ cls: "hr-card-info" });
      const iconBox = info.createDiv({ cls: "hr-card-icon-box" });
      iconBox.setText(habit.icon || "🎯");
      iconBox.style.backgroundColor = `${habit.color}22`;
      iconBox.style.color = habit.color;

      const text = info.createDiv({ cls: "hr-card-text" });
      text.createEl("h3", { cls: "hr-card-title", text: habit.name });
      text.createEl("p", { cls: "hr-card-desc", text: "Click pixel to toggle" });

      const heatmap = card.createDiv({ cls: "hr-month-heatmap" });

      for (let i = 27; i >= 0; i--) {
        const d = addDays(today, -i);
        const dStr = getLocalDateKey(d);
        const done = habit.history[dStr] === true;

        const cell = heatmap.createDiv({
          cls: `hr-pixel-cell ${done ? "active" : ""}`
        });

        if (done) cell.style.backgroundColor = habit.color;
        cell.setAttribute("title", `${dStr}: ${done ? "Completed" : "Incomplete"}`);

        cell.onclick = async () => {
          habit.history[dStr] = !done;
          await this.plugin.saveSettings();
          this.render();
        };
      }
    });
  }

  renderYearlyView(container) {
    const actionBar = container.createDiv({ cls: "hr-action-bar" });
    actionBar.createEl("h2", { cls: "hr-section-heading", text: "Yearly Overview" });

    const wrapper = container.createDiv({ cls: "hr-yearly-wrapper" });
    const yearGrid = wrapper.createDiv({ cls: "hr-year-grid" });

    const today = new Date();
    const totalDays = 52 * 7;
    const startDate = addDays(today, -totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const d = addDays(startDate, i);
      const dStr = getLocalDateKey(d);

      let count = 0;
      (this.plugin.settings.habits || []).forEach((h) => {
        if (h.history && h.history[dStr] === true) count++;
      });

      const cell = yearGrid.createDiv({ cls: "hr-year-cell" });

      if (count > 0 && this.plugin.settings.habits.length > 0) {
        const opacity = Math.min(count / this.plugin.settings.habits.length, 1);
        cell.style.backgroundColor = this.plugin.settings.accentColor;
        cell.style.opacity = Math.max(opacity, 0.35);
      }

      cell.setAttribute("title", `${dStr} — ${count} habits completed`);
    }
  }

  renderTimerView(container) {
    const timerCard = container.createDiv({ cls: "hr-timer-container" });

    const select = timerCard.createEl("select", { cls: "hr-timer-habit-select" });
    (this.plugin.settings.habits || []).forEach((h) => {
      const opt = select.createEl("option", { text: `${h.icon} ${h.name}`, value: h.id });
      if (h.id === this.timerSelectedHabitId) opt.selected = true;
    });

    select.onchange = (e) => {
      this.timerSelectedHabitId = e.target.value;
    };

    const ringWrapper = timerCard.createDiv({ cls: "hr-timer-ring-wrapper" });
    const r = 80;
    const circ = 2 * Math.PI * r;
    const progress = this.timerTotalSeconds > 0 ? (this.timerSecondsLeft / this.timerTotalSeconds) * circ : 0;

    ringWrapper.innerHTML = `
      <svg width="190" height="190" style="transform: rotate(-90deg);">
        <circle cx="95" cy="95" r="${r}" stroke="rgba(255, 255, 255, 0.08)" stroke-width="10" fill="transparent" />
        <circle cx="95" cy="95" r="${r}" stroke="${this.plugin.settings.accentColor}" stroke-width="10" stroke-dasharray="${circ}" stroke-dashoffset="${circ - progress}" stroke-linecap="round" fill="transparent" style="transition: stroke-dashoffset 0.4s ease;" />
      </svg>
    `;

    const display = ringWrapper.createDiv({ cls: "hr-timer-display" });
    const mins = Math.floor(this.timerSecondsLeft / 60);
    const secs = this.timerSecondsLeft % 60;
    display.createDiv({ cls: "hr-time-left", text: `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` });
    display.createDiv({ cls: "hr-timer-status", text: this.timerIsRunning ? "Focusing..." : "Ready" });

    const controls = timerCard.createDiv({ cls: "hr-timer-controls" });

    const playBtn = controls.createEl("button", {
      cls: "hr-timer-btn primary",
      text: this.timerIsRunning ? "Pause" : "Start"
    });

    playBtn.onclick = () => {
      if (this.timerIsRunning) this.pauseTimer();
      else this.startTimer();
      this.render();
    };

    const resetBtn = controls.createEl("button", { cls: "hr-timer-btn", text: "Reset" });
    resetBtn.onclick = () => {
      this.resetTimer();
      this.render();
    };

    const skipBtn = controls.createEl("button", { cls: "hr-timer-btn", text: "Complete" });
    skipBtn.onclick = () => this.finishTimer();
  }

  startTimer() {
    if (this.timerIsRunning) return;
    this.timerIsRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timerSecondsLeft > 0) {
        this.timerSecondsLeft--;
        this.render();
      } else {
        this.finishTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timerIsRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.pauseTimer();
    this.timerSecondsLeft = (this.plugin.settings?.defaultTimerDuration || 90) * 60;
    this.timerTotalSeconds = this.timerSecondsLeft;
  }

  async finishTimer() {
    this.pauseTimer();
    this.timerSecondsLeft = (this.plugin.settings?.defaultTimerDuration || 90) * 60;

    const todayStr = getLocalDateKey(new Date());
    const habit = (this.plugin.settings.habits || []).find((h) => h.id === this.timerSelectedHabitId);

    if (habit) {
      if (!habit.history) habit.history = {};
      habit.history[todayStr] = true;
      await this.plugin.saveSettings();
      new Notice(`🎉 Session complete: ${habit.name}`);
    }
    this.render();
  }

  getWeekDays(centerDate) {
    const startOfWeek = this.plugin.settings?.startOfWeek || "monday";
    const d = new Date(centerDate);
    const day = d.getDay();
    const diff = startOfWeek === "monday" ? (day === 0 ? -6 : 1 - day) : -day;
    const start = addDays(d, diff);
    const labels = startOfWeek === "monday" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return labels.map((label, idx) => ({
      label,
      date: addDays(start, idx)
    }));
  }
}

class HabitRadarRenderChild extends MarkdownRenderChild {
  constructor(containerEl, controller) {
    super(containerEl);
    this.controller = controller;
  }

  onload() {
    this.controller.render();
  }

  onunload() {
    this.controller.destroy();
  }
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAY_LABELS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

class HabitPhotoGalleryModal extends Modal {
  constructor(app, plugin, habit, onChange) {
    super(app);
    this.plugin = plugin;
    this.habit = habit;
    this.onChange = onChange;
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
  }

  onOpen() {
    this.modalEl.addClass("hr-gallery-modal");
    if (!this.habit.photos) this.habit.photos = {};
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  changeMonth(delta) {
    let m = this.viewMonth + delta;
    let y = this.viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    this.viewMonth = m;
    this.viewYear = y;
    this.render();
  }

  async handleDayClick(dStr, photo, isFuture) {
    if (isFuture) return;

    if (photo) {
      new HabitPhotoLightboxModal(this.app, this.plugin, this.habit, dStr, photo, {
        onUpdated: () => {
          this.render();
          if (this.onChange) this.onChange();
        },
        onDeleted: async () => {
          delete this.habit.photos[dStr];
          await this.plugin.saveSettings();
          this.render();
          if (this.onChange) this.onChange();
        }
      }).open();
      return;
    }

    try {
      const dataUrl = await pickPhoto();
      this.habit.photos[dStr] = { data: dataUrl, ts: Date.now() };
      this.habit.history[dStr] = true;
      await this.plugin.saveSettings();
      new Notice(`📸 Proof photo saved for ${formatDateLong(dStr)}`);
      this.render();
      if (this.onChange) this.onChange();
    } catch (err) {
      // user cancelled the file picker — nothing to do
    }
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();

    const header = contentEl.createDiv({ cls: "hr-gallery-header" });
    const iconBox = header.createDiv({ cls: "hr-gallery-icon" });
    iconBox.setText(this.habit.icon || "🎯");
    iconBox.style.backgroundColor = `${this.habit.color}22`;
    iconBox.style.color = this.habit.color;

    const titleWrap = header.createDiv({ cls: "hr-gallery-title-wrap" });
    titleWrap.createEl("h2", { text: this.habit.name });
    titleWrap.createEl("p", { text: "Proof photos history — tap a day to add or view a photo" });

    const nav = contentEl.createDiv({ cls: "hr-gallery-nav" });
    const prevBtn = nav.createEl("button", { cls: "hr-icon-btn hr-gallery-nav-btn" });
    setIcon(prevBtn, "chevron-left");
    prevBtn.onclick = () => this.changeMonth(-1);

    nav.createDiv({ cls: "hr-gallery-month-label", text: `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}` });

    const nextBtn = nav.createEl("button", { cls: "hr-icon-btn hr-gallery-nav-btn" });
    setIcon(nextBtn, "chevron-right");
    nextBtn.onclick = () => this.changeMonth(1);

    const weekdayRow = contentEl.createDiv({ cls: "hr-gallery-weekday-row" });
    WEEKDAY_LABELS_MON.forEach((label) => {
      weekdayRow.createDiv({ cls: "hr-gallery-weekday-label", text: label });
    });

    const grid = contentEl.createDiv({ cls: "hr-gallery-calendar" });
    const todayStr = getLocalDateKey(new Date());
    const today = parseLocalDateKey(todayStr);
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first offset
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

    for (let i = 0; i < leadingBlanks; i++) {
      grid.createDiv({ cls: "hr-gallery-day-cell hr-gallery-day-empty" });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(this.viewYear, this.viewMonth, day);
      const dStr = getLocalDateKey(cellDate);
      const photo = this.habit.photos[dStr];
      const isFuture = cellDate > today;

      const cell = grid.createDiv({
        cls: `hr-gallery-day-cell ${dStr === todayStr ? "is-today" : ""} ${photo ? "has-photo" : ""} ${isFuture ? "is-future" : ""}`
      });

      if (photo) {
        const thumb = cell.createDiv({ cls: "hr-gallery-thumb" });
        thumb.style.backgroundImage = `url(${photo.data})`;
        cell.createDiv({ cls: "hr-gallery-day-num hr-gallery-day-num-overlay", text: String(day) });
      } else {
        cell.createDiv({ cls: "hr-gallery-day-num", text: String(day) });
        if (!isFuture) {
          cell.createDiv({ cls: "hr-gallery-add-hint" }).setText("+");
        }
      }

      if (!isFuture) {
        cell.onclick = () => this.handleDayClick(dStr, photo, isFuture);
      }
    }
  }
}

class HabitPhotoLightboxModal extends Modal {
  constructor(app, plugin, habit, dateStr, photo, callbacks = {}) {
    super(app);
    this.plugin = plugin;
    this.habit = habit;
    this.dateStr = dateStr;
    this.photo = photo;
    this.onUpdated = callbacks.onUpdated;
    this.onDeleted = callbacks.onDeleted;
  }

  onOpen() {
    this.modalEl.addClass("hr-lightbox-modal");
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createDiv({ cls: "hr-lightbox-date", text: formatDateLong(this.dateStr) });

    const imgWrap = contentEl.createDiv({ cls: "hr-lightbox-image-wrap" });
    const img = imgWrap.createEl("img", { cls: "hr-lightbox-image" });
    img.src = this.photo.data;

    const meta = contentEl.createDiv({ cls: "hr-lightbox-meta" });
    if (this.photo.ts) meta.setText(`Taken at ${formatTimeShort(this.photo.ts)}`);

    const actions = contentEl.createDiv({ cls: "hr-lightbox-actions" });

    const retakeBtn = actions.createEl("button", { cls: "hr-timer-btn", text: "Retake" });
    retakeBtn.onclick = async () => {
      try {
        const dataUrl = await pickPhoto();
        this.photo.data = dataUrl;
        this.photo.ts = Date.now();
        await this.plugin.saveSettings();
        img.src = dataUrl;
        meta.setText(`Taken at ${formatTimeShort(this.photo.ts)}`);
        new Notice("📸 Photo updated");
        if (this.onUpdated) this.onUpdated();
      } catch (err) {}
    };

    const deleteBtn = actions.createEl("button", { cls: "hr-timer-btn hr-lightbox-delete", text: "Delete Photo" });
    deleteBtn.onclick = async () => {
      this.close();
      if (this.onDeleted) await this.onDeleted();
    };
  }

  onClose() {
    this.contentEl.empty();
  }
}

class HabitEditModal extends Modal {
  constructor(app, plugin, habit, onSave) {
    super(app);
    this.plugin = plugin;
    this.habit = habit;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    this.modalEl.addClass("hr-edit-modal");
    contentEl.empty();
    contentEl.createEl("h2", { text: this.habit ? "Edit Habit" : "Add Habit" });

    let name = this.habit?.name || "";
    let desc = this.habit?.desc || "";
    let icon = this.habit?.icon || "🎯";
    let color = this.habit?.color || "#22c55e";
    let goalDaysPerWeek = this.habit?.goalDaysPerWeek ?? 7;

    new Setting(contentEl).setName("Name").addText((text) => text.setValue(name).onChange((v) => (name = v)));
    new Setting(contentEl).setName("Description").addText((text) => text.setValue(desc).onChange((v) => (desc = v)));
    new Setting(contentEl).setName("Icon").addText((text) => text.setValue(icon).onChange((v) => (icon = v)));
    new Setting(contentEl).setName("Color").addColorPicker((picker) => picker.setValue(color).onChange((v) => (color = v)));

    new Setting(contentEl).addButton((btn) => {
      btn.setButtonText("Save").setCta().onClick(async () => {
        if (!name.trim()) {
          new Notice("Name is required");
          return;
        }
        if (this.habit) {
          this.habit.name = name;
          this.habit.desc = desc;
          this.habit.icon = icon;
          this.habit.color = color;
          this.habit.goalDaysPerWeek = goalDaysPerWeek;
        } else {
          this.plugin.settings.habits.push({
            id: `habit-${Date.now()}`,
            name,
            desc,
            icon,
            color,
            goalDaysPerWeek,
            history: {},
            photos: {}
          });
        }
        await this.plugin.saveSettings();
        this.close();
        if (this.onSave) this.onSave();
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

// Bridges the ported habit-tracker UI (which expects a `plugin.settings` /
// `plugin.saveSettings()` interface, same as the original standalone
// plugin) onto SOMA's vault-file storage convention instead of Obsidian's
// plugin data.json, so habit data lives alongside the rest of SOMA's data
// at apps/scripts/soma-habits.json.
class SomaHabitStore {
  constructor(pluginRef) {
    this.pluginRef = pluginRef;
    this.settings = null;
  }

  async load() {
    const data = await this.pluginRef.readVaultJson(HABITS_FILE_PATH, null);
    this.settings = Object.assign({}, DEFAULT_HABIT_SETTINGS, data || {});
    if (!this.settings.habits || this.settings.habits.length === 0) {
      this.settings.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
    }
    return this.settings;
  }

  async saveSettings() {
    await this.pluginRef.writeVaultJson(HABITS_FILE_PATH, this.settings);
  }
}


module.exports = class SomaSmartCoachPlugin extends Plugin {
  async onload() {
    this.activeIntervals = new Set();
    this.addSettingTab(new SomaSettingTab(this.app, this));

    // 1. Master Suite Processor
    this.registerMarkdownCodeBlockProcessor("soma-coach", async (source, el, ctx) => {
      await this.mountApp(el, ctx?.sourcePath || "");
    });

    // 2. Standalone Macro & Nutrition Diary
    this.registerMarkdownCodeBlockProcessor("macro-tracker", async (source, el, ctx) => {
      await this.mountTracker(el, ctx?.sourcePath || "");
    });

    // 3. Weekly Macro & Nutrition Dashboard
    this.registerMarkdownCodeBlockProcessor("macro-weekly", async (source, el, ctx) => {
      await this.mountWeeklyDashboard(el, ctx?.sourcePath || "");
    });

    // 4. Standalone Weekly Planner Processor (Editable Calendar Cascade)
    this.registerMarkdownCodeBlockProcessor("weekly-gym", async (source, el, ctx) => {
      await this.mountWeeklyPlanner(el);
    });
    this.registerMarkdownCodeBlockProcessor("weekly-gym-tracker", async (source, el, ctx) => {
      await this.mountWeeklyPlanner(el);
    });

    // 5. Standalone Creatine Tracker Processor
    this.registerMarkdownCodeBlockProcessor("creatine-tracker", async (source, el, ctx) => {
      await this.mountCreatineStandalone(el, ctx?.sourcePath || "");
    });

    // 6. Weekly Macro & Recomp Audit
    this.registerMarkdownCodeBlockProcessor("weekly-audit", async (source, el, ctx) => {
      await this.mountAuditWidget(el, 7, "Weekly Audit & Recomp Snapshot");
    });

    // 7. Monthly Macro & Muscle Retention Audit
    this.registerMarkdownCodeBlockProcessor("monthly-audit", async (source, el, ctx) => {
      await this.mountAuditWidget(el, 30, "Monthly Trend & Muscle Retention Audit");
    });

    // 8. Progress Charts: 1RM trendlines & weekly volume
    this.registerMarkdownCodeBlockProcessor("soma-progress", async (source, el, ctx) => {
      await this.mountProgressWidget(el, source);
    });

    // 9. Habit Tracker (merged in from the standalone Habit Radar plugin).
    // Kept as its own callout name per request, alongside being embedded
    // as the "Habits" tab inside the main soma-coach dashboard.
    this.registerMarkdownCodeBlockProcessor("habittracker", async (source, el, ctx) => {
      await this.mountHabitTracker(el, source, ctx);
    });

    // Commands
    this.addCommand({
      id: "soma-log-water-250",
      name: "SOMA: Log 250ml water (today)",
      callback: async () => {
        const key = getLocalDateKey(new Date());
        const n = await this.readVaultJson(NUTRITION_FILE_PATH, {});
        this.ensureNutritionSettings(n);
        if (!n[key]) n[key] = { goals: { ...DEFAULT_GOALS }, water: 0, bodyWeight: 78.5, items: [], mealCollapse: {} };
        n[key].water = (n[key].water || 0) + 250;
        await this.writeVaultJson(NUTRITION_FILE_PATH, n);
        new Notice(`Logged 250ml water. Total today: ${n[key].water}ml`);
      }
    });

    this.addCommand({
      id: "soma-log-water-500",
      name: "SOMA: Log 500ml water (today)",
      callback: async () => {
        const key = getLocalDateKey(new Date());
        const n = await this.readVaultJson(NUTRITION_FILE_PATH, {});
        this.ensureNutritionSettings(n);
        if (!n[key]) n[key] = { goals: { ...DEFAULT_GOALS }, water: 0, bodyWeight: 78.5, items: [], mealCollapse: {} };
        n[key].water = (n[key].water || 0) + 500;
        await this.writeVaultJson(NUTRITION_FILE_PATH, n);
        new Notice(`Logged 500ml water. Total today: ${n[key].water}ml`);
      }
    });

    this.addCommand({
      id: "soma-export-workout-csv",
      name: "SOMA: Export workout history to CSV",
      callback: () => this.exportWorkoutHistoryCsv()
    });

    this.addCommand({
      id: "soma-export-macros-csv",
      name: "SOMA: Export macro diary to CSV",
      callback: () => this.exportMacrosCsv()
    });

    this.addCommand({
      id: "soma-backup-json",
      name: "SOMA: Backup all data to JSON",
      callback: () => this.backupAllData()
    });
  }

  onunload() {
    if (this.activeIntervals) {
      for (const id of this.activeIntervals) clearInterval(id);
      this.activeIntervals.clear();
    }
  }

  // Wrap setInterval so every timer this plugin creates is force-cleared on unload,
  // even if a widget's own cleanup path is skipped (e.g. the note is closed mid-rest-timer).
  trackInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this.activeIntervals.add(id);
    return id;
  }

  untrackInterval(id) {
    clearInterval(id);
    if (this.activeIntervals) this.activeIntervals.delete(id);
  }

  async readVaultJson(path, fallback = {}) {
    try {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file) {
        const text = await this.app.vault.read(file);
        if (text && text.trim() !== "") return JSON.parse(text);
      }
    } catch (e) {
      console.warn(`[SOMA] Read notice for ${path}:`, e);
    }
    return fallback;
  }

  async writeVaultJson(path, data) {
    try {
      const str = JSON.stringify(data, null, 2);
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!file) {
        const dir = path.substring(0, path.lastIndexOf("/"));
        if (dir && !(await this.app.vault.adapter.exists(dir))) {
          await this.app.vault.adapter.mkdir(dir);
        }
        await this.app.vault.create(path, str);
      } else {
        await this.app.vault.modify(file, str);
      }
    } catch (e) {
      console.error(`[SOMA] Write error for ${path}:`, e);
    }
  }

  async syncFrontmatter(sourcePath, dayData) {
    if (!sourcePath) return;
    const currentFile = this.app.vault.getAbstractFileByPath(sourcePath);
    if (currentFile && this.app.fileManager?.processFrontMatter) {
      let totCals = 0, totP = 0, totC = 0, totF = 0;
      (dayData.items || []).forEach(i => {
        totCals += i.cals || 0; totP += i.p || 0; totC += i.c || 0; totF += i.f || 0;
      });
      try {
        await this.app.fileManager.processFrontMatter(currentFile, fm => {
          fm["calories_consumed"] = Math.round(totCals);
          fm["protein_grams"] = Math.round(totP);
          fm["carbs_grams"] = Math.round(totC);
          fm["fat_grams"] = Math.round(totF);
          fm["water_ml"] = Math.round(dayData.water || 0);
          if (dayData.bodyWeight) fm["body_weight_kg"] = parseFloat(dayData.bodyWeight);
        });
      } catch (e) {}
    }
  }

  getRecommendation(history, scheduleOverrides, noteDateKey) {
    const dateObj = parseLocalDateKey(noteDateKey);
    const todayProj = SomaIntelligenceEngine.getProgramProjectedDay(dateObj, scheduleOverrides);
    return {
      split: todayProj.split,
      rationale: todayProj.phase,
      lastSplit: Object.keys(history).sort().pop() ? history[Object.keys(history).sort().pop()].split : "None"
    };
  }

  getLastPerformance(history, exerciseName) {
    let latestDate = 0;
    let topSet = null;
    for (const session of Object.values(history || {})) {
      if (session && session.exercises && (session.timestamp || 0) > latestDate) {
        const match = session.exercises.find(e => e.name && e.name.toLowerCase() === exerciseName.toLowerCase());
        if (match && match.sets && Array.isArray(match.sets)) {
          const completed = match.sets.filter(s => s.done || (parseFloat(s.weight) >= 0 && s.reps));
          if (completed.length > 0) {
            latestDate = session.timestamp || 0;
            topSet = completed.reduce((max, s) => (parseFloat(s.weight) || 0) > (parseFloat(max.weight) || 0) ? s : max, completed[0]);
          }
        }
      }
    }
    return topSet;
  }

  // ==========================================================================
  // CODEBLOCK 1: SOMA MASTER SUITE (`soma-coach`)
  // ==========================================================================
  async mountApp(containerEl, sourcePath) {
    containerEl.empty();
    const root = containerEl.createDiv({ cls: "soma-daily-root" });
    const appEl = root.createDiv({ cls: "soma-app" });

    const fileName = sourcePath ? sourcePath.split("/").pop().replace(/\.md$/, "") : "";
    const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
    const noteDateKey = dateMatch ? dateMatch[0] : getLocalDateKey(new Date());

    let history = await this.readVaultJson(HISTORY_FILE_PATH, {});
    let customExercises = await this.readVaultJson(CUSTOM_EX_FILE_PATH, []);
    let nutritionDB = await this.readVaultJson(NUTRITION_FILE_PATH, { _settings: { creatineStashGrams: 300 } });
    this.ensureNutritionSettings(nutritionDB);
    let somaData = await this.readVaultJson(DATA_FILE_PATH, { STATIC_PARTS: { front: {}, back: {} }, FRONT_OUTLINE: "", BACK_OUTLINE: "" });
    let muscleRegistry = await this.readVaultJson(REGISTRY_FILE_PATH, {});
    let settings = await this.readVaultJson(SETTINGS_FILE_PATH, {
      unit: "kg",
      barWeight: 20,
      restDefault: 90,
      autoRest: true,
      sound: true,
      confetti: true,
      subStartDate: "2026-08-01",
      subDurationDays: 30,
      subEndDate: "2026-08-31",
      scheduleOverrides: {}
    });

    let exerciseDB = [...BASE_EXERCISE_DB, ...customExercises];
    const state = new SomaWorkoutState();
    
    const currentProj = SomaIntelligenceEngine.getProgramProjectedDay(parseLocalDateKey(noteDateKey), settings.scheduleOverrides || {});
    state.activeSplit = currentProj.split;

    let restTimerInterval = null;
    let restSecondsLeft = settings.restDefault;
    let restSecondsTotal = settings.restDefault;
    let workoutDurationInterval = null;
    let calViewDate = parseLocalDateKey(noteDateKey);
    let currentPrFilter = "ALL";
    let heatmapCurrentView = "front";
    let heatmapSelectedKey = null;
    let heatmapSelectedPoint = null;

    // ------------------------------------------------------------------
    // BAR WEIGHT HELPER — lets the user pick which bar they're using
    // (Olympic / Women's / EZ / Trap-Hex / Custom) and then only type the
    // ADDED plate weight (e.g. "20" for 2×10kg discs). The real total
    // weight (bar + added) is what gets used everywhere: volume, 1RM,
    // PR detection, calories, etc.
    // ------------------------------------------------------------------
    const BAR_PRESETS = {
      kg: [
        { id: "olympic", label: "Olympic Bar (20kg)", weight: 20 },
        { id: "womens", label: "Women's Bar (15kg)", weight: 15 },
        { id: "ez", label: "EZ-Curl Bar (10kg)", weight: 10 },
        { id: "trap", label: "Trap/Hex Bar (25kg)", weight: 25 },
        { id: "custom", label: "Custom Bar...", weight: null }
      ],
      lbs: [
        { id: "olympic", label: "Olympic Bar (45lb)", weight: 45 },
        { id: "womens", label: "Women's Bar (35lb)", weight: 35 },
        { id: "ez", label: "EZ-Curl Bar (25lb)", weight: 25 },
        { id: "trap", label: "Trap/Hex Bar (55lb)", weight: 55 },
        { id: "custom", label: "Custom Bar...", weight: null }
      ]
    };

    // ------------------------------------------------------------------
    // SUPERSET GROUPS — tapping the 🔗 button on a card cycles it through
    // None → A → B → C → D → None. Cards sharing a letter get a matching
    // colored left border + badge so they read as one linked block, back
    // to back with no rest in between.
    // ------------------------------------------------------------------
    const SUPERSET_GROUPS = [
      { id: "", label: "" },
      { id: "A", label: "A", color: "#10b981" },
      { id: "B", label: "B", color: "#38bdf8" },
      { id: "C", label: "C", color: "#a855f7" },
      { id: "D", label: "D", color: "#f59e0b" }
    ];
    const nextSupersetGroup = (current) => {
      const idx = SUPERSET_GROUPS.findIndex(g => g.id === (current || ""));
      return SUPERSET_GROUPS[(idx + 1) % SUPERSET_GROUPS.length].id;
    };
    const supersetGroupInfo = (id) => SUPERSET_GROUPS.find(g => g.id === id) || SUPERSET_GROUPS[0];

    // Heuristic: only exercises actually loaded onto a barbell/EZ-bar get
    // the bar-weight dropdown. Machines, cables, dumbbells and bodyweight
    // moves don't need it.
    const exerciseUsesBar = (name = "") => {
      const n = name.toLowerCase();
      if (n.includes("dumbbell") || n.includes("cable") || n.includes("machine") || n.includes("pec deck")) return false;
      return /barbell|ez[- ]?(curl )?bar|ez bar|trap bar|hex bar|deadlift|smith/.test(n);
    };

    // Returns the real total weight lifted for a given set, accounting for
    // the selected bar. For non-bar exercises this is just the raw entered
    // weight (unchanged behavior).
    const getTotalWeight = (ex, s) => {
      const raw = parseFloat(s.weight) || 0;
      if (ex && ex.usesBar) {
        const barW = (typeof ex.barWeight === "number" && ex.barWeight > 0) ? ex.barWeight : settings.barWeight;
        return raw > 0 ? barW + raw : 0;
      }
      return raw;
    };

    const saveWorkoutHistory = async (data) => {
      history[noteDateKey] = data;
      await this.writeVaultJson(HISTORY_FILE_PATH, history);
    };

    const saveCustomExercise = async (ex) => {
      customExercises.push(ex);
      exerciseDB.push(ex);
      await this.writeVaultJson(CUSTOM_EX_FILE_PATH, customExercises);
    };

    const saveNutritionDB = async () => {
      await this.writeVaultJson(NUTRITION_FILE_PATH, nutritionDB);
    };

    const saveSettings = async (newSet) => {
      settings = { ...settings, ...newSet };
      await this.writeVaultJson(SETTINGS_FILE_PATH, settings);
    };

    const startRestTimer = (seconds) => {
      this.untrackInterval(restTimerInterval);
      restSecondsLeft = seconds;
      restSecondsTotal = seconds;
      updateRestTimerUI();

      restTimerInterval = this.trackInterval(() => {
        restSecondsLeft--;
        if (restSecondsLeft <= 0) {
          this.untrackInterval(restTimerInterval);
          if (settings.sound) SomaAudioCelebration.playSound("chime");
        }
        updateRestTimerUI();
      }, 1000);
    };

    const updateRestTimerUI = () => {
      const ring = appEl.querySelector("#soma-timer-ring");
      const val = appEl.querySelector("#soma-timer-val");
      if (!ring || !val) return;
      val.textContent = `${Math.max(0, restSecondsLeft)}s`;
      const circumference = 2 * Math.PI * 22;
      const progress = Math.max(0, restSecondsLeft / restSecondsTotal);
      ring.style.strokeDashoffset = circumference - (progress * circumference);
    };

    const loadSplitIntoSession = (splitName) => {
      state.recordSnapshot();
      state.activeSplit = splitName;
      const list = ROUTINE_PRESETS[splitName] || [];
      state.sessionExercises = list.map(item => {
        const data = exerciseDB.find(e => e.name === item.name) || {};
        const isBW = !!data.isBW;
        const last = this.getLastPerformance(history, item.name);
        const target = SomaIntelligenceEngine.computeOverloadRecommendation(last, isBW);

        return {
          name: item.name,
          muscle: data.muscle || "Custom",
          subTarget: data.subTarget || "",
          targetKeys: data.targetKeys || [],
          position: data.position || "",
          risk: data.risk || "Low 🟢",
          tier: data.tier || "A-Tier",
          isAxial: !!data.isAxial,
          isBW: isBW,
          usesBar: exerciseUsesBar(item.name),
          barWeight: settings.barWeight,
          overloadTarget: target,
          supersetGroup: "",
          sets: [
            { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: 2, done: false, type: "normal" },
            { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: 2, done: false, type: "normal" },
            { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: Math.max(6, target.reps - 1), failure: 3, done: false, type: "normal" }
          ]
        };
      });
      renderTracker();
    };

    appEl.innerHTML = `
      <div class="soma-view-pane active" id="pane-workout"></div>
      <div class="soma-view-pane" id="pane-macros"></div>
      <div class="soma-view-pane" id="pane-habits"></div>
      <div class="soma-view-pane" id="pane-heatmap"></div>
      <div class="soma-view-pane" id="pane-calendar"></div>
      <div class="soma-view-pane" id="pane-prs"></div>
      <div class="soma-view-pane" id="pane-creatine"></div>
      <div class="soma-view-pane" id="pane-recovery"></div>
      <div class="soma-view-pane" id="pane-settings"></div>

      <!-- FLOATING iOS LIQUID GLASS DOCK -->
      <div class="soma-glass-dock-wrap">
        <nav class="soma-glass-dock">
          <button class="soma-dock-tab active" data-target="pane-workout"><span class="dock-icon">⚡</span><span>Workout</span></button>
          <button class="soma-dock-tab" data-target="pane-macros"><span class="dock-icon">🍽️</span><span>Macros</span></button>
          <button class="soma-dock-tab" data-target="pane-habits"><span class="dock-icon">🎯</span><span>Habits</span></button>
          <button class="soma-dock-tab" data-target="pane-heatmap"><span class="dock-icon">🧬</span><span>Heatmap</span></button>
          <button class="soma-dock-tab" data-target="pane-calendar"><span class="dock-icon">📅</span><span>Calendar</span></button>
          <button class="soma-dock-tab" data-target="pane-prs"><span class="dock-icon">🏆</span><span>PRs</span></button>
          <button class="soma-dock-tab" data-target="pane-creatine"><span class="dock-icon">💊</span><span>Creatine</span></button>
          <button class="soma-dock-tab" data-target="pane-recovery"><span class="dock-icon">⚖️</span><span>CNS</span></button>
          <button class="soma-dock-tab" data-target="pane-settings"><span class="dock-icon">⚙️</span><span>Settings</span></button>
        </nav>
      </div>

      <!-- MODALS -->
      <div class="soma-modal-overlay" id="custom-ex-modal">
        <div class="soma-modal-box">
          <div class="soma-modal-title">✨ Create Custom Movement</div>
          <div class="soma-field-lbl">Exercise Name</div>
          <input type="text" class="soma-modal-input" id="cust-name" placeholder="e.g. Incline Cable Press" />
          <div class="soma-field-lbl">Target Muscle</div>
          <select class="soma-modal-input" id="cust-muscle">
            <option value="chest">Chest</option>
            <option value="upper_back">Back / Lats</option>
            <option value="deltoids">Shoulders / Delts</option>
            <option value="biceps">Biceps</option>
            <option value="triceps">Triceps</option>
            <option value="quadriceps">Quads</option>
            <option value="hamstring">Hamstrings</option>
            <option value="gluteal">Glutes</option>
            <option value="calves">Calves</option>
          </select>
          <div class="soma-field-lbl">Sub-Target Head</div>
          <input type="text" class="soma-modal-input" id="cust-sub" placeholder="e.g. Clavicular Pec / Long Head" />
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
            <button class="soma-btn" data-action="close-custom-modal">Cancel</button>
            <button class="soma-btn soma-btn-accent" data-action="submit-custom-movement">Add & Save</button>
          </div>
        </div>
      </div>

      <div class="soma-plate-modal" id="plate-popover">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:800; font-size:0.88rem; color:#f3f4f6;">🏋️ Barbell Loading Stack</span>
          <button class="soma-btn-del" data-action="close-plate-modal">✕</button>
        </div>
        <div id="plate-popover-text" style="font-size:0.78rem; color:#9ca3af; margin-top:4px;"></div>
        <div class="soma-plate-bar-visual" id="plate-bar-render"></div>
        <div id="plate-breakdown-list" style="font-size:0.78rem; color:#e5e7eb; text-align:center;"></div>
        <div id="plate-warmup-list" style="font-size:0.74rem; margin-top:8px;"></div>
      </div>
    `;

    const paneWorkout = appEl.querySelector("#pane-workout");
    const paneMacros = appEl.querySelector("#pane-macros");
    const paneHabits = appEl.querySelector("#pane-habits");
    const paneHeatmap = appEl.querySelector("#pane-heatmap");
    const paneCalendar = appEl.querySelector("#pane-calendar");
    const panePrs = appEl.querySelector("#pane-prs");
    const paneCreatine = appEl.querySelector("#pane-creatine");
    const paneRecovery = appEl.querySelector("#pane-recovery");
    const paneSettings = appEl.querySelector("#pane-settings");

    let embeddedHabitController = null;
    const renderMacrosView = async () => {
      // Reuses the exact same renderer as the standalone `macro-tracker`
      // callout, just mounted into this dock's pane instead of its own
      // code block, so both stay in sync with one nutrition data file.
      await this.mountTracker(paneMacros, sourcePath);
    };
    const renderHabitsView = async () => {
      // Destroy the previous controller first so its focus-timer interval
      // (if one was left running) doesn't keep ticking in the background
      // after you've navigated away from this tab.
      if (embeddedHabitController) {
        embeddedHabitController.destroy();
        embeddedHabitController = null;
      }
      embeddedHabitController = await this.mountHabitTracker(paneHabits, "", null);
    };

    const switchDockTab = (targetId) => {
      appEl.querySelectorAll(".soma-dock-tab").forEach(t => t.classList.toggle("active", t.dataset.target === targetId));
      appEl.querySelectorAll(".soma-view-pane").forEach(p => p.classList.toggle("active", p.id === targetId));

      if (targetId === "pane-macros") renderMacrosView();
      if (targetId === "pane-habits") renderHabitsView();
      if (targetId === "pane-heatmap") renderHeatmapView();
      if (targetId === "pane-calendar") renderCalendarView();
      if (targetId === "pane-prs") renderPrsView();
      if (targetId === "pane-creatine") renderCreatineView();
      if (targetId === "pane-recovery") renderRecoveryView();
      if (targetId === "pane-settings") renderSettingsView();

      // Fix: switching tabs used to leave whatever scroll position you had
      // in the previous tab, so the new pane could open already scrolled
      // halfway down (e.g. the heatmap SVG cropped mid-body). Snap the
      // whole widget back into view at the top on every tab switch.
      requestAnimationFrame(() => {
        root.scrollIntoView({ block: "start", behavior: "auto" });
      });
    };

    appEl.querySelectorAll(".soma-dock-tab").forEach(tab => {
      tab.onclick = () => switchDockTab(tab.dataset.target);
    });

    const initWorkoutView = () => {
      const splitOptionsHtml = Object.keys(ROUTINE_PRESETS).map(r => `<option value="${r}">${r}</option>`).join("");
      const currentProj = SomaIntelligenceEngine.getProgramProjectedDay(parseLocalDateKey(noteDateKey), settings.scheduleOverrides || {});

      paneWorkout.innerHTML = `
        <div class="soma-card soma-hero-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="soma-tag-badge">🎯 Scheduled For (${noteDateKey})</div>
              <div class="soma-hero-title">${state.activeSplit}</div>
              <div class="soma-hero-sub">${currentProj.phase} • <i>${currentProj.repScheme}</i></div>
            </div>
            <span class="soma-tag soma-tag-emerald">${currentProj.phaseBadge}</span>
          </div>
        </div>

        <div class="soma-topbar">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="soma-badge-pill">SOMA PRO</span>
            <span style="font-weight:800; font-size:0.92rem; color:#f3f4f6;">Live Logger</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="soma-btn-icon" data-action="undo-action" title="Undo">↩</button>
            <button class="soma-btn-icon" data-action="redo-action" title="Redo">↪</button>
            <div class="soma-live-duration" id="live-session-time">⏱️ 00:00</div>
          </div>
        </div>

        <div class="soma-stats-grid">
          <div class="soma-stat-box"><div class="soma-stat-lbl">Est. Burn</div><div class="soma-stat-val" id="stat-cals" style="color:#f59e0b;">0 kcal</div></div>
          <div class="soma-stat-box"><div class="soma-stat-lbl">Volume (${settings.unit})</div><div class="soma-stat-val" id="stat-vol" style="color:#e5e7eb;">0</div></div>
          <div class="soma-stat-box"><div class="soma-stat-lbl">Sets Done</div><div class="soma-stat-val" id="stat-sets" style="color:#10b981;">0</div></div>
          <div class="soma-stat-box"><div class="soma-stat-lbl">Movements</div><div class="soma-stat-val" id="stat-ex">0</div></div>
        </div>

        <div class="soma-timer-dock">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="soma-timer-ring-box">
              <svg class="soma-timer-ring-svg" width="54" height="54">
                <circle class="soma-timer-ring-bg" cx="27" cy="27" r="22" />
                <circle class="soma-timer-ring-bar" id="soma-timer-ring" cx="27" cy="27" r="22" stroke-dasharray="138.23" stroke-dashoffset="0" />
              </svg>
              <div class="soma-timer-ring-txt" id="soma-timer-val">${settings.restDefault}s</div>
            </div>
            <div>
              <div style="font-weight:800; font-size:0.85rem; color:#f3f4f6;">Rest Countdown</div>
              <div style="font-size:0.7rem; color:#9ca3af;">Auto-triggers on set check</div>
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="soma-timer-btn" data-action="quick-rest" data-seconds="60">+60s</button>
            <button class="soma-timer-btn" data-action="quick-rest" data-seconds="90">+90s</button>
            <button class="soma-timer-btn" data-action="reset-rest" style="background:#ef4444; border-color:#ef4444;">Reset</button>
          </div>
        </div>

        <div class="soma-action-row">
          <button class="soma-btn" data-action="open-split-drawer">⚡ Load Split</button>
          <button class="soma-btn" data-action="open-add-drawer">🔍 Add Movement</button>
          <button class="soma-btn" data-action="open-custom-modal">➕ Custom</button>
          <button class="soma-btn soma-btn-save" data-action="save-workout">💾 Save Log</button>
        </div>

        <div class="soma-card" id="routine-selector" style="display:none; margin-bottom:14px; border-color:rgba(255,255,255,0.2);">
          <div style="font-weight:800; font-size:0.92rem; margin-bottom:10px; color:#fff;">Select S-Tier Routine Split</div>
          <select class="soma-input" id="split-select" style="text-align:left; height:40px; margin-bottom:10px;">${splitOptionsHtml}</select>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="soma-btn" data-action="cancel-split-drawer">Cancel</button>
            <button class="soma-btn soma-btn-accent" data-action="load-selected-split">Load Split</button>
          </div>
        </div>

        <div class="soma-card" id="add-selector" style="display:none; margin-bottom:14px; border-color:rgba(255,255,255,0.2);">
          <div style="font-weight:800; font-size:0.92rem; margin-bottom:8px; color:#fff;">Search & Add Movement</div>
          <input type="text" class="soma-input" id="search-box" style="text-align:left; padding:8px 12px; margin-bottom:8px;" placeholder="Search by name, muscle, target..." />
          <div id="search-list" style="max-height:190px; overflow-y:auto; border:1px solid rgba(255,255,255,0.08); border-radius:12px; background:#111217; margin-bottom:10px;"></div>
          <div style="display:flex; justify-content:flex-end;">
            <button class="soma-btn" data-action="close-add-drawer">Close</button>
          </div>
        </div>

        <div id="cards-container"></div>
      `;

      const searchBox = paneWorkout.querySelector("#search-box");
      const searchList = paneWorkout.querySelector("#search-list");

      const renderSearchList = (query) => {
        const q = (query || "").toLowerCase();
        const filtered = exerciseDB.filter(ex => ex.name.toLowerCase().includes(q) || ex.subTarget.toLowerCase().includes(q) || ex.muscle.toLowerCase().includes(q));
        if (filtered.length === 0) {
          searchList.innerHTML = '<div style="padding:10px; color:#9ca3af; font-size:0.8rem; text-align:center;">No matching movements found.</div>';
          return;
        }
        searchList.innerHTML = filtered.map(ex => `
          <div class="soma-search-item" data-action="select-search-ex" data-name="${ex.name}">
            <div style="font-weight:700; color:#ffffff; font-size:0.85rem;">${ex.name}</div>
            <div style="font-size:0.72rem; color:#9ca3af; display:flex; gap:6px; margin-top:2px;">
              <span>${ex.subTarget}</span> • <span>${ex.tier}</span>
            </div>
          </div>
        `).join("");
      };

      if (searchBox) searchBox.oninput = () => renderSearchList(searchBox.value);

      const updateLiveDuration = () => {
        const elapsed = Math.max(0, Math.floor((Date.now() - state.sessionStartTime) / 1000));
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const durEl = paneWorkout.querySelector("#live-session-time");
        if (durEl) durEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };

      if (workoutDurationInterval) this.untrackInterval(workoutDurationInterval);
      workoutDurationInterval = this.trackInterval(updateLiveDuration, 1000);
      updateLiveDuration();
    };

    const addExerciseToSession = (name) => {
      state.recordSnapshot();
      const data = exerciseDB.find(e => e.name === name) || { name, muscle: "Custom", targetKeys: [] };
      const isBW = !!data.isBW;
      const last = this.getLastPerformance(history, data.name);
      const target = SomaIntelligenceEngine.computeOverloadRecommendation(last, isBW);

      state.sessionExercises.push({
        name: data.name,
        muscle: data.muscle,
        subTarget: data.subTarget || "",
        targetKeys: data.targetKeys || [],
        position: data.position || "",
        risk: data.risk || "Low 🟢",
        tier: data.tier || "A-Tier",
        isAxial: !!data.isAxial,
        isBW: isBW,
        usesBar: exerciseUsesBar(data.name),
        barWeight: settings.barWeight,
        overloadTarget: target,
        supersetGroup: "",
        sets: [
          { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: 2, done: false, type: "normal" },
          { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: 2, done: false, type: "normal" },
          { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: Math.max(6, target.reps - 1), failure: 3, done: false, type: "normal" }
        ]
      });
      renderTracker();
    };

    const updateStats = () => {
      let totalVol = 0, totalSets = 0, sumIntensity = 0;
      for (const ex of state.sessionExercises) {
        for (const s of ex.sets) {
          if (s.done) {
            totalSets++;
            const defaultW = ex.isBW ? 0 : 80;
            const w = parseFloat(s.weight) >= 0 ? parseFloat(s.weight) : defaultW;
            const r = parseFloat(s.reps) || 8;
            totalVol += SomaIntelligenceEngine.calculateWorkVolume(w, r, ex.isBW);
            sumIntensity += (parseFloat(s.failure) || 3);
          }
        }
      }
      const elapsedMins = Math.max(1, Math.round((Date.now() - state.sessionStartTime) / 60000));
      const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
      const cals = SomaIntelligenceEngine.calculateCaloriesBurned(elapsedMins, totalVol, totalSets, avgIntensity);

      const statCals = paneWorkout.querySelector("#stat-cals");
      const statVol = paneWorkout.querySelector("#stat-vol");
      const statSets = paneWorkout.querySelector("#stat-sets");
      const statEx = paneWorkout.querySelector("#stat-ex");

      if (statCals) statCals.textContent = `${cals} kcal`;
      if (statVol) statVol.textContent = totalVol.toLocaleString();
      if (statSets) statSets.textContent = String(totalSets);
      if (statEx) statEx.textContent = String(state.sessionExercises.length);
    };

    const showPlateCalculator = (weight, barWeightOverride) => {
      const popover = appEl.querySelector("#plate-popover");
      const renderEl = appEl.querySelector("#plate-bar-render");
      const listEl = appEl.querySelector("#plate-breakdown-list");
      const textEl = appEl.querySelector("#plate-popover-text");
      if (!popover) return;

      const barW = (typeof barWeightOverride === "number" && barWeightOverride > 0) ? barWeightOverride : settings.barWeight;
      const w = parseFloat(weight) || 80;
      textEl.textContent = `Bar: ${barW}${settings.unit} • Per Side: ${Math.max(0, ((w - barW) / 2)).toFixed(1)} ${settings.unit}`;
      const plates = SomaIntelligenceEngine.calculatePlateStack(w, barW, settings.unit);

      let discsHtml = '<div style="width:14px; height:10px; background:#9ca3af; border-radius:2px;"></div>';
      for (const p of plates) {
        discsHtml += `<div style="background:${p.color}; width:8px; height:34px; border-radius:3px;"></div>`;
      }
      renderEl.innerHTML = discsHtml;
      listEl.innerHTML = plates.length > 0 ? `Stack: <b>${plates.map(p => p.weight + settings.unit).join(" + ")}</b>` : "Olympic Bar Only";

      const warmupEl = appEl.querySelector("#plate-warmup-list");
      if (warmupEl) {
        if (w > barW) {
          const ramp = SomaIntelligenceEngine.calculateWarmupRamp(w, barW, settings.unit);
          warmupEl.innerHTML = ramp.map(r => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-top:1px dashed rgba(255,255,255,0.08);">
              <span style="color:#9ca3af;">${r.pct}% Warm-up</span>
              <span style="color:#e5e7eb; font-weight:700;">${r.weight}${settings.unit} ${r.plates.length > 0 ? `(${r.plates.map(p => p.weight).join('+')} /side)` : '(bar only)'}</span>
            </div>
          `).join("");
        } else {
          warmupEl.innerHTML = "";
        }
      }

      popover.style.display = "block";
    };

    const renderTracker = () => {
      const cardsContainer = paneWorkout.querySelector("#cards-container");
      if (!cardsContainer) return;
      cardsContainer.innerHTML = "";

      state.sessionExercises.forEach((ex, exIdx) => {
        const card = document.createElement("div");
        card.className = "soma-card";

        const groupInfo = supersetGroupInfo(ex.supersetGroup);
        if (groupInfo.id) {
          card.style.borderLeft = `4px solid ${groupInfo.color}`;
        }

        const targetInfo = ex.overloadTarget ? `
          <div class="soma-target-intel">
            <div>
              <span>🎯 <b>Smart Target:</b> ${ex.isBW && ex.overloadTarget.weight === 0 ? 'Bodyweight' : ex.overloadTarget.weight + ' ' + settings.unit} × ${ex.overloadTarget.reps} reps</span>
              <div style="font-size:0.68rem; color:#9ca3af; margin-top:2px;">${ex.overloadTarget.note}</div>
            </div>
            <span class="soma-tag ${ex.overloadTarget.diffTier.includes('Lvl 1') ? 'soma-tag-emerald' : 'soma-tag-gray'}">${ex.overloadTarget.diffTier}</span>
          </div>
        ` : '';

        const tagsHtml = `
          <div class="soma-tag-wrap">
            ${groupInfo.id ? `<span class="soma-tag soma-tag-superset" style="background:${groupInfo.color}22; color:${groupInfo.color}; border:1px solid ${groupInfo.color}55;">🔗 Superset ${groupInfo.label}</span>` : ''}
            ${ex.isBW ? `<span class="soma-tag soma-tag-emerald">🧍 Bodyweight</span>` : ''}
            ${ex.subTarget ? `<span class="soma-tag soma-tag-gray">${ex.subTarget}</span>` : ''}
            ${ex.tier ? `<span class="soma-tag soma-tag-white">${ex.tier}</span>` : ''}
            ${ex.isAxial ? `<span class="soma-tag soma-tag-red">⚡ Axial Spinal Load</span>` : ''}
          </div>
        `;

        const barPresets = BAR_PRESETS[settings.unit] || BAR_PRESETS.kg;
        const currentPreset = barPresets.find(p => p.weight === ex.barWeight);
        const barSelectHtml = ex.usesBar ? `
          <div class="soma-bar-select-wrap" style="display:flex; align-items:center; gap:6px; margin:6px 0;">
            <select class="soma-input set-bar-select" data-ex="${exIdx}" style="font-size:0.72rem; padding:4px 6px; width:auto; flex:1;">
              ${barPresets.map(p => `<option value="${p.id}" ${currentPreset ? (currentPreset.id === p.id ? 'selected' : '') : (p.id === 'custom' ? 'selected' : '')}>${p.label}</option>`).join("")}
            </select>
            ${!currentPreset ? `<input type="number" class="soma-input set-bar-custom" data-ex="${exIdx}" value="${ex.barWeight}" placeholder="Bar kg" style="width:64px; font-size:0.72rem; padding:4px 6px;" />` : ''}
            <span style="font-size:0.68rem; color:#9ca3af;">Type <b>added</b> weight below (e.g. 2×10${settings.unit} → 20${settings.unit})</span>
          </div>
        ` : '';

        let rowsHtml = `
          <div class="soma-set-row">
            <div class="soma-th">SET</div>
            <div class="soma-th">${(ex.isBW || ex.usesBar) ? '+' + settings.unit.toUpperCase() : settings.unit.toUpperCase()}</div>
            <div class="soma-th">REPS</div>
            <div class="soma-th">DIFF (1-5)</div>
            <div class="soma-th">DONE</div>
            <div></div>
          </div>
        `;

        ex.sets.forEach((s, sIdx) => {
          const placeholderKg = (ex.isBW || ex.usesBar) ? "0" : "80";
          const totalW = getTotalWeight(ex, s);
          const totalHint = ex.usesBar && totalW > 0 ? `<div style="font-size:0.62rem; color:#71717a; text-align:center; margin-top:1px;">= ${totalW}${settings.unit}</div>` : '';
          const isDropSet = s.type === "dropset";
          const setNumLabel = isDropSet ? "↳D" : String(sIdx + 1);
          rowsHtml += `
            <div class="soma-set-row ${s.done ? 'row-done' : ''} ${isDropSet ? 'row-dropset' : ''}">
              <button class="soma-set-num-btn ${isDropSet ? 'is-dropset' : ''}" data-action="toggle-set-type" data-ex="${exIdx}" data-set="${sIdx}" title="${isDropSet ? 'Drop set — tap to make it a normal set' : 'Tap to mark as a drop set'}">${setNumLabel}</button>
              <div>
                <input type="number" class="soma-input set-weight" data-ex="${exIdx}" data-set="${sIdx}" value="${s.weight}" placeholder="${placeholderKg}" />
                ${totalHint}
              </div>
              <input type="number" class="soma-input set-reps" data-ex="${exIdx}" data-set="${sIdx}" value="${s.reps}" placeholder="8" />
              <select class="soma-input set-fail" data-ex="${exIdx}" data-set="${sIdx}" style="padding:0 2px;">
                <option value="1" ${s.failure == 1 ? 'selected' : ''}>1 (Very Easy)</option>
                <option value="2" ${s.failure == 2 ? 'selected' : ''}>2 (Easy/RIR 2)</option>
                <option value="3" ${s.failure == 3 ? 'selected' : ''}>3 (Target)</option>
                <option value="4" ${s.failure == 4 ? 'selected' : ''}>4 (Hard/Grind)</option>
                <option value="5" ${s.failure == 5 ? 'selected' : ''}>5 (Failure)</option>
              </select>
              <input type="checkbox" class="soma-check set-done" data-ex="${exIdx}" data-set="${sIdx}" ${s.done ? "checked" : ""} />
              <button class="soma-btn-del" data-action="del-set" data-ex="${exIdx}" data-set="${sIdx}">✕</button>
            </div>
          `;
        });

        card.innerHTML = `
          <div class="soma-card-top">
            <span class="soma-card-title">${exIdx + 1}. ${ex.name}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <button class="soma-btn-superset ${groupInfo.id ? 'is-active' : ''}" data-action="cycle-superset" data-ex="${exIdx}" style="${groupInfo.id ? `color:${groupInfo.color}; border-color:${groupInfo.color}66;` : ''}" title="Link this exercise into a superset group">🔗${groupInfo.id ? ' ' + groupInfo.label : ''}</button>
              <button class="soma-btn-del" data-action="del-card" data-ex="${exIdx}">✕</button>
            </div>
          </div>
          ${tagsHtml}
          ${barSelectHtml}
          ${targetInfo}
          ${rowsHtml}
          <div style="display:flex; gap:8px;">
            <button class="soma-btn-addset" data-action="add-set" data-ex="${exIdx}" style="flex:1;">+ Add Set</button>
            <button class="soma-btn-addset soma-btn-adddropset" data-action="add-drop-set" data-ex="${exIdx}" style="flex:1;">+ Add Drop Set</button>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
      updateStats();
    };

    const renderFinishedScreen = (data) => {
      if (workoutDurationInterval) this.untrackInterval(workoutDurationInterval);
      if (restTimerInterval) this.untrackInterval(restTimerInterval);

      let cardsHtml = "";
      (data.exercises || []).forEach(ex => {
        let setsListHtml = "";
        (ex.sets || []).forEach((s, idx) => {
          const defaultKg = ex.isBW ? "0" : "80";
          const displayWeight = (s.weight !== undefined && s.weight !== "") ? s.weight : (s.done ? defaultKg : "0");
          const displayReps = (s.reps !== undefined && s.reps !== "") ? s.reps : (s.done ? "8" : "0");
          const failLevel = s.failure || "3";

          let weightLabel;
          if (ex.usesBar) {
            const rawW = parseFloat(displayWeight) || 0;
            const totalW = rawW > 0 ? (ex.barWeight || settings.barWeight) + rawW : (ex.barWeight || settings.barWeight);
            weightLabel = rawW > 0 ? `${totalW} ${settings.unit} (bar + ${rawW})` : `${totalW} ${settings.unit} (bar only)`;
          } else {
            weightLabel = ex.isBW
              ? (parseFloat(displayWeight) > 0 ? `+${displayWeight} ${settings.unit}` : `Bodyweight`)
              : `${displayWeight} ${settings.unit}`;
          }

          setsListHtml += `
            <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.8rem;">
              <span>${s.type === "dropset" ? "↳ Drop" : `Set ${idx + 1}`}: <b>${weightLabel}</b> × <b>${displayReps} reps</b></span>
              <span style="color:${s.done ? '#10b981' : '#9ca3af'}; font-weight:700;">Lvl ${failLevel} ${s.done ? '✅' : '⏳'}</span>
            </div>
          `;
        });

        const finishedGroupInfo = supersetGroupInfo(ex.supersetGroup);
        cardsHtml += `
          <div class="soma-card" ${finishedGroupInfo.id ? `style="border-left:4px solid ${finishedGroupInfo.color};"` : ''}>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-weight:800; font-size:0.95rem; color:#fff;">${ex.name}</span>
              <span style="display:flex; gap:6px;">
                ${finishedGroupInfo.id ? `<span class="soma-tag" style="background:${finishedGroupInfo.color}22; color:${finishedGroupInfo.color}; border:1px solid ${finishedGroupInfo.color}55;">🔗 ${finishedGroupInfo.label}</span>` : ''}
                <span class="soma-tag soma-tag-gray">${ex.subTarget || ex.muscle}</span>
              </span>
            </div>
            <div>${setsListHtml}</div>
          </div>
        `;
      });

      paneWorkout.innerHTML = `
        <div style="text-align:center; padding:10px 0 16px 0;">
          <span class="soma-tag-badge" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);">Session Completed</span>
          <h2 style="font-size:1.35rem; font-weight:800; color:#fff; margin:6px 0 0 0;">Workout Summary</h2>
          <div style="font-size:0.78rem; color:#9ca3af; margin-top:4px;">Logged & synced to vault note properties.</div>
        </div>
        <div class="soma-stats-grid">
          <div class="soma-stat-box"><div class="soma-stat-lbl">Duration</div><div class="soma-stat-val" style="color:#10b981;">${data.durationFormatted}</div></div>
          <div class="soma-stat-box"><div class="soma-stat-lbl">Burn Target</div><div class="soma-stat-val" style="color:#f59e0b;">${data.caloriesBurned} kcal</div></div>
          <div class="soma-stat-box"><div class="soma-stat-lbl">Volume (Added)</div><div class="soma-stat-val">${(data.totalVol || 0).toLocaleString()} ${settings.unit}</div></div>
          <div class="soma-stat-box"><div class="soma-stat-lbl">Sets Done</div><div class="soma-stat-val">${data.totalSets}</div></div>
        </div>
        <div>${cardsHtml}</div>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="soma-btn" data-action="edit-session" style="flex:1.2; background:#22252f; border-color:rgba(255,255,255,0.18);">✏️ Edit Session</button>
          <button class="soma-btn" data-action="reset-session" style="flex:0.8; background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#fca5a5;">🗑️ Reset</button>
        </div>
      `;
    };

    // ========================================================================
    // RECOVERY HUD SVG RENDER PIPELINE
    // ========================================================================
    const HEAT_TIERS = {
      fresh:    { base: "#22c55e", light: "#a7f3c8", dark: "#0f2e1c" },
      low:      { base: "#eab308", light: "#fde68a", dark: "#3f2f08" },
      moderate: { base: "#f97316", light: "#fdc493", dark: "#3f200a" },
      high:     { base: "#ef4444", light: "#fca5a5", dark: "#3f1212" }
    };

    function getHeatTier(recovery) {
      if (recovery >= 90) return HEAT_TIERS.fresh;
      if (recovery >= 70) return HEAT_TIERS.low;
      if (recovery >= 40) return HEAT_TIERS.moderate;
      return HEAT_TIERS.high;
    }

    const computeBiologicalReadiness = () => {
      const BASE_RECOVERY_HOURS = {
        calves: 24, calves_back: 24, deltoids_back: 24, forearms: 24,
        biceps: 36, deltoids: 36,
        chest: 48, upper_back: 48, trapezius_back: 48, triceps: 48, triceps_back: 48, gluteal: 48, adductors: 48,
        quadriceps: 72, hamstring: 72, lower_back: 72
      };

      // Effort → recovery-time multiplier. This is the piece that was
      // missing before: a light/moderate set (not taken near failure)
      // should demand meaningfully LESS recovery than a true all-out set,
      // instead of only nudging the base hours by a few percent.
      //   1 = Very Easy      → 0.35x recovery time needed
      //   2 = Easy / RIR 2    → 0.60x
      //   3 = Target          → 1.00x (this is what the base hours assume)
      //   4 = Hard / Grind    → 1.30x
      //   5 = True Failure    → 1.60x
      const EFFORT_MULTIPLIER = { 1: 0.35, 2: 0.60, 3: 1.00, 4: 1.30, 5: 1.60 };

      const now = Date.now();
      const latestStimulus = {};

      for (const [dateKey, session] of Object.entries(history)) {
        const sessionTime = session.timestamp || now;
        if (session.muscles) {
          for (const [mKey, stats] of Object.entries(session.muscles)) {
            if (!latestStimulus[mKey] || sessionTime > latestStimulus[mKey].timestamp) {
              latestStimulus[mKey] = {
                timestamp: sessionTime,
                sets: stats.sets || 3,
                avgFail: stats.avgFail || 3
              };
            }
          }
        }
      }

      for (const key in muscleRegistry) {
        const baseT = BASE_RECOVERY_HOURS[key] || muscleRegistry[key].defaultHours || 48;
        muscleRegistry[key].defaultHours = baseT;

        if (latestStimulus[key]) {
          const elapsedHours = (now - latestStimulus[key].timestamp) / 3600000;
          const sets = latestStimulus[key].sets;
          const avgFail = latestStimulus[key].avgFail;

          // Volume factor: 3 working sets is the "normal dose" this base
          // time assumes. Fewer sets need proportionally less recovery,
          // more sets need proportionally more — clamped so a single set
          // or a huge session doesn't send this to an extreme.
          const volumeFactor = Math.min(1.8, Math.max(0.45, sets / 3));

          // Effort factor: interpolate between the defined levels so a
          // 2.3 average difficulty lands between "Easy" and "Target".
          const lo = Math.floor(avgFail), hi = Math.ceil(avgFail);
          const effortFactor = lo === hi
            ? (EFFORT_MULTIPLIER[lo] || 1)
            : (EFFORT_MULTIPLIER[lo] || 1) + ((EFFORT_MULTIPLIER[hi] || 1) - (EFFORT_MULTIPLIER[lo] || 1)) * (avgFail - lo);

          // Overall required recovery time, bounded to 30%–200% of the
          // muscle's base so nothing goes absurdly short or long.
          const tTarget = Math.min(baseT * 2, Math.max(baseT * 0.3, baseT * volumeFactor * effortFactor));

          // Concave (not convex) decay: most of the readiness comes back
          // in the earlier hours, tapering off near full recovery — this
          // matches real recovery better than the old formula, which kept
          // muscles pinned near 0% readiness for a while right after a
          // light session.
          const readiness = Math.min(100, Math.pow(Math.max(0, elapsedHours) / tTarget, 0.8) * 100);
          const hoursLeft = Math.max(0, Math.round(tTarget - elapsedHours));

          muscleRegistry[key].recovery = Math.round(readiness);
          muscleRegistry[key].hoursLeft = hoursLeft;
          muscleRegistry[key].lastWorkedHours = Math.round(elapsedHours);
          muscleRegistry[key].effortNote = avgFail <= 1.5 ? "Very Easy" : avgFail <= 2.5 ? "Easy" : avgFail <= 3.5 ? "Target" : avgFail <= 4.5 ? "Hard" : "True Failure";
          muscleRegistry[key].adjustedHours = Math.round(tTarget);
          muscleRegistry[key].baseHours = baseT;
        } else {
          muscleRegistry[key].recovery = 100;
          muscleRegistry[key].hoursLeft = 0;
          muscleRegistry[key].lastWorkedHours = null;
          muscleRegistry[key].effortNote = null;
        }
      }
    };

    const renderHeatmapView = () => {
      computeBiologicalReadiness();

      paneHeatmap.innerHTML = `
        <div class="bm3-header">
          <div class="bm3-title"><span class="bm3-icon">🧬</span> Musculoskeletal Recovery HUD</div>
          <div class="bm3-subtitle">Biological fatigue decay • Real-time recovery timeline</div>
        </div>

        <div class="bm3-viewtabs">
          <button class="bm3-viewtab ${heatmapCurrentView === 'front' ? 'active' : ''}" data-action="hm-switch-front">FRONT</button>
          <button class="bm3-viewtab ${heatmapCurrentView === 'back' ? 'active' : ''}" data-action="hm-switch-back">BACK</button>
        </div>

        <div class="bm3-layout">
          <div class="bm3-panel">
            <div class="bm3-panel-title">READINESS SCORE</div>
            <div class="bm3-legend-row"><div class="bm3-dot" style="background:#22c55e;"></div><div class="bm3-legend-text">90 - 100%<span class="sub">(Fully Primed)</span></div></div>
            <div class="bm3-legend-row"><div class="bm3-dot" style="background:#eab308;"></div><div class="bm3-legend-text">70 - 89%<span class="sub">(Supercompensated)</span></div></div>
            <div class="bm3-legend-row"><div class="bm3-dot" style="background:#f97316;"></div><div class="bm3-legend-text">40 - 69%<span class="sub">(Repair Phase)</span></div></div>
            <div class="bm3-legend-row"><div class="bm3-dot" style="background:#ef4444;"></div><div class="bm3-legend-text">0 - 39%<span class="sub">(Acute Fatigue)</span></div></div>
          </div>

          <div class="bm3-viewport" id="soma-hm-viewport"></div>

          <div class="bm3-panel">
            <div class="bm3-panel-title">TRAINING INTEL</div>
            <div style="font-size:0.75rem; color:#94a3b8; line-height:1.4;">Tap any anatomical muscle node to inspect remaining latency & load tolerance.</div>
          </div>
        </div>

        <div class="bm3-detail-card" id="soma-hm-detail-card">
          <div>
            <div class="bm3-detail-name" id="hm-detail-name">Chest (Pectoralis Major)</div>
            <div class="bm3-detail-hours" id="hm-detail-hours">🟢 100% Fully Recovered • Ready for max overload</div>
            <div class="bm3-detail-desc" id="hm-detail-desc">Clavicular and Sternal heads primed for maximal overload stimulus.</div>
          </div>
          <div class="bm3-detail-tag" id="hm-detail-tag" style="background:#22c55e;">100%</div>
        </div>
      `;

      renderSvgBody();
    };

    function buildDefs(view) {
      let defs = "";
      const instanceId = "soma-hud";
      for (const [key, item] of Object.entries(muscleRegistry)) {
        if (item.view !== view) continue;
        const tier = getHeatTier(item.recovery);
        const gid = `grad-${instanceId}-${view}-${key}`;

        defs += `
          <radialGradient id="${gid}" cx="32%" cy="26%" r="80%">
            <stop offset="0%" stop-color="${tier.light}" stop-opacity="1" />
            <stop offset="30%" stop-color="${tier.base}" stop-opacity="1" />
            <stop offset="62%" stop-color="${tier.base}" stop-opacity="0.96" />
            <stop offset="85%" stop-color="${tier.dark}" stop-opacity="0.97" />
            <stop offset="100%" stop-color="${tier.dark}" stop-opacity="1" />
          </radialGradient>
        `;

        const pid = `fiber-${instanceId}-${view}-${key}`;
        defs += `
          <pattern id="${pid}" width="5" height="5" patternTransform="rotate(58)" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="5" stroke="#000000" stroke-width="0.8" stroke-opacity="0.75" />
            <line x1="2.5" y1="0" x2="2.5" y2="5" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.38" />
          </pattern>
        `;
      }
      return defs;
    }

    function renderSvgBody() {
      const viewport = paneHeatmap.querySelector("#soma-hm-viewport");
      if (!viewport) return;

      const instanceId = "soma-hud";
      const view = heatmapCurrentView;
      const outline = view === "front" ? (somaData.FRONT_OUTLINE || "") : (somaData.BACK_OUTLINE || "");
      const vb = view === "front" ? "0 0 724 1448" : "724 0 724 1448";
      const staticParts = (somaData.STATIC_PARTS && somaData.STATIC_PARTS[view]) ? somaData.STATIC_PARTS[view] : {};
      const defsHtml = buildDefs(view);
      let pathsHtml = "";

      for (const [partKey, partData] of Object.entries(staticParts)) {
        pathsHtml += `<path class="bm3-static-part" d="${partData.d}" fill="${partData.color}" />`;
      }

      for (const [key, item] of Object.entries(muscleRegistry)) {
        if (item.view !== view) continue;
        const gid = `grad-${instanceId}-${view}-${key}`;
        const tier = getHeatTier(item.recovery);
        const isSelected = key === heatmapSelectedKey;
        const fill = `url(#${gid})`;
        const stroke = tier.dark;
        const pathClass = `bm3-muscle-path${isSelected ? " selected" : ""}`;

        pathsHtml += `<g class="bm3-muscle-group${isSelected ? " selected" : ""}">`;
        (item.paths || []).forEach(p => {
          pathsHtml += `<path class="${pathClass}" data-key="${key}" d="${p}" fill="${fill}" stroke="${stroke}" stroke-width="0.6" style="color:${tier.base}" />`;
        });

        const pid = `fiber-${instanceId}-${view}-${key}`;
        (item.paths || []).forEach(p => {
          pathsHtml += `<path class="bm3-fiber-overlay${isSelected ? " selected" : ""}" data-key="${key}" d="${p}" fill="url(#${pid})" />`;
        });
        pathsHtml += `</g>`;
      }

      viewport.innerHTML = `
        <svg class="bm3-vector-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
          <defs>${defsHtml}</defs>
          <path class="bm3-base-body" d="${outline}" />
          ${pathsHtml}
        </svg>
      `;

      const svgEl = viewport.querySelector(".bm3-vector-svg");
      if (!svgEl) return;

      svgEl.querySelectorAll(".bm3-muscle-path").forEach(p => {
        const key = p.getAttribute("data-key");
        p.addEventListener("mouseenter", () => renderHeatmapDetails(key));
        p.addEventListener("click", () => {
          heatmapSelectedKey = key;
          const b = p.getBBox();
          heatmapSelectedPoint = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
          renderSvgBody();
          renderHeatmapDetails(key);
        });
      });

      if (heatmapSelectedKey && heatmapSelectedPoint) {
        showHeatmapAnnotation(svgEl, view, heatmapSelectedPoint, muscleRegistry[heatmapSelectedKey]?.name || "");
      }
    }

    function renderHeatmapDetails(key) {
      const model = muscleRegistry[key];
      if (!model) return;
      const tier = getHeatTier(model.recovery);
      const nameEl = paneHeatmap.querySelector("#hm-detail-name");
      const hoursEl = paneHeatmap.querySelector("#hm-detail-hours");
      const descEl = paneHeatmap.querySelector("#hm-detail-desc");
      const tagEl = paneHeatmap.querySelector("#hm-detail-tag");
      const cardEl = paneHeatmap.querySelector("#soma-hm-detail-card");

      if (nameEl) nameEl.textContent = model.name;
      if (hoursEl) {
        hoursEl.innerHTML = model.recovery >= 90
          ? `🟢 100% Fully Recovered • Ready for max overload`
          : `⏱ ${model.hoursLeft} Hours to Full Recovery • ${model.recovery}% Readiness`;
      }
      if (descEl) {
        const baseDesc = model.desc || "Muscle tissue undergoing metabolic recovery and protein synthesis.";
        if (model.effortNote && model.recovery < 90) {
          descEl.innerHTML = `${baseDesc}<br><span style="color:#9ca3af; font-size:0.72rem;">Last session: <b>${model.effortNote}</b> effort • Adjusted recovery window: <b>${model.adjustedHours}h</b> (base ${model.baseHours}h)</span>`;
        } else {
          descEl.textContent = baseDesc;
        }
      }
      if (tagEl) {
        tagEl.textContent = `${model.recovery}%`;
        tagEl.style.background = tier.base;
      }
      if (cardEl) cardEl.style.borderColor = tier.base + "80";
    }

    function showHeatmapAnnotation(svgEl, view, point, label) {
      const existing = svgEl.querySelector(".bm3-annot-group");
      if (existing) existing.remove();

      const cx = point.x, cy = point.y;
      const vbX = view === "front" ? 0 : 724;
      const vbWidth = 724;
      const centerX = vbX + vbWidth / 2;
      const routeLeft = cx < centerX;

      const LEADER_OFFSET = 56;
      const EDGE_MARGIN = 14;
      const minX = vbX + EDGE_MARGIN, maxX = vbX + vbWidth - EDGE_MARGIN;
      let targetX = routeLeft ? cx - LEADER_OFFSET : cx + LEADER_OFFSET;
      targetX = Math.max(minX, Math.min(maxX, targetX));

      const textAnchor = routeLeft ? "end" : "start";
      const textX = targetX + (routeLeft ? -12 : 12);
      const textLength = label.length * 14;
      const backdropPad = 8;
      const backdropX = routeLeft ? textX - textLength - backdropPad : textX;
      const backdropWidth = textLength + backdropPad * 2;

      const html = `
        <g class="bm3-annot-group">
          <line x1="${cx}" y1="${cy}" x2="${targetX}" y2="${cy}" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
          <circle class="bm3-annot-dot" cx="${cx}" cy="${cy}" r="9" fill="#38bdf8" stroke="#0b1220" stroke-width="3" />
          <rect class="bm3-annot-backdrop" x="${backdropX}" y="${cy - 18}" width="${backdropWidth}" height="36" />
          <text x="${textX}" y="${cy}" fill="#f8fafc" font-size="29" font-weight="800"
                text-anchor="${textAnchor}" dominant-baseline="middle"
                style="paint-order: stroke; stroke: #0b1220; stroke-width: 6px; stroke-linejoin: round;">${label}</text>
        </g>
      `;
      svgEl.insertAdjacentHTML("beforeend", html);
    }

    // ========================================================================
    // VIEW 3: 6-MONTH PERIODIZATION CALENDAR & SUBSCRIPTION ENGINE
    // ========================================================================
    const renderCalendarView = () => {
      const year = calViewDate.getFullYear();
      const month = calViewDate.getMonth();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const sampleProg = SomaIntelligenceEngine.getProgramProjectedDay(new Date(year, month, 1, 12, 0, 0), settings.scheduleOverrides || {});

      const firstDayOfWeek = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      let gridHtml = "";
      const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      for (const d of weekdays) gridHtml += `<div class="soma-cal-head-day">${d}</div>`;
      for (let i = 0; i < firstDayOfWeek; i++) gridHtml += `<div class="soma-cal-empty"></div>`;

      let mLoggedCount = 0, mTotalVol = 0, mRestCount = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const currentCellDate = new Date(year, month, d, 12, 0, 0);
        const dateKey = getLocalDateKey(currentCellDate);
        const isToday = dateKey === noteDateKey;
        const session = history[dateKey];
        const projection = SomaIntelligenceEngine.getProgramProjectedDay(currentCellDate, settings.scheduleOverrides || {});

        const isSubExpiry = settings.subEndDate === dateKey;

        if (session) {
          mLoggedCount++;
          mTotalVol += (session.totalVol || 0);
        } else if (projection.isRest) {
          mRestCount++;
        }

        const tag = session ? "DONE" : (projection.isRest ? "REST" : projection.split.split(" ")[0].toUpperCase());
        const tagCls = session ? "soma-cal-tag-done" : (projection.isRest ? "soma-cal-tag-rest" : "soma-cal-tag-work");

        gridHtml += `
          <div class="soma-cal-cell ${isToday ? 'soma-cal-today' : ''} ${session ? 'soma-cal-completed' : ''} ${isSubExpiry ? 'soma-cal-expiry' : ''}" data-action="inspect-cal-day" data-date="${dateKey}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="soma-cal-num">${d}</span>
              ${session ? '<span style="font-size:0.65rem; color:#10b981; font-weight:800;">✓</span>' : ''}
              ${isSubExpiry ? '<span style="font-size:0.62rem; color:#ef4444; font-weight:900;">⚠️</span>' : ''}
            </div>
            <div class="soma-cal-badge ${tagCls}">${isSubExpiry ? 'EXPIRY' : tag}</div>
          </div>
        `;
      }

      const todayDateObj = new Date();
      const subEndDateObj = parseLocalDateKey(settings.subEndDate || "2026-08-31");
      const subDaysRemaining = Math.max(0, Math.ceil((subEndDateObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24)));

      paneCalendar.innerHTML = `
        <div class="soma-card" style="margin-bottom:12px; border-color:${subDaysRemaining <= 5 ? '#ef4444' : 'rgba(255,255,255,0.1)'};">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.68rem; font-weight:800; color:${subDaysRemaining <= 5 ? '#ef4444' : '#38bdf8'}; text-transform:uppercase;">💳 Gym Membership Access</div>
              <div style="font-size:0.95rem; font-weight:900; color:#fff; margin-top:2px;">
                ${subDaysRemaining > 0 ? `${subDaysRemaining} Days Remaining (Ends ${settings.subEndDate})` : `⚠️ Subscription Expired on ${settings.subEndDate}`}
              </div>
            </div>
            <button class="soma-btn" data-action="edit-subscription" style="font-size:0.72rem; padding:4px 10px;">⚙️ Manage</button>
          </div>
          
          <div id="sub-edit-drawer" style="display:none; margin-top:10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
            <div style="font-size:0.75rem; font-weight:800; color:#cbd5e1; margin-bottom:6px;">Set Subscription Period:</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
              <button class="soma-btn" data-action="set-sub-days" data-days="15">15 Days</button>
              <button class="soma-btn" data-action="set-sub-days" data-days="30">30 Days</button>
              <button class="soma-btn" data-action="set-sub-days" data-days="60">60 Days</button>
              <button class="soma-btn" data-action="set-sub-days" data-days="90">90 Days</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="font-size:0.72rem; color:#9ca3af;">Or Direct End Date:</span>
              <input type="date" class="soma-input" id="input-sub-end-date" value="${settings.subEndDate}" style="height:32px; width:150px; font-size:0.75rem;" />
              <button class="soma-btn soma-btn-accent" data-action="save-sub-end-date" style="padding:6px 12px; font-size:0.72rem;">Save</button>
            </div>
          </div>
        </div>

        <div class="soma-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
            <div style="font-size:1.05rem; font-weight:800; color:#ffffff;">📅 Periodization Timeline</div>
            <span class="soma-tag soma-tag-emerald">${sampleProg.phase}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <button class="soma-btn" data-action="cal-prev" style="padding:6px 12px; font-size:0.75rem;">◀ Prev</button>
            <div style="font-size:0.95rem; font-weight:800; color:#fff;">${monthNames[month]} ${year}</div>
            <button class="soma-btn" data-action="cal-next" style="padding:6px 12px; font-size:0.75rem;">Next ▶</button>
          </div>

          <div class="soma-cal-summary-strip">
            <div>Logged: <b style="color:#10b981;">${mLoggedCount} Sessions</b></div>
            <div>Vol: <b style="color:#f3f4f6;">${mTotalVol.toLocaleString()} ${settings.unit}</b></div>
            <div>Rest: <b style="color:#9ca3af;">${mRestCount} Days</b></div>
          </div>

          <div class="soma-cal-grid">${gridHtml}</div>
          <div id="soma-cal-detail" style="display:none; margin-top:14px;"></div>
        </div>
      `;
    };

    // ========================================================================
    // VIEW 4: PR DIRECTORY WITH MUSCLE FILTER
    // ========================================================================
    const renderPrsView = () => {
      const prs = [];
      for (const ex of exerciseDB) {
        let maxWeight = 0, maxRepsAtWeight = 0, max1RM = 0, best1RMDate = "", lastSessionDate = "";
        for (const [dateKey, session] of Object.entries(history)) {
          for (const sex of session.exercises || []) {
            if (sex.name.toLowerCase() === ex.name.toLowerCase()) {
              lastSessionDate = dateKey;
              for (const s of sex.sets || []) {
                if (s.done) {
                  const rawW = parseFloat(s.weight) || 0;
                  const w = (sex.usesBar && rawW > 0) ? (sex.barWeight || settings.barWeight) + rawW : rawW;
                  const r = parseInt(s.reps) || 0;
                  if (w > maxWeight) { maxWeight = w; maxRepsAtWeight = r; }
                  const est = SomaIntelligenceEngine.calculate1RM(w, r);
                  if (est > max1RM) { max1RM = est; best1RMDate = dateKey; }
                }
              }
            }
          }
        }
        if (max1RM > 0) {
          const lastSet = this.getLastPerformance(history, ex.name);
          const suggestion = SomaIntelligenceEngine.computeOverloadRecommendation(lastSet, ex.isBW);
          prs.push({ name: ex.name, muscle: ex.muscle, maxWeight, maxRepsAtWeight, max1RM, best1RMDate, lastSessionDate, suggestion });
        }
      }

      const filteredPrs = currentPrFilter === "ALL"
        ? prs
        : prs.filter(p => p.muscle.toLowerCase().includes(currentPrFilter.toLowerCase()));

      filteredPrs.sort((a, b) => b.max1RM - a.max1RM);

      const filterButtons = ["ALL", "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "LEGS"].map(f => `
        <button class="soma-pill-btn ${currentPrFilter === f ? 'active' : ''}" data-action="filter-pr" data-filter="${f}">${f}</button>
      `).join("");

      const prRowsHtml = filteredPrs.length > 0 ? filteredPrs.map(pr => `
        <div class="soma-pr-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:800; font-size:0.95rem; color:#fff;">${pr.name}</div>
              <div style="font-size:0.72rem; color:#9ca3af;">${pr.muscle} • Last trained: ${pr.lastSessionDate}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.1rem; font-weight:900; color:#10b981;">${pr.max1RM} ${settings.unit}</div>
              <div style="font-size:0.65rem; color:#9ca3af; text-transform:uppercase;">All-Time Best Est. 1RM</div>
              <div style="font-size:0.62rem; color:#71717a;">on ${pr.best1RMDate}</div>
            </div>
          </div>
          <div style="font-size:0.72rem; color:#e5e7eb; margin-top:4px;">🏋️ <b>Top Set:</b> ${pr.maxWeight} ${settings.unit} × ${pr.maxRepsAtWeight} reps</div>
          <div style="background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.12); border-radius:10px; padding:6px 10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.72rem; color:#e5e7eb;">🎯 <b>Next Target:</b> ${pr.suggestion.note}</span>
            <span class="soma-tag ${pr.suggestion.diffTier.includes('Lvl 1') ? 'soma-tag-emerald' : 'soma-tag-gray'}">${pr.suggestion.diffTier}</span>
          </div>
        </div>
      `).join("") : `<div style="padding:20px; color:#9ca3af; text-align:center;">No completed sets found for <b>${currentPrFilter}</b>.</div>`;

      panePrs.innerHTML = `
        <div class="soma-card">
          <div class="soma-card-title"><span>🏆 Hall of Records & Muscle PR Filter</span></div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;">${filterButtons}</div>
          <div>${prRowsHtml}</div>
        </div>
      `;
    };

    // ========================================================================
    // VIEW 5: CREATINE SATURATION & STASH TRACKER
    // ========================================================================
    const computeCreatineMetrics = () => {
      let saturation = 60.0;
      let currentStreak = 0;
      const refDate = parseLocalDateKey(noteDateKey);

      for (let i = 30; i >= 0; i--) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        const dStr = getLocalDateKey(d);
        const dose = nutritionDB[dStr]?.creatine || 0;

        if (dose > 0) {
          const delta = (dose / 5.0) * (100.0 - saturation) * 0.10;
          saturation = Math.min(100.0, saturation + Math.max(1.4, delta));
        } else if (saturation > 60.0) {
          saturation = Math.max(60.0, saturation - (saturation * 0.015));
        }
      }

      let checkDate = new Date(refDate);
      for (let s = 0; s < 60; s++) {
        const dStr = getLocalDateKey(checkDate);
        const dose = nutritionDB[dStr]?.creatine || 0;
        if (dose > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (s === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
      }

      const remainingStash = Math.max(0, nutritionDB._settings?.creatineStashGrams || 0);
      const daysLeft = Math.floor(remainingStash / 5);
      const finishDate = new Date(refDate);
      finishDate.setDate(finishDate.getDate() + daysLeft);
      const finishFormatted = finishDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        satPct: Math.round(saturation),
        streak: currentStreak,
        todayDose: nutritionDB[noteDateKey]?.creatine || 0,
        stashGrams: remainingStash,
        daysLeft,
        finishFormatted
      };
    };

    const renderCreatineView = () => {
      const { satPct, streak, todayDose, stashGrams, daysLeft, finishFormatted } = computeCreatineMetrics();
      const isSaturated = satPct >= 95;
      const themeColor = satPct >= 95 ? "#10b981" : satPct >= 80 ? "#34d399" : "#f59e0b";

      paneCreatine.innerHTML = `
        <div class="soma-card ${isSaturated ? 'soma-card-emerald-glow' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.05rem; font-weight:900; color:#fff;">⚡ Creatine Monohydrate Saturation</span>
              ${streak > 0 ? `<span class="soma-tag" style="background:rgba(245,158,11,0.15); border:1px solid #f59e0b; color:#f59e0b;">🔥 ${streak}d Streak</span>` : ''}
            </div>
            <span style="font-size:0.85rem; font-weight:800; color:${themeColor};">${satPct}% • ${isSaturated ? 'Saturated' : 'Building'}</span>
          </div>

          <div class="soma-bar-wrap" style="height:10px; margin-bottom:12px;">
            <div class="soma-bar-fill" style="width:${satPct}%; background:${themeColor};"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; gap:8px;">
            <div style="font-size:0.75rem; color:#9ca3af;">
              Home Tub Stash: <b style="color:#fff;">${stashGrams}g left</b> (${daysLeft}d supply remaining)
            </div>
            <span style="font-size:0.75rem; color:#f59e0b; font-weight:800;">
              ${stashGrams > 0 ? `Depletion ~ ${finishFormatted}` : '⚠️ Tub is Empty'}
            </span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; flex-wrap:wrap; gap:10px;">
            <span style="font-size:0.75rem; color:#9ca3af;">Intracellular Hydration • 5g Maintenance</span>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="font-size:0.82rem; font-weight:800; color:#fff; margin-right:4px;">Today: <b>${todayDose}g</b></span>
              <button class="soma-btn" data-action="add-creatine-dose" data-grams="3">+3g</button>
              <button class="soma-btn soma-btn-save" data-action="add-creatine-dose" data-grams="5">+5g</button>
              <button class="soma-btn" data-action="reset-creatine-today">↺ Reset</button>
            </div>
          </div>
        </div>
      `;
    };

    // ========================================================================
    // VIEW 6: BALANCE & CNS SPINAL FATIGUE
    // ========================================================================
    const renderRecoveryView = () => {
      const fourteenDaysAgo = Date.now() - (14 * 86400000);
      let rollingAxialVol = 0, rollingTotalVol = 0, pushVol = 0, pullVol = 0, legVol = 0;
      let latestSession = null;

      for (const session of Object.values(history)) {
        const t = session.timestamp || 0;
        if (t >= fourteenDaysAgo) {
          rollingTotalVol += (session.totalVol || 0);
          rollingAxialVol += (session.axialVol || 0);
          const split = (session.split || "").toLowerCase();
          if (split.includes("push") || split.includes("upper")) pushVol += (session.totalVol || 0);
          else if (split.includes("pull")) pullVol += (session.totalVol || 0);
          else if (split.includes("leg") || split.includes("lower")) legVol += (session.totalVol || 0);
        }
        if (!latestSession || t > (latestSession.timestamp || 0)) latestSession = session;
      }

      const totalPPL = (pushVol + pullVol + legVol) || 1;
      const pushPct = Math.round((pushVol / totalPPL) * 100);
      const pullPct = Math.round((pullVol / totalPPL) * 100);
      const legPct = Math.round((legVol / totalPPL) * 100);
      const axialRatio = Math.round((rollingAxialVol / (rollingTotalVol || 1)) * 100);
      const needsDeload = axialRatio > 40 && rollingAxialVol > 12000;

      paneRecovery.innerHTML = `
        <div class="soma-card">
          <div class="soma-card-title"><span>⚡ Systemic Nervous System & Axial Index</span></div>
          <div style="background:#111217; border:1px solid ${needsDeload ? '#ef4444' : 'rgba(255,255,255,0.08)'}; border-radius:14px; padding:14px;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:800; margin-bottom:6px;">
              <span>14-Day Spinal Axial Stress</span>
              <span style="color:${needsDeload ? '#ef4444' : '#10b981'};">${axialRatio}% Ratio (${rollingAxialVol.toLocaleString()} ${settings.unit})</span>
            </div>
            <div class="soma-bar-wrap">
              <div class="soma-bar-fill" style="width:${Math.min(100, axialRatio * 2)}%; background:${needsDeload ? '#ef4444' : '#10b981'};"></div>
            </div>
            ${needsDeload ? `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(239,68,68,0.3);">
                <span style="font-size:0.75rem; color:#fca5a5;">High axial stress detected — consider a deload week.</span>
                <button class="soma-btn" data-action="apply-deload-week" style="background:#ef4444; border-color:#ef4444; color:#fff;">Apply Deload Week</button>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="soma-card">
          <div class="soma-card-title"><span>⚖️ Push / Pull / Leg Structural Balance</span></div>
          <div style="display:flex; height:14px; border-radius:6px; overflow:hidden; margin:8px 0;">
            <div style="width:${pushPct}%; background:#e5e7eb;"></div>
            <div style="width:${pullPct}%; background:#10b981;"></div>
            <div style="width:${legPct}%; background:#f59e0b;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:800;">
            <span style="color:#e5e7eb;">Push: ${pushPct}%</span>
            <span style="color:#10b981;">Pull: ${pullPct}%</span>
            <span style="color:#f59e0b;">Legs: ${legPct}%</span>
          </div>
        </div>
      `;

      paneRecovery.querySelector('[data-action="apply-deload-week"]')?.addEventListener("click", async () => {
        const overrides = settings.scheduleOverrides || {};
        const start = parseLocalDateKey(noteDateKey);
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const key = getLocalDateKey(d);
          const proj = SomaIntelligenceEngine.getProgramProjectedDay(d, {});
          overrides[key] = proj.isRest ? "Rest Day" : `${proj.split} (Deload)`;
        }
        await saveSettings({ scheduleOverrides: overrides });
        new Notice("Deload week applied to the next 7 days.");
        renderRecoveryView();
      });
    };

    // ========================================================================
    // VIEW 7: SETTINGS & CONFIGURATION
    // ========================================================================
    const renderSettingsView = () => {
      paneSettings.innerHTML = `
        <div class="soma-card">
          <div class="soma-card-title"><span>⚙️ System Preferences</span></div>
          
          <div style="margin-bottom:12px;">
            <div class="soma-field-lbl">Weight Unit</div>
            <select class="soma-input" id="cfg-unit">
              <option value="kg" ${settings.unit === 'kg' ? 'selected' : ''}>Kilograms (kg)</option>
              <option value="lbs" ${settings.unit === 'lbs' ? 'selected' : ''}>Pounds (lbs)</option>
            </select>
          </div>

          <div style="margin-bottom:12px;">
            <div class="soma-field-lbl">Olympic Bar Weight</div>
            <input type="number" class="soma-input" id="cfg-bar" value="${settings.barWeight}" />
          </div>

          <div style="margin-bottom:12px;">
            <div class="soma-field-lbl">Default Rest Duration (Seconds)</div>
            <input type="number" class="soma-input" id="cfg-rest" value="${settings.restDefault}" />
          </div>

          <div style="margin-bottom:12px;">
            <div class="soma-field-lbl">Creatine Tub Stash (Grams)</div>
            <input type="number" class="soma-input" id="cfg-creatine-stash" value="${nutritionDB._settings?.creatineStashGrams || 300}" />
          </div>

          <div style="margin-top:16px;">
            <button class="soma-btn soma-btn-accent" data-action="save-settings-full" style="width:100%; padding:12px;">💾 Save All Preferences</button>
          </div>
        </div>
      `;
    };

    // ========================================================================
    // EVENT DELEGATION DISPATCHER
    // ========================================================================
    appEl.onclick = async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;

      switch (action) {
        case "open-split-drawer": {
          const sel = paneWorkout.querySelector("#routine-selector");
          if (sel) sel.style.display = sel.style.display === "none" ? "block" : "none";
          break;
        }
        case "cancel-split-drawer": {
          const sel = paneWorkout.querySelector("#routine-selector");
          if (sel) sel.style.display = "none";
          break;
        }
        case "load-selected-split": {
          const splitVal = paneWorkout.querySelector("#split-select")?.value;
          if (splitVal) {
            loadSplitIntoSession(splitVal);
            const sel = paneWorkout.querySelector("#routine-selector");
            if (sel) sel.style.display = "none";
          }
          break;
        }
        case "open-add-drawer": {
          const add = paneWorkout.querySelector("#add-selector");
          if (add) {
            add.style.display = add.style.display === "none" ? "block" : "none";
            const sBox = paneWorkout.querySelector("#search-box");
            if (sBox) { sBox.value = ""; sBox.focus({ preventScroll: true }); }
            const sList = paneWorkout.querySelector("#search-list");
            if (sList) {
              sList.innerHTML = exerciseDB.slice(0, 8).map(ex => `
                <div class="soma-search-item" data-action="select-search-ex" data-name="${ex.name}">
                  <div style="font-weight:700; color:#ffffff; font-size:0.85rem;">${ex.name}</div>
                  <div style="font-size:0.72rem; color:#9ca3af; display:flex; gap:6px; margin-top:2px;">
                    <span>${ex.subTarget}</span> • <span>${ex.tier}</span>
                  </div>
                </div>
              `).join("");
            }
          }
          break;
        }
        case "close-add-drawer": {
          const add = paneWorkout.querySelector("#add-selector");
          if (add) add.style.display = "none";
          break;
        }
        case "select-search-ex": {
          const name = btn.dataset.name;
          if (name) {
            addExerciseToSession(name);
            const add = paneWorkout.querySelector("#add-selector");
            if (add) add.style.display = "none";
          }
          break;
        }
        case "open-custom-modal": {
          const cModal = appEl.querySelector("#custom-ex-modal");
          if (cModal) cModal.style.display = "flex";
          break;
        }
        case "close-custom-modal": {
          const cModal = appEl.querySelector("#custom-ex-modal");
          if (cModal) cModal.style.display = "none";
          break;
        }
        case "submit-custom-movement": {
          const name = appEl.querySelector("#cust-name")?.value.trim();
          const muscle = appEl.querySelector("#cust-muscle")?.value;
          const subTarget = appEl.querySelector("#cust-sub")?.value.trim() || muscle;
          if (name) {
            const newEx = { name, muscle: muscle.toUpperCase(), subTarget, targetKeys: [muscle], position: "Mid-Range", risk: "Low 🟢", tier: "Custom", isAxial: false, isBW: false };
            await saveCustomExercise(newEx);
            addExerciseToSession(newEx.name);
            const cModal = appEl.querySelector("#custom-ex-modal");
            if (cModal) cModal.style.display = "none";
          }
          break;
        }
        case "quick-rest": {
          const secs = parseInt(btn.dataset.seconds) || 90;
          startRestTimer(secs);
          break;
        }
        case "reset-rest": {
          this.untrackInterval(restTimerInterval);
          restSecondsLeft = 0;
          updateRestTimerUI();
          break;
        }
        case "undo-action": {
          if (state.undo()) { renderTracker(); new Notice("Action Undone"); }
          break;
        }
        case "redo-action": {
          if (state.redo()) { renderTracker(); new Notice("Action Redone"); }
          break;
        }
        case "del-set": {
          state.recordSnapshot();
          state.sessionExercises[btn.dataset.ex].sets.splice(btn.dataset.set, 1);
          renderTracker();
          break;
        }
        case "add-set": {
          state.recordSnapshot();
          state.sessionExercises[btn.dataset.ex].sets.push({ weight: "", reps: "", failure: 2, done: false, type: "normal" });
          renderTracker();
          break;
        }
        case "add-drop-set": {
          state.recordSnapshot();
          const exForDrop = state.sessionExercises[btn.dataset.ex];
          const lastSet = exForDrop.sets[exForDrop.sets.length - 1];
          // Drop sets are logged right after a main set at a reduced load —
          // pre-fill ~20% lighter than the last set as a starting point.
          const lastWeight = parseFloat(lastSet?.weight);
          const suggestedWeight = !isNaN(lastWeight) && lastWeight > 0 ? Math.round(lastWeight * 0.8 * 2) / 2 : "";
          exForDrop.sets.push({ weight: suggestedWeight, reps: "", failure: 4, done: false, type: "dropset" });
          renderTracker();
          break;
        }
        case "toggle-set-type": {
          state.recordSnapshot();
          const setForToggle = state.sessionExercises[btn.dataset.ex].sets[btn.dataset.set];
          setForToggle.type = setForToggle.type === "dropset" ? "normal" : "dropset";
          renderTracker();
          break;
        }
        case "cycle-superset": {
          state.recordSnapshot();
          const exForSuperset = state.sessionExercises[btn.dataset.ex];
          exForSuperset.supersetGroup = nextSupersetGroup(exForSuperset.supersetGroup);
          renderTracker();
          break;
        }
        case "del-card": {
          state.recordSnapshot();
          state.sessionExercises.splice(btn.dataset.ex, 1);
          renderTracker();
          break;
        }
        case "hm-switch-front": {
          heatmapCurrentView = "front";
          heatmapSelectedKey = null;
          renderHeatmapView();
          break;
        }
        case "hm-switch-back": {
          heatmapCurrentView = "back";
          heatmapSelectedKey = null;
          renderHeatmapView();
          break;
        }
        case "cal-prev": {
          calViewDate.setMonth(calViewDate.getMonth() - 1);
          renderCalendarView();
          break;
        }
        case "cal-next": {
          calViewDate.setMonth(calViewDate.getMonth() + 1);
          renderCalendarView();
          break;
        }
        case "edit-subscription": {
          const drawer = paneCalendar.querySelector("#sub-edit-drawer");
          if (drawer) drawer.style.display = drawer.style.display === "none" ? "block" : "none";
          break;
        }
        case "set-sub-days": {
          const days = parseInt(btn.dataset.days) || 30;
          const endD = new Date();
          endD.setDate(endD.getDate() + days);
          const endStr = getLocalDateKey(endD);
          await saveSettings({ subDurationDays: days, subEndDate: endStr });
          renderCalendarView();
          new Notice(`Subscription updated for ${days} days (Expiry: ${endStr})`);
          break;
        }
        case "save-sub-end-date": {
          const endStr = paneCalendar.querySelector("#input-sub-end-date")?.value;
          if (endStr) {
            await saveSettings({ subEndDate: endStr });
            renderCalendarView();
            new Notice(`Subscription expiry set to ${endStr}`);
          }
          break;
        }
        case "inspect-cal-day": {
          const dateKey = btn.dataset.date;
          const calDetail = paneCalendar.querySelector("#soma-cal-detail");
          if (!dateKey || !calDetail) break;
          const session = history[dateKey];
          const projection = SomaIntelligenceEngine.getProgramProjectedDay(parseLocalDateKey(dateKey), settings.scheduleOverrides || {});
          const optionsHtml = ROTATION_SEQUENCE.map(s => `<option value="${s}" ${projection.split === s ? 'selected' : ''}>${s}</option>`).join("");

          calDetail.innerHTML = `
            <div style="background:#111217; border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span class="soma-tag ${session ? 'soma-tag-emerald' : 'soma-tag-gray'}">${session ? 'Logged Workout' : 'Scheduled Program'}</span>
                  <h3 style="margin:4px 0 0 0; color:#fff; font-size:1.05rem;">${session ? session.split : projection.split}</h3>
                  <div style="font-size:0.75rem; color:#9ca3af;">${dateKey}</div>
                </div>
                <button class="soma-btn-del" data-action="close-cal-detail">✕</button>
              </div>
              
              <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <div style="font-size:0.72rem; color:#cbd5e1; font-weight:800; margin-bottom:4px;">Change / Realign Program for this day:</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
                  <select class="soma-input" id="cal-override-select" style="font-size:0.75rem; height:34px; flex:1;">${optionsHtml}</select>
                  <button class="soma-btn soma-btn-accent" data-action="save-cal-override" data-date="${dateKey}">Set</button>
                  <button class="soma-btn" data-action="cascade-shift-schedule" data-date="${dateKey}" title="Shift all subsequent days in sequence">⏩ Cascade</button>
                </div>
                <button class="soma-btn" data-action="load-cal-to-workout" data-date="${dateKey}" style="width:100%; background:#2563eb; color:#ffffff; font-weight:800;">⚡ Load Split Into Active Workout</button>
              </div>
            </div>
          `;
          calDetail.style.display = "block";
          break;
        }
        case "save-cal-override": {
          const dateKey = btn.dataset.date;
          const overrideVal = paneCalendar.querySelector("#cal-override-select")?.value;
          if (dateKey && overrideVal) {
            const overrides = settings.scheduleOverrides || {};
            overrides[dateKey] = overrideVal;
            await saveSettings({ scheduleOverrides: overrides });

            if (dateKey === noteDateKey) {
              state.activeSplit = overrideVal;
              initWorkoutView();
            }

            renderCalendarView();
            new Notice(`Program for ${dateKey} updated to: ${overrideVal}`);
          }
          break;
        }
        case "cascade-shift-schedule": {
          const dateKey = btn.dataset.date;
          const overrideVal = paneCalendar.querySelector("#cal-override-select")?.value;
          if (!dateKey || !overrideVal) break;

          const startD = parseLocalDateKey(dateKey);
          const overrides = settings.scheduleOverrides || {};
          
          let startIndex = ROTATION_SEQUENCE.indexOf(overrideVal);
          if (startIndex === -1) startIndex = 0;

          for (let i = 0; i < 60; i++) {
            const shiftD = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + i, 12, 0, 0);
            const key = getLocalDateKey(shiftD);
            const seqSplit = ROTATION_SEQUENCE[(startIndex + i) % ROTATION_SEQUENCE.length];
            overrides[key] = seqSplit;
          }

          await saveSettings({ scheduleOverrides: overrides });

          const todaySplit = overrides[noteDateKey] || SomaIntelligenceEngine.getProgramProjectedDay(parseLocalDateKey(noteDateKey), overrides).split;
          state.activeSplit = todaySplit;
          initWorkoutView();

          renderCalendarView();
          new Notice(`Cascaded 60-day routine sequence starting from ${dateKey}!`);
          break;
        }
        case "load-cal-to-workout": {
          const dateKey = btn.dataset.date;
          const currentProj = SomaIntelligenceEngine.getProgramProjectedDay(parseLocalDateKey(dateKey), settings.scheduleOverrides || {});
          loadSplitIntoSession(currentProj.split);
          switchDockTab("pane-workout");
          new Notice(`Loaded ${currentProj.split} into active workout!`);
          break;
        }
        case "close-cal-detail": {
          const calDetail = paneCalendar.querySelector("#soma-cal-detail");
          if (calDetail) calDetail.style.display = "none";
          break;
        }
        case "filter-pr": {
          currentPrFilter = btn.dataset.filter;
          renderPrsView();
          break;
        }
        case "add-creatine-dose": {
          const grams = parseInt(btn.dataset.grams) || 5;
          if (!nutritionDB[noteDateKey]) nutritionDB[noteDateKey] = { creatine: 0 };
          nutritionDB[noteDateKey].creatine = (nutritionDB[noteDateKey].creatine || 0) + grams;
          nutritionDB._settings.creatineStashGrams = Math.max(0, (nutritionDB._settings.creatineStashGrams || 0) - grams);
          await saveNutritionDB();
          renderCreatineView();
          break;
        }
        case "reset-creatine-today": {
          const currentDose = nutritionDB[noteDateKey]?.creatine || 0;
          nutritionDB._settings.creatineStashGrams = (nutritionDB._settings.creatineStashGrams || 0) + currentDose;
          if (nutritionDB[noteDateKey]) nutritionDB[noteDateKey].creatine = 0;
          await saveNutritionDB();
          renderCreatineView();
          break;
        }
        case "save-settings-full": {
          const unit = paneSettings.querySelector("#cfg-unit")?.value;
          const barWeight = parseFloat(paneSettings.querySelector("#cfg-bar")?.value) || 20;
          const restDefault = parseInt(paneSettings.querySelector("#cfg-rest")?.value) || 90;
          const creatineStash = parseFloat(paneSettings.querySelector("#cfg-creatine-stash")?.value) || 300;

          await saveSettings({ unit, barWeight, restDefault });
          nutritionDB._settings.creatineStashGrams = creatineStash;
          await saveNutritionDB();
          new Notice("All Preferences Saved!");
          break;
        }
        case "save-workout": {
          let totalVol = 0, totalSets = 0, sumIntensity = 0, axialVolume = 0;
          const elapsed = Math.max(0, Math.floor((Date.now() - state.sessionStartTime) / 1000));
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          const durationFormatted = `${mins}m ${secs}s`;
          const elapsedMinutes = Math.max(1, Math.round(elapsed / 60));

          const muscleHits = {};
          for (const ex of state.sessionExercises) {
            const doneSets = ex.sets.filter(s => s.done);
            if (doneSets.length > 0 && ex.targetKeys) {
              const avgFail = doneSets.reduce((acc, s) => acc + (parseFloat(s.failure) || 3), 0) / doneSets.length;
              for (const k of ex.targetKeys) {
                if (!muscleHits[k]) muscleHits[k] = { sets: 0, sumFail: 0, count: 0 };
                muscleHits[k].sets += doneSets.length;
                muscleHits[k].sumFail += (avgFail * doneSets.length);
                muscleHits[k].count += doneSets.length;
              }
            }
            for (const s of ex.sets) {
              const defaultW = ex.isBW ? 0 : (ex.usesBar ? (ex.barWeight || settings.barWeight) : 80);
              const w = (s.weight !== undefined && s.weight !== "") ? getTotalWeight(ex, s) : (s.done ? defaultW : 0);
              const r = parseFloat(s.reps) || (s.done ? 8 : 0);
              const failVal = s.failure || "3";
              if (s.done) {
                totalSets++;
                const vol = SomaIntelligenceEngine.calculateWorkVolume(w, r, ex.isBW);
                totalVol += vol;
                if (ex.isAxial) axialVolume += vol;
                sumIntensity += (parseFloat(failVal) || 3);
              }
            }
          }

          const finalMuscles = {};
          for (const k in muscleHits) {
            finalMuscles[k] = { sets: muscleHits[k].sets, avgFail: Math.round((muscleHits[k].sumFail / muscleHits[k].count) * 10) / 10 };
          }

          const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
          const caloriesBurned = SomaIntelligenceEngine.calculateCaloriesBurned(elapsedMinutes, totalVol, totalSets, avgIntensity);

          const recapData = {
            timestamp: Date.now(),
            dateStr: new Date().toISOString(),
            split: state.activeSplit,
            durationFormatted,
            caloriesBurned,
            totalVol,
            axialVol: axialVolume,
            totalSets,
            muscles: finalMuscles,
            exercises: state.sessionExercises
          };

          await saveWorkoutHistory(recapData);

          if (sourcePath) {
            const currentFile = this.app.vault.getAbstractFileByPath(sourcePath);
            if (currentFile && this.app.fileManager?.processFrontMatter) {
              await this.app.fileManager.processFrontMatter(currentFile, fm => {
                fm["workout_split"] = state.activeSplit;
                fm["workout_volume"] = totalVol;
                fm["workout_sets"] = totalSets;
                fm["workout_calories"] = caloriesBurned;
              });
            }
          }

          renderFinishedScreen(recapData);
          break;
        }
        case "edit-session": {
          const savedSession = history[noteDateKey];
          if (savedSession) {
            state.recordSnapshot();
            state.activeSplit = savedSession.split || state.activeSplit;
            state.sessionExercises = JSON.parse(JSON.stringify(savedSession.exercises || []));
            state.sessionStartTime = typeof savedSession.timestamp === "number" ? savedSession.timestamp : Date.now();
          }
          initWorkoutView();
          renderTracker();
          break;
        }
        case "reset-session": {
          delete history[noteDateKey];
          await this.writeVaultJson(HISTORY_FILE_PATH, history);
          state.sessionExercises = [];
          state.sessionStartTime = Date.now();
          initWorkoutView();
          break;
        }
        case "close-plate-modal": {
          const pModal = appEl.querySelector("#plate-popover");
          if (pModal) pModal.style.display = "none";
          break;
        }
      }
    };

    appEl.oninput = (e) => {
      const target = e.target;
      if (target.classList.contains("set-weight")) {
        const exObj = state.sessionExercises[target.dataset.ex];
        const setObj = exObj.sets[target.dataset.set];
        setObj.weight = target.value;
        if (exObj.usesBar) {
          const hintEl = target.parentElement.querySelector("div");
          const total = getTotalWeight(exObj, setObj);
          if (hintEl) hintEl.textContent = total > 0 ? `= ${total}${settings.unit}` : "";
        }
        updateStats();
      } else if (target.classList.contains("set-reps")) {
        state.sessionExercises[target.dataset.ex].sets[target.dataset.set].reps = target.value;
        updateStats();
      }
    };

    appEl.onchange = (e) => {
      const target = e.target;
      if (target.classList.contains("set-bar-select")) {
        const exObj = state.sessionExercises[target.dataset.ex];
        const preset = (BAR_PRESETS[settings.unit] || BAR_PRESETS.kg).find(p => p.id === target.value);
        exObj.barWeight = preset && preset.weight !== null ? preset.weight : (exObj.barWeight || settings.barWeight);
        renderTracker();
      } else if (target.classList.contains("set-bar-custom")) {
        const exObj = state.sessionExercises[target.dataset.ex];
        exObj.barWeight = parseFloat(target.value) || settings.barWeight;
        renderTracker();
      } else if (target.classList.contains("set-fail")) {
        state.sessionExercises[target.dataset.ex].sets[target.dataset.set].failure = target.value;
      } else if (target.classList.contains("set-done")) {
        const isDone = target.checked;
        const curEx = state.sessionExercises[target.dataset.ex];
        const curSet = curEx.sets[target.dataset.set];
        curSet.done = isDone;

        const row = target.closest('.soma-set-row');
        if (row) {
          if (isDone) row.classList.add('row-done');
          else row.classList.remove('row-done');
        }

        if (isDone) {
          const prIntel = SomaIntelligenceEngine.detectPersonalRecords(history, curEx.name, getTotalWeight(curEx, curSet), curSet.reps);
          if (prIntel) {
            if (settings.sound) SomaAudioCelebration.playSound("pr");
            if (settings.confetti) SomaAudioCelebration.triggerConfetti(appEl);
            new Notice(`🏆 NEW PR: ${curEx.name} (${prIntel.weight}${settings.unit} × ${prIntel.reps})!`);
          } else if (settings.sound) {
            SomaAudioCelebration.playSound("chime");
          }
          if (settings.autoRest) startRestTimer(settings.restDefault);
        }
        updateStats();
      }
    };

    appEl.ondblclick = (e) => {
      const target = e.target;
      if (target.classList.contains("set-weight")) {
        const ex = state.sessionExercises[target.dataset.ex];
        const setObj = ex.sets[target.dataset.set];
        if (ex.usesBar) {
          showPlateCalculator(getTotalWeight(ex, setObj) || (ex.barWeight || settings.barWeight), ex.barWeight || settings.barWeight);
        } else {
          showPlateCalculator(target.value || (ex.isBW ? 0 : 80));
        }
      }
    };

    initWorkoutView();
    if (history && history[noteDateKey]) {
      renderFinishedScreen(history[noteDateKey]);
    }
  }

  // ==========================================================================
  // CODEBLOCK 2: COMPLETE MACRO & NUTRITION DIARY + RECOMP FORECAST (`macro-tracker`)
  // ==========================================================================
  async mountTracker(containerEl, sourcePath) {
    const root = containerEl.createDiv({ cls: "ntr-root-container" });

    const fileName = sourcePath ? sourcePath.split("/").pop() : "";
    const dateMatch = fileName ? fileName.match(/\d{4}-\d{2}-\d{2}/) : null;
    const noteDateKey = dateMatch ? dateMatch[0] : getLocalDateKey(new Date());

    let nutritionDB = await this.readVaultJson(NUTRITION_FILE_PATH, {});
    this.ensureNutritionSettings(nutritionDB);
    let customFoods = await this.readVaultJson(CUSTOM_FOODS_FILE, []);
    let historyDB = await this.readVaultJson(HISTORY_FILE_PATH, {});

    const todayWorkout = historyDB[noteDateKey] || {};
    const exerciseCaloriesBurned = todayWorkout.caloriesBurned || 0;
    const workoutSplitName = todayWorkout.split || null;

    let foodLibrary = [...BASE_FOOD_LIBRARY, ...customFoods];

    if (!nutritionDB[noteDateKey]) {
      const baseGoals = { ...(nutritionDB.__defaultGoals || DEFAULT_GOALS) };
      let carryWeight = 78.5;
      const priorKeys = Object.keys(nutritionDB).filter(k => k !== "_settings" && k !== "__defaultGoals" && nutritionDB[k]?.bodyWeight).sort();
      if (priorKeys.length > 0) carryWeight = parseFloat(nutritionDB[priorKeys[priorKeys.length - 1]].bodyWeight) || carryWeight;
      if (nutritionDB._settings?.autoProteinTarget) {
        baseGoals.protein = Math.round(carryWeight * (nutritionDB._settings.proteinPerKg || 2.0));
      }
      nutritionDB[noteDateKey] = {
        goals: baseGoals,
        summaryOpen: true,
        tableOpen: false,
        microOpen: false,
        water: 0,
        bodyWeight: carryWeight,
        mealCollapse: {},
        items: []
      };
    }

    const dayData = nutritionDB[noteDateKey];
    if (!dayData.goals) dayData.goals = { ...(nutritionDB.__defaultGoals || DEFAULT_GOALS) };
    if (dayData.goals.water === undefined) dayData.goals.water = 3500;
    if (dayData.goals.fiber === undefined) dayData.goals.fiber = 35;
    if (dayData.goals.calcium === undefined) dayData.goals.calcium = 1000;
    if (dayData.goals.iron === undefined) dayData.goals.iron = 18;
    if (dayData.goals.magnesium === undefined) dayData.goals.magnesium = 400;
    if (dayData.goals.potassium === undefined) dayData.goals.potassium = 3500;
    if (dayData.goals.sodium === undefined) dayData.goals.sodium = 2300;
    if (dayData.goals.zinc === undefined) dayData.goals.zinc = 11;

    if (dayData.summaryOpen === undefined) dayData.summaryOpen = true;
    if (dayData.tableOpen === undefined) dayData.tableOpen = false;
    if (dayData.microOpen === undefined) dayData.microOpen = false;
    if (dayData.water === undefined) dayData.water = 0;
    if (dayData.bodyWeight === undefined) dayData.bodyWeight = 78.5;
    if (!dayData.mealCollapse) dayData.mealCollapse = {};
    if (!dayData.items) dayData.items = [];

    const saveNutrition = async () => {
      await this.writeVaultJson(NUTRITION_FILE_PATH, nutritionDB);
      await this.syncFrontmatter(sourcePath, dayData);
    };

    const saveCustomFoods = async () => {
      await this.writeVaultJson(CUSTOM_FOODS_FILE, customFoods);
      foodLibrary = [...BASE_FOOD_LIBRARY, ...customFoods];
    };

    const incrementFoodUsage = async (foodName) => {
      const match = customFoods.find(f => f.name === foodName);
      if (match) {
        match.usageCount = (match.usageCount || 0) + 1;
        await saveCustomFoods();
      } else {
        const baseMatch = BASE_FOOD_LIBRARY.find(f => f.name === foodName);
        if (baseMatch) baseMatch.usageCount = (baseMatch.usageCount || 0) + 1;
      }
    };

    const render = () => {
      let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      let totalFiber = 0, totalCalcium = 0, totalIron = 0, totalMagnesium = 0, totalPotassium = 0, totalSodium = 0, totalZinc = 0;

      (dayData.items || []).forEach(item => {
        totalCals += (item.cals || 0);
        totalProtein += (item.p || 0);
        totalCarbs += (item.c || 0);
        totalFat += (item.f || 0);
        totalFiber += (item.fiber || 0);
        totalCalcium += (item.calcium || 0);
        totalIron += (item.iron || 0);
        totalMagnesium += (item.magnesium || 0);
        totalPotassium += (item.potassium || 0);
        totalSodium += (item.sodium || 0);
        totalZinc += (item.zinc || 0);
      });

      const effectiveGoalCals = dayData.goals.cals + exerciseCaloriesBurned;
               const remCals = effectiveGoalCals - totalCals;
               const remProtein = dayData.goals.protein - totalProtein;
               const remFat = dayData.goals.fat - totalFat;
               const remCarbs = dayData.goals.carbs - totalCarbs;

      const currentWeight = parseFloat(dayData.bodyWeight) || 78.5;
                const estMaintenanceCals = currentWeight * 32;
                const dailySurplus = dayData.goals.cals - estMaintenanceCals;
                const monthlyKcalDelta = dailySurplus * 30;
                const estFatDeltaKg = (monthlyKcalDelta / 7700).toFixed(2);
                const estMuscleGainKg = dailySurplus >= 0 ? 0.25 : -0.25;
                const projectedWeight = (currentWeight + parseFloat(estFatDeltaKg) + estMuscleGainKg).toFixed(2);

      const calsPct = Math.min(100, Math.round((totalCals / effectiveGoalCals) * 100));
      const protPct = Math.min(100, Math.round((totalProtein / dayData.goals.protein) * 100));
      const fatPct = Math.min(100, Math.round((totalFat / dayData.goals.fat) * 100));
      const carbsPct = Math.min(100, Math.round((totalCarbs / dayData.goals.carbs) * 100));

      const pCal = totalProtein * 4;
      const fCal = totalFat * 9;
      const cCal = totalCarbs * 4;
      const totalMacroCal = pCal + fCal + cCal;

      const pRatio = totalMacroCal > 0 ? Math.round((pCal / totalMacroCal) * 100) : 30;
      const fRatio = totalMacroCal > 0 ? Math.round((fCal / totalMacroCal) * 100) : 25;
      const cRatio = totalMacroCal > 0 ? Math.max(0, 100 - pRatio - fRatio) : 45;

      const pBarW = (pCal / (effectiveGoalCals || 1)) * 100;
      const fBarW = (fCal / (effectiveGoalCals || 1)) * 100;
      const cBarW = (cCal / (effectiveGoalCals || 1)) * 100;
      const isOverCals = totalCals > effectiveGoalCals;

      const waterTarget = dayData.goals.water || 3500;
      const currentWater = dayData.water || 0;
      const nodeVol = Math.round(waterTarget / 10);
      let waterNodesHtml = "";
      for (let n = 1; n <= 10; n++) {
        const isFilled = currentWater >= (n * nodeVol);
        waterNodesHtml += `<div class="ntr-water-node ${isFilled ? 'filled' : ''}" data-vol="${n * nodeVol}" title="${n * nodeVol} ml"></div>`;
      }

      const mealCategories = ["Breakfast", "Lunch", "Dinner", "Post-Workout", "Snacks"];
      let mealGroupsHtml = "";

      mealCategories.forEach(mealCat => {
        const mealItems = (dayData.items || []).filter(i => (i.meal || "Snacks").toLowerCase() === mealCat.toLowerCase());
        let mCals = 0, mProt = 0;
        mealItems.forEach(i => { mCals += (i.cals || 0); mProt += (i.p || 0); });

        const isCollapsed = !!dayData.mealCollapse[mealCat];

        let itemsInMealHtml = mealItems.map((item) => {
          const globalIdx = dayData.items.indexOf(item);
          return `
            <div class="ntr-row-item" data-idx="${globalIdx}">
              <div>
                <div style="font-weight: 700; color: #f4f4f5;">${item.name}</div>
                <div style="font-size:0.68rem; color:#71717a;">${item.serving || "100 g"}</div>
              </div>
              <div class="col-cals">${item.cals.toFixed(0)} kcal</div>
              <div class="col-prot">${item.p.toFixed(1)}g</div>
              <div class="col-fat">${item.f.toFixed(1)}g</div>
              <div class="col-carb">${item.c.toFixed(1)}g</div>
              <div style="text-align: right;">
                <button class="ntr-del-btn btn-direct-del" data-idx="${globalIdx}" title="Delete">✕</button>
              </div>
            </div>
          `;
        }).join("");

        mealGroupsHtml += `
          <div class="ntr-meal-card">
            <div class="ntr-meal-header" data-meal="${mealCat}">
              <div class="ntr-meal-title">
                <span class="ntr-chevron ${isCollapsed ? 'closed' : ''}"></span>
                <span>${mealCat}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="ntr-meal-badge">${mCals.toFixed(0)} kcal • ${mProt.toFixed(0)}g P</span>
                <button class="ntr-btn-quick-add-meal btn-quick-add" data-meal="${mealCat}">+ Add</button>
              </div>
            </div>
            <div style="display: ${isCollapsed ? 'none' : 'block'};">
              ${itemsInMealHtml || `<div style="padding:8px 14px; font-size:0.72rem; color:#52525b; text-align:center;">No items logged</div>`}
            </div>
          </div>
        `;
      });

      const microsList = [
        { name: "Fiber", cur: totalFiber, goal: dayData.goals.fiber || 35, unit: "g", color: "#10b981" },
        { name: "Calcium", cur: totalCalcium, goal: dayData.goals.calcium || 1000, unit: "mg", color: "#38bdf8" },
        { name: "Iron", cur: totalIron, goal: dayData.goals.iron || 18, unit: "mg", color: "#f87171" },
        { name: "Magnesium", cur: totalMagnesium, goal: dayData.goals.magnesium || 400, unit: "mg", color: "#a855f7" },
        { name: "Potassium", cur: totalPotassium, goal: dayData.goals.potassium || 3500, unit: "mg", color: "#fb923c" },
        { name: "Sodium", cur: totalSodium, goal: dayData.goals.sodium || 2300, unit: "mg", color: "#fbbf24", isLimit: true },
        { name: "Zinc", cur: totalZinc, goal: dayData.goals.zinc || 11, unit: "mg", color: "#34d399" }
      ];

      const microCardsHtml = microsList.map(m => {
        const pct = Math.min(100, Math.round((m.cur / m.goal) * 100));
        const left = m.goal - m.cur;
        const subText = m.isLimit
          ? (left >= 0 ? `${left.toFixed(0)}${m.unit} under` : `${Math.abs(left).toFixed(0)}${m.unit} over`)
          : (left > 0 ? `${left.toFixed(0)}${m.unit} left` : `Goal reached`);

        return `
          <div class="ntr-micro-card">
            <div class="ntr-micro-head">
              <span style="color:#a1a1aa;">${m.name}</span>
              <span style="color:${m.color};">${m.cur.toFixed(0)} / ${m.goal}${m.unit}</span>
            </div>
            <div class="ntr-micro-bar-bg"><div class="ntr-micro-bar-fill" style="width:${pct}%; background:${m.color};"></div></div>
            <div style="font-size:0.63rem; font-weight:700; color:#71717a; margin-top:3px; display:flex; justify-content:space-between;">
              <span>${pct}%</span>
              <span style="color:${left < 0 && m.isLimit ? '#ef4444' : '#a1a1aa'};">${subText}</span>
            </div>
          </div>
        `;
      }).join("");

      root.innerHTML = `
        <div class="ntr-goals-widget">
          <div class="ntr-goals-info">
            <span class="ntr-goals-title">🎯 Targets</span>
            <span class="ntr-goal-pill" style="color:#f59e0b;"><b style="color:#fff;">${dayData.goals.cals}</b> kcal ${exerciseCaloriesBurned > 0 ? `<span style="font-size:0.65rem; color:#34d399;">(+${exerciseCaloriesBurned})</span>` : ''}</span>
            <span class="ntr-goal-pill" style="color:#10b981;">P: <b style="color:#fff;">${dayData.goals.protein}g</b></span>
            <span class="ntr-goal-pill" style="color:#ef4444;">F: <b style="color:#fff;">${dayData.goals.fat}g</b></span>
            <span class="ntr-goal-pill" style="color:#0ea5e9;">C: <b style="color:#fff;">${dayData.goals.carbs}g</b></span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="display:flex; align-items:center; gap:6px; background:#202023; padding:6px 10px; border-radius:8px; border:1px solid #2e2e32; min-height:34px;">
              <span style="font-size:0.68rem; color:#a1a1aa; font-weight:700;">⚖️ Log Weight:</span>
              <input type="number" step="0.1" id="inp-scale-weight" value="${currentWeight}" style="width:60px; background:transparent; border:none; color:#fff; font-weight:800; font-size:0.9rem; outline:none; text-align:right; padding:4px 0;" />
              <span style="font-size:0.68rem; color:#71717a;">kg</span>
            </div>
            <button class="ntr-btn-edit-goals ntr-btn" id="btn-open-goals-modal">⚙️ Targets</button>
          </div>
        </div>

        ${workoutSplitName ? `
          <div class="ntr-synergy-banner">
            <span>🏋️ <b>Workout:</b> ${workoutSplitName} (${exerciseCaloriesBurned} kcal)</span>
            <span style="color:#93c5fd;">Ceiling adjusted</span>
          </div>
        ` : ''}

        <div class="ntr-mfp-banner">
          <div class="ntr-mfp-equation">
            <div class="ntr-mfp-unit">
              <div class="ntr-mfp-num">${dayData.goals.cals}</div>
              <div class="ntr-mfp-sub">Goal</div>
            </div>
            <span class="ntr-mfp-sym">−</span>
            <div class="ntr-mfp-unit">
              <div class="ntr-mfp-num" style="color:#f59e0b;">${Math.round(totalCals)}</div>
              <div class="ntr-mfp-sub">Food</div>
            </div>
            <span class="ntr-mfp-sym">+</span>
            <div class="ntr-mfp-unit">
              <div class="ntr-mfp-num" style="color:#34d399;">${Math.round(exerciseCaloriesBurned)}</div>
              <div class="ntr-mfp-sub">Exercise</div>
            </div>
            <span class="ntr-mfp-sym">=</span>
          </div>
          <div class="ntr-mfp-rem-box">
            <div class="ntr-mfp-rem-val" style="color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
              ${remCals >= 0 ? remCals.toFixed(0) : `+${Math.abs(remCals).toFixed(0)}`}
            </div>
            <div class="ntr-mfp-sub" style="font-weight:700; color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
              ${remCals >= 0 ? 'Remaining' : 'Over Limit'}
            </div>
          </div>
        </div>

        <div class="ntr-stacked-bar-container">
          <div style="display:flex; justify-content:space-between; font-size:0.72rem; font-weight:700; color:#71717a;">
            <span>Macro Calorie Distribution</span>
            <span style="color:#d4d4d8;">${totalCals.toFixed(0)} / ${effectiveGoalCals} kcal</span>
          </div>
          <div class="ntr-stacked-bar-track">
            <div class="ntr-stack-seg" style="width:${Math.min(100, pBarW)}%; background:#10b981;" title="Protein (${pRatio}%)"></div>
            <div class="ntr-stack-seg" style="width:${Math.min(100 - pBarW, fBarW)}%; background:#ef4444;" title="Fat (${fRatio}%)"></div>
            <div class="ntr-stack-seg" style="width:${Math.min(100 - pBarW - fBarW, cBarW)}%; background:#0ea5e9;" title="Carbs (${cRatio}%)"></div>
            ${isOverCals ? `<div class="ntr-stack-seg ntr-stack-over" style="width:100%;" title="Over Target"></div>` : ''}
          </div>
        </div>

        <details style="background:#18181b; padding:10px 14px; border-radius:10px; border:1px solid #27272a; cursor:pointer;">
          <summary style="font-weight:800; font-size:0.78rem; color:#a1a1aa;">
            🔮 30-Day Recomposition Forecast (Click to expand)
          </summary>
          <div style="margin-top:10px; font-size:0.76rem; display:grid; grid-template-columns: 1fr 1fr; gap:6px; color:#cbd5e1;">
            <div>• Est. Fat Change: <b style="color:${estFatDeltaKg <= 0 ? '#10b981' : '#f59e0b'};">${estFatDeltaKg > 0 ? '+' : ''}${estFatDeltaKg} kg</b></div>
            <div>• Est. Lean Mass: <b style="color:#10b981;">+${estMuscleGainKg} kg</b></div>
            <div style="grid-column: span 2; margin-top:6px; padding-top:6px; border-top:1px dashed #27272a;">
              🎯 <b>Target Weight in 30 Days:</b> <span style="color:#38bdf8; font-weight:900;">${projectedWeight} kg</span>
            </div>
          </div>
        </details>

        <div class="ntr-water-dock">
          <div class="ntr-water-top">
            <div class="ntr-water-label">
              <span>💧 Hydration</span>
              <b style="color:#ffffff;">${currentWater}</b> / ${waterTarget} ml
            </div>
            <div style="display:flex; gap:6px;">
              <button class="ntr-btn-water ntr-btn" id="w-plus-250">+250ml</button>
              <button class="ntr-btn-water ntr-btn" id="w-plus-500">+500ml</button>
              <button class="ntr-btn-water ntr-btn" id="w-reset" style="background:#18181b; border-color:#27272a; color:#71717a;">↺</button>
            </div>
          </div>
          <div class="ntr-water-nodes-row">${waterNodesHtml}</div>
        </div>

        <div class="ntr-card">
          <div class="ntr-accordion-bar" id="toggle-summary">
            <span class="ntr-accordion-title">📊 Macros Breakdown</span>
            <div style="display: flex; align-items: center;">
              <span class="ntr-accordion-cals">${totalCals.toFixed(0)} kcal</span>
              <span class="ntr-chevron ${dayData.summaryOpen ? '' : 'closed'}"></span>
            </div>
          </div>
          <div class="ntr-tiles-body" style="display: ${dayData.summaryOpen ? 'block' : 'none'};">
            <div class="ntr-tiles-grid">
              <div class="ntr-tile">
                <div class="ntr-tile-accent acc-cals"></div>
                <div class="ntr-tile-top">
                  <span class="ntr-tile-lbl">Calories</span>
                  <span class="ntr-tile-pct" style="color:#f59e0b;">${calsPct}%</span>
                </div>
                <div class="ntr-tile-val">${totalCals.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">kcal</span></div>
                <div class="ntr-tile-sub" style="color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
                  ${remCals >= 0 ? `${remCals.toFixed(0)} left` : `+${Math.abs(remCals).toFixed(0)} over`}
                </div>
                <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-cals" style="width: ${calsPct}%;"></div></div>
              </div>

              <div class="ntr-tile">
                <div class="ntr-tile-accent acc-prot"></div>
                <div class="ntr-tile-top">
                  <span class="ntr-tile-lbl">Protein</span>
                  <span class="ntr-tile-pct" style="color:#10b981;">${protPct}%</span>
                </div>
                <div class="ntr-tile-val">${totalProtein.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">/ ${dayData.goals.protein}g</span></div>
                <div class="ntr-tile-sub" style="color:${remProtein > 0 ? '#71717a' : '#10b981'};">
                  ${remProtein > 0 ? `${remProtein.toFixed(0)}g left` : `Goal Met`}
                </div>
                <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-prot" style="width: ${protPct}%;"></div></div>
              </div>

              <div class="ntr-tile">
                <div class="ntr-tile-accent acc-fat"></div>
                <div class="ntr-tile-top">
                  <span class="ntr-tile-lbl">Fat</span>
                  <span class="ntr-tile-pct" style="color:#ef4444;">${fatPct}%</span>
                </div>
                <div class="ntr-tile-val">${totalFat.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">/ ${dayData.goals.fat}g</span></div>
                <div class="ntr-tile-sub" style="color:${remFat >= 0 ? '#71717a' : '#ef4444'};">
                  ${remFat >= 0 ? `${remFat.toFixed(0)}g left` : `+${Math.abs(remFat).toFixed(0)}g over`}
                </div>
                <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-fat" style="width: ${fatPct}%;"></div></div>
              </div>

              <div class="ntr-tile">
                <div class="ntr-tile-accent acc-carb"></div>
                <div class="ntr-tile-top">
                  <span class="ntr-tile-lbl">Carbs</span>
                  <span class="ntr-tile-pct" style="color:#0ea5e9;">${carbsPct}%</span>
                </div>
                <div class="ntr-tile-val">${totalCarbs.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">/ ${dayData.goals.carbs}g</span></div>
                <div class="ntr-tile-sub" style="color:${remCarbs >= 0 ? '#71717a' : '#ef4444'};">
                  ${remCarbs >= 0 ? `${remCarbs.toFixed(0)}g left` : `+${Math.abs(remCarbs).toFixed(0)}g over`}
                </div>
                <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-carb" style="width: ${carbsPct}%;"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="ntr-card">
          <div class="ntr-accordion-bar" id="toggle-table">
            <span class="ntr-accordion-title">🍽️ Food Diary</span>
            <div style="display: flex; align-items: center;">
              <span class="ntr-accordion-cals">${totalCals.toFixed(0)} kcal</span>
              <span class="ntr-chevron ${dayData.tableOpen ? '' : 'closed'}"></span>
            </div>
          </div>
          <div style="display: ${dayData.tableOpen ? 'block' : 'none'};">
            <div class="ntr-action-bar">
              <button class="ntr-btn-tool btn-tool-search ntr-btn" id="btn-open-modal">🔍 Search Food</button>
              <button class="ntr-btn-tool btn-tool-library ntr-btn" id="btn-open-food-library">📚 Food Library</button>
              <button class="ntr-btn-tool btn-tool-meal ntr-btn" id="btn-open-meal-builder">🍱 Combine Meal</button>
              <button class="ntr-btn-tool btn-tool-copy ntr-btn" id="btn-copy-yesterday">📋 Copy Yesterday</button>
              <button class="ntr-btn-tool btn-tool-scan ntr-btn" id="btn-open-barcode">📷 Scan Barcode</button>
            </div>
            <div>${mealGroupsHtml}</div>
          </div>
        </div>

        <div class="ntr-card">
          <div class="ntr-accordion-bar" id="toggle-micro">
            <span class="ntr-accordion-title">🧪 Micronutrients & Minerals</span>
            <div style="display: flex; align-items: center;">
              <span class="ntr-accordion-cals" style="color:#a855f7;">${totalCalcium.toFixed(0)}mg Ca • ${totalIron.toFixed(1)}mg Fe</span>
              <span class="ntr-chevron ${dayData.microOpen ? '' : 'closed'}"></span>
            </div>
          </div>
          <div style="display: ${dayData.microOpen ? 'block' : 'none'};">
            <div class="ntr-micro-grid">${microCardsHtml}</div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="goals-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>🎯 Edit Daily Targets</span><button class="ntr-del-btn" id="btn-close-goals-x">✕</button></div>
            <div style="font-size:0.72rem; font-weight:700; color:#38bdf8; text-transform:uppercase; margin-bottom:6px;">Macronutrients & Water</div>
            <div class="ntr-macro-input-grid">
              <div><div class="ntr-mini-lbl">Calories</div><input type="number" class="ntr-mini-inp" id="inp-goal-cals" value="${dayData.goals.cals}" /></div>
              <div><div class="ntr-mini-lbl">Protein (g)</div><input type="number" class="ntr-mini-inp" id="inp-goal-p" value="${dayData.goals.protein}" /></div>
              <div><div class="ntr-mini-lbl">Fat (g)</div><input type="number" class="ntr-mini-inp" id="inp-goal-f" value="${dayData.goals.fat}" /></div>
              <div><div class="ntr-mini-lbl">Carbs (g)</div><input type="number" class="ntr-mini-inp" id="inp-goal-c" value="${dayData.goals.carbs}" /></div>
            </div>
            <div style="margin-bottom:12px;"><div class="ntr-mini-lbl">Water Target (ml)</div><input type="number" class="ntr-modal-input" id="inp-goal-water" value="${dayData.goals.water || 3500}" /></div>
            <div style="font-size:0.72rem; font-weight:700; color:#a855f7; text-transform:uppercase; margin:10px 0 6px 0;">Micronutrients Target</div>
            <div class="ntr-micro-input-grid">
              <div><div class="ntr-mini-lbl">Fiber (g)</div><input type="number" class="ntr-mini-inp" id="inp-goal-fiber" value="${dayData.goals.fiber || 35}" /></div>
              <div><div class="ntr-mini-lbl">Calcium (mg)</div><input type="number" class="ntr-mini-inp" id="inp-goal-calcium" value="${dayData.goals.calcium || 1000}" /></div>
              <div><div class="ntr-mini-lbl">Iron (mg)</div><input type="number" class="ntr-mini-inp" id="inp-goal-iron" value="${dayData.goals.iron || 18}" /></div>
              <div><div class="ntr-mini-lbl">Magnesium (mg)</div><input type="number" class="ntr-mini-inp" id="inp-goal-magnesium" value="${dayData.goals.magnesium || 400}" /></div>
              <div><div class="ntr-mini-lbl">Potassium (mg)</div><input type="number" class="ntr-mini-inp" id="inp-goal-potassium" value="${dayData.goals.potassium || 3500}" /></div>
              <div><div class="ntr-mini-lbl">Sodium Limit (mg)</div><input type="number" class="ntr-mini-inp" id="inp-goal-sodium" value="${dayData.goals.sodium || 2300}" /></div>
              <div><div class="ntr-mini-lbl">Zinc (mg)</div><input type="number" class="ntr-mini-inp" id="inp-goal-zinc" value="${dayData.goals.zinc || 11}" /></div>
            </div>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#a1a1aa; margin-bottom:14px; cursor:pointer;">
              <input type="checkbox" id="chk-save-default-goals" checked /> Set as default for all future days
            </label>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button id="btn-close-goals-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
              <button id="btn-save-goals" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Save Targets</button>
            </div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="ntr-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>🔍 Log Food</span><button class="ntr-del-btn" id="btn-close-log-x">✕</button></div>
            <input type="text" class="ntr-modal-input" id="ntr-search-food" placeholder="Search food library..." />
            <div class="ntr-search-results" id="ntr-search-res"></div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin: 8px 0 4px 0;">
              <input type="text" class="ntr-modal-input" id="ntr-custom-name" placeholder="Food Name" />
              <select class="ntr-modal-input" id="ntr-custom-meal">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Post-Workout">Post-Workout</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
              <input type="number" class="ntr-modal-input" id="ntr-custom-serv" placeholder="Serving / Grams" />
              <input type="text" class="ntr-modal-input" id="ntr-custom-unit" placeholder="Unit" value="g" />
            </div>
            <div class="ntr-chips-row">
              <button class="ntr-chip" data-mult="0.5">0.5×</button>
              <button class="ntr-chip" data-mult="1.0">1.0×</button>
              <button class="ntr-chip" data-mult="1.5">1.5×</button>
              <button class="ntr-chip" data-mult="2.0">2.0×</button>
              <button class="ntr-chip" data-add="50">+50g</button>
              <button class="ntr-chip" data-add="100">+100g</button>
            </div>
            <div class="ntr-macro-input-grid">
              <div><div class="ntr-mini-lbl">Calories</div><input type="number" class="ntr-mini-inp" id="ntr-in-cals" placeholder="0" /></div>
              <div><div class="ntr-mini-lbl">Protein (g)</div><input type="number" class="ntr-mini-inp" id="ntr-in-p" placeholder="0" /></div>
              <div><div class="ntr-mini-lbl">Fat (g)</div><input type="number" class="ntr-mini-inp" id="ntr-in-f" placeholder="0" /></div>
              <div><div class="ntr-mini-lbl">Carbs (g)</div><input type="number" class="ntr-mini-inp" id="ntr-in-c" placeholder="0" /></div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button id="btn-close-ntr-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
              <button id="btn-save-ntr-food" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">+ Log Item</button>
            </div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="edit-row-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>✏️ Edit Entry</span><button class="ntr-del-btn" id="btn-close-edit-x">✕</button></div>
            <input type="text" class="ntr-modal-input" id="edit-food-name" />
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
              <select class="ntr-modal-input" id="edit-food-meal">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Post-Workout">Post-Workout</option>
                <option value="Snacks">Snacks</option>
              </select>
              <input type="text" class="ntr-modal-input" id="edit-food-serving" />
            </div>
            <div class="ntr-macro-input-grid">
              <div><div class="ntr-mini-lbl">Calories</div><input type="number" class="ntr-mini-inp" id="edit-food-cals" /></div>
              <div><div class="ntr-mini-lbl">Protein (g)</div><input type="number" class="ntr-mini-inp" id="edit-food-p" /></div>
              <div><div class="ntr-mini-lbl">Fat (g)</div><input type="number" class="ntr-mini-inp" id="edit-food-f" /></div>
              <div><div class="ntr-mini-lbl">Carbs (g)</div><input type="number" class="ntr-mini-inp" id="edit-food-c" /></div>
            </div>
            <div style="display:flex; justify-content:space-between; gap:8px; margin-top:8px;">
              <button id="btn-delete-active-row" class="ntr-btn" style="padding:8px 12px; background:#450a0a; border:1px solid #7f1d1d; color:#fca5a5; border-radius:6px; font-weight:700;">🗑️ Delete</button>
              <div style="display:flex; gap:8px;">
                <button id="btn-close-edit-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
                <button id="btn-save-edited-row" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Save</button>
              </div>
            </div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="food-library-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>📚 Food Library</span><button class="ntr-del-btn" id="btn-close-lib-x">✕</button></div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
              <input type="text" class="ntr-modal-input" id="lib-filter-input" placeholder="Search library..." style="margin-bottom:0;" />
              <button id="btn-lib-create-new" class="ntr-btn" style="background:#27272a; border:1px solid #3f3f46; color:#fff; border-radius:6px; padding:0 12px; font-weight:700; font-size:0.75rem; height:38px; white-space:nowrap;">+ New</button>
            </div>
            <div class="ntr-search-results" id="lib-foods-list" style="max-height:260px;"></div>
            <div style="display:flex; justify-content:flex-end; margin-top:8px;">
              <button id="btn-close-lib-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Close</button>
            </div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="custom-food-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>✨ Save Food to Library</span><button class="ntr-del-btn" id="btn-close-cf-x">✕</button></div>
            <input type="text" class="ntr-modal-input" id="cf-name" placeholder="Food Name (e.g. Soummam 0%)" />
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
              <input type="number" class="ntr-modal-input" id="cf-serving" placeholder="Serving Base" value="100" />
              <input type="text" class="ntr-modal-input" id="cf-unit" placeholder="Unit" value="g" />
            </div>
            <div class="ntr-macro-input-grid">
              <div><div class="ntr-mini-lbl">Calories</div><input type="number" class="ntr-mini-inp" id="cf-cals" placeholder="100" /></div>
              <div><div class="ntr-mini-lbl">Protein (g)</div><input type="number" class="ntr-mini-inp" id="cf-p" placeholder="10" /></div>
              <div><div class="ntr-mini-lbl">Fat (g)</div><input type="number" class="ntr-mini-inp" id="cf-f" placeholder="2" /></div>
              <div><div class="ntr-mini-lbl">Carbs (g)</div><input type="number" class="ntr-mini-inp" id="cf-c" placeholder="15" /></div>
            </div>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#a1a1aa; margin-bottom:12px; cursor:pointer;">
              <input type="checkbox" id="cf-auto-log" checked /> Log to diary today
            </label>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button id="btn-close-cf-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
              <button id="btn-save-permanent-cf" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Save Food</button>
            </div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="meal-builder-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>🍱 Combine Foods</span><button class="ntr-del-btn" id="btn-close-mb-x">✕</button></div>
            <input type="text" class="ntr-modal-input" id="mb-meal-name" placeholder="Meal Name (e.g. Tuna Pasta Bowl)" />
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin-bottom:8px;">
              <select class="ntr-modal-input" id="mb-select-food" style="margin-bottom:0;"></select>
              <input type="number" class="ntr-modal-input" id="mb-add-qty" placeholder="Grams" value="100" style="margin-bottom:0;" />
            </div>
            <button id="btn-mb-add-item" class="ntr-btn" style="width:100%; background:#18181b; color:#cbd5e1; border:1px solid #27272a; border-radius:6px; padding:7px; font-weight:700; font-size:0.74rem; margin-bottom:10px;">+ Add Ingredient</button>
            <div id="mb-ingredients-list" style="max-height:120px; overflow-y:auto; margin-bottom:10px; border:1px solid #27272a; border-radius:6px; padding:6px; background:#18181b;"></div>
            <div style="background:#18181b; border:1px solid #27272a; border-radius:6px; padding:8px 10px; margin-bottom:12px;">
              <div style="font-size:0.68rem; font-weight:700; color:#71717a; margin-bottom:4px;">COMBINED TOTALS</div>
              <div id="mb-totals-display" style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:800;">
                <span style="color:#f59e0b;">0 kcal</span>
                <span style="color:#10b981;">P: 0g</span>
                <span style="color:#ef4444;">F: 0g</span>
                <span style="color:#0ea5e9;">C: 0g</span>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button id="btn-close-mb-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
              <button id="btn-mb-log-meal" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Log Meal</button>
            </div>
          </div>
        </div>

        <div class="ntr-modal-overlay" id="barcode-modal">
          <div class="ntr-modal-box">
            <div class="ntr-modal-title"><span>📷 Barcode Scanner</span><button class="ntr-del-btn" id="btn-close-bc-x">✕</button></div>
            <video id="bc-video" class="ntr-video-feed" playsinline muted></video>
            <div id="bc-status" style="font-size:0.74rem; color:#38bdf8; text-align:center; margin-bottom:8px; font-weight:700;">Point camera at barcode...</div>
            <div style="display:flex; gap:6px; margin-bottom:10px;">
              <input type="text" class="ntr-modal-input" id="bc-manual-input" placeholder="Enter barcode number" style="margin-bottom:0;" />
              <button id="btn-bc-fetch" class="ntr-btn" style="background:#2563eb; color:#fff; border:none; border-radius:6px; padding:0 14px; font-weight:700; font-size:0.75rem;">Lookup</button>
            </div>
            <div id="bc-result-preview" style="display:none; background:#18181b; border:1px solid #27272a; border-radius:6px; padding:10px; margin-bottom:10px;">
              <div id="bc-prod-name" style="font-weight:800; font-size:0.85rem; color:#fff;"></div>
              <div id="bc-prod-macros" style="font-size:0.75rem; color:#a1a1aa; margin-top:4px;"></div>
              <button id="btn-bc-use-prod" class="ntr-btn" style="width:100%; background:#059669; color:#fff; border:none; border-radius:6px; padding:8px; font-weight:700; font-size:0.78rem; margin-top:8px;">Add to Library</button>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button id="btn-close-bc-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Close</button>
            </div>
          </div>
        </div>
      `;

      attachEvents();
    };

    const attachEvents = () => {
      const bwInp = root.querySelector("#inp-scale-weight");
      if (bwInp) {
        bwInp.addEventListener("change", async (e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            dayData.bodyWeight = val;
            if (nutritionDB._settings?.autoProteinTarget) {
              const perKg = nutritionDB._settings.proteinPerKg || 2.0;
              dayData.goals.protein = Math.round(val * perKg);
            }
            await saveNutrition();
            render();
            new Notice(`Scale weight updated: ${val} kg`);
          }
        });
      }

      root.querySelector("#w-plus-250")?.addEventListener("click", async () => { dayData.water = (dayData.water || 0) + 250; await saveNutrition(); render(); });
      root.querySelector("#w-plus-500")?.addEventListener("click", async () => { dayData.water = (dayData.water || 0) + 500; await saveNutrition(); render(); });
      root.querySelector("#w-reset")?.addEventListener("click", async () => { dayData.water = 0; await saveNutrition(); render(); });
      root.querySelectorAll(".ntr-water-node").forEach(node => {
        node.addEventListener("click", async () => { dayData.water = parseInt(node.dataset.vol, 10); await saveNutrition(); render(); });
      });

      root.querySelectorAll(".ntr-meal-header").forEach(mh => {
        mh.addEventListener("click", async (e) => {
          if (e.target.classList.contains('btn-quick-add')) return;
          const meal = mh.dataset.meal;
          dayData.mealCollapse[meal] = !dayData.mealCollapse[meal];
          await saveNutrition();
          render();
        });
      });

      root.querySelectorAll(".btn-quick-add").forEach(qa => {
        qa.addEventListener("click", (e) => {
          e.stopPropagation();
          const targetMeal = qa.dataset.meal;
          logModal.style.display = "flex";
          root.querySelector("#ntr-custom-meal").value = targetMeal;
          searchInp.value = "";
          selectedFoodRef = null;
          renderSearchList("");
          root.querySelector("#ntr-custom-name").value = "";
          servInp.value = "100";
          unitInp.value = "g";
          root.querySelector("#ntr-in-cals").value = "";
          root.querySelector("#ntr-in-p").value = "";
          root.querySelector("#ntr-in-f").value = "";
          root.querySelector("#ntr-in-c").value = "";
          searchInp.focus({ preventScroll: true });
        });
      });

      let activeEditingIndex = -1;
      const editModal = root.querySelector("#edit-row-modal");

      root.querySelectorAll(".ntr-row-item").forEach(row => {
        row.addEventListener("click", (e) => {
          if (e.target.classList.contains('btn-direct-del')) return;
          const idx = parseInt(row.dataset.idx, 10);
          if (isNaN(idx) || !dayData.items[idx]) return;
          activeEditingIndex = idx;
          const item = dayData.items[idx];

          root.querySelector("#edit-food-name").value = item.name;
          root.querySelector("#edit-food-meal").value = item.meal || "Snacks";
          root.querySelector("#edit-food-serving").value = item.serving || "100 g";
          root.querySelector("#edit-food-cals").value = item.cals;
          root.querySelector("#edit-food-p").value = item.p;
          root.querySelector("#edit-food-f").value = item.f;
          root.querySelector("#edit-food-c").value = item.c;

          editModal.style.display = "flex";
        });
      });

      root.querySelector("#btn-close-edit-modal")?.addEventListener("click", () => { editModal.style.display = "none"; });
      root.querySelector("#btn-close-edit-x")?.addEventListener("click", () => { editModal.style.display = "none"; });

      root.querySelector("#btn-save-edited-row")?.addEventListener("click", async () => {
        if (activeEditingIndex < 0 || !dayData.items[activeEditingIndex]) return;
        const item = dayData.items[activeEditingIndex];
        item.name = root.querySelector("#edit-food-name").value.trim() || item.name;
        item.meal = root.querySelector("#edit-food-meal").value;
        item.serving = root.querySelector("#edit-food-serving").value.trim() || item.serving;
        item.cals = parseFloat(root.querySelector("#edit-food-cals").value) || 0;
        item.p = parseFloat(root.querySelector("#edit-food-p").value) || 0;
        item.f = parseFloat(root.querySelector("#edit-food-f").value) || 0;
        item.c = parseFloat(root.querySelector("#edit-food-c").value) || 0;

        await saveNutrition();
        editModal.style.display = "none";
        render();
      });

      root.querySelector("#btn-delete-active-row")?.addEventListener("click", async () => {
        if (activeEditingIndex >= 0) {
          dayData.items.splice(activeEditingIndex, 1);
          await saveNutrition();
          editModal.style.display = "none";
          render();
        }
      });

      root.querySelectorAll(".btn-direct-del").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          if (!isNaN(idx)) {
            dayData.items.splice(idx, 1);
            await saveNutrition();
            render();
          }
        });
      });

      root.querySelector("#btn-copy-yesterday")?.addEventListener("click", async () => {
        let parsedD = new Date(noteDateKey);
        if (isNaN(parsedD.getTime())) parsedD = new Date();
        parsedD.setDate(parsedD.getDate() - 1);
        const yesterdayKey = getLocalDateKey(parsedD);
        const prevEntry = nutritionDB[yesterdayKey];

        if (prevEntry && prevEntry.items && prevEntry.items.length > 0) {
          const cloned = JSON.parse(JSON.stringify(prevEntry.items));
          dayData.items.push(...cloned);
          await saveNutrition();
          render();
        } else {
          new Notice(`No entries found for yesterday (${yesterdayKey}).`);
        }
      });

      const goalsModal = root.querySelector("#goals-modal");
      root.querySelector("#btn-open-goals-modal")?.addEventListener("click", () => { goalsModal.style.display = "flex"; });
      root.querySelector("#btn-close-goals-modal")?.addEventListener("click", () => { goalsModal.style.display = "none"; });
      root.querySelector("#btn-close-goals-x")?.addEventListener("click", () => { goalsModal.style.display = "none"; });

      root.querySelector("#btn-save-goals")?.addEventListener("click", async () => {
        const newGoals = {
          cals: parseFloat(root.querySelector("#inp-goal-cals").value) || DEFAULT_GOALS.cals,
          protein: parseFloat(root.querySelector("#inp-goal-p").value) || DEFAULT_GOALS.protein,
          fat: parseFloat(root.querySelector("#inp-goal-f").value) || DEFAULT_GOALS.fat,
          carbs: parseFloat(root.querySelector("#inp-goal-c").value) || DEFAULT_GOALS.carbs,
          water: parseFloat(root.querySelector("#inp-goal-water").value) || 3500,
          fiber: parseFloat(root.querySelector("#inp-goal-fiber").value) || 35,
          calcium: parseFloat(root.querySelector("#inp-goal-calcium").value) || 1000,
          iron: parseFloat(root.querySelector("#inp-goal-iron").value) || 18,
          magnesium: parseFloat(root.querySelector("#inp-goal-magnesium").value) || 400,
          potassium: parseFloat(root.querySelector("#inp-goal-potassium").value) || 3500,
          sodium: parseFloat(root.querySelector("#inp-goal-sodium").value) || 2300,
          zinc: parseFloat(root.querySelector("#inp-goal-zinc").value) || 11
        };
        dayData.goals = newGoals;

        if (root.querySelector("#chk-save-default-goals").checked) {
          nutritionDB.__defaultGoals = { ...newGoals };
        }

        await saveNutrition();
        goalsModal.style.display = "none";
        render();
      });

      root.querySelector("#toggle-summary")?.addEventListener("click", async () => { dayData.summaryOpen = !dayData.summaryOpen; await saveNutrition(); render(); });
      root.querySelector("#toggle-table")?.addEventListener("click", async () => { dayData.tableOpen = !dayData.tableOpen; await saveNutrition(); render(); });
      root.querySelector("#toggle-micro")?.addEventListener("click", async () => { dayData.microOpen = !dayData.microOpen; await saveNutrition(); render(); });

      const logModal = root.querySelector("#ntr-modal");
      const searchInp = root.querySelector("#ntr-search-food");
      const searchRes = root.querySelector("#ntr-search-res");
      const servInp = root.querySelector("#ntr-custom-serv");
      const unitInp = root.querySelector("#ntr-custom-unit");
      let selectedFoodRef = null;

      const updateScaledNutrients = (enteredQty, baseFood) => {
        if (!baseFood) return;
        const qty = parseFloat(enteredQty) || baseFood.serving;
        const ratio = qty / baseFood.serving;

        root.querySelector("#ntr-in-cals").value = Math.round(baseFood.cals * ratio * 10) / 10;
        root.querySelector("#ntr-in-p").value = Math.round(baseFood.p * ratio * 10) / 10;
        root.querySelector("#ntr-in-f").value = Math.round(baseFood.f * ratio * 10) / 10;
        root.querySelector("#ntr-in-c").value = Math.round(baseFood.c * ratio * 10) / 10;
      };

      const renderSearchList = (query) => {
        const q = (query || "").toLowerCase();
        const sorted = [...foodLibrary].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        const filtered = sorted.filter(f => f.name.toLowerCase().includes(q));

        searchRes.innerHTML = filtered.map(f => `
          <div class="ntr-search-item" data-name="${f.name}">
            <div>
              <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">
                ${f.name} ${!f.isBase ? '<span style="color:#fde68a; font-size:0.65rem; background:#27272a; padding:1px 4px; border-radius:3px;">Custom</span>' : ''}
                <span style="color:#71717a; font-size:0.7rem;">(${f.serving} ${f.unit || 'g'})</span>
              </div>
              <div style="font-size:0.68rem; color:#a1a1aa;">${f.cals} kcal • P: ${f.p}g | F: ${f.f}g | C: ${f.c}g</div>
            </div>
          </div>
        `).join("");

        searchRes.querySelectorAll(".ntr-search-item").forEach(item => {
          item.addEventListener("click", () => {
            const found = foodLibrary.find(f => f.name === item.dataset.name);
            if (found) {
              selectedFoodRef = found;
              root.querySelector("#ntr-custom-name").value = found.name;
              servInp.value = found.serving;
              unitInp.value = found.unit || "g";
              updateScaledNutrients(found.serving, found);
            }
          });
        });
      };

      servInp?.addEventListener("input", () => {
        if (selectedFoodRef) updateScaledNutrients(servInp.value, selectedFoodRef);
      });

      root.querySelectorAll(".ntr-chip").forEach(ch => {
        ch.addEventListener("click", () => {
          if (!selectedFoodRef) return;
          let cur = parseFloat(servInp.value) || selectedFoodRef.serving;
          if (ch.dataset.mult) {
            cur = selectedFoodRef.serving * parseFloat(ch.dataset.mult);
          } else if (ch.dataset.add) {
            cur += parseFloat(ch.dataset.add);
          }
          servInp.value = Math.round(cur);
          updateScaledNutrients(servInp.value, selectedFoodRef);
        });
      });

      root.querySelector("#btn-open-modal")?.addEventListener("click", () => {
        logModal.style.display = "flex";
        searchInp.value = "";
        selectedFoodRef = null;
        renderSearchList("");
        root.querySelector("#ntr-custom-name").value = "";
        servInp.value = "100";
        unitInp.value = "g";
        root.querySelector("#ntr-in-cals").value = "";
        root.querySelector("#ntr-in-p").value = "";
        root.querySelector("#ntr-in-f").value = "";
        root.querySelector("#ntr-in-c").value = "";
        searchInp.focus({ preventScroll: true });
      });

      searchInp?.addEventListener("input", () => renderSearchList(searchInp.value));
      root.querySelector("#btn-close-ntr-modal")?.addEventListener("click", () => { logModal.style.display = "none"; });
      root.querySelector("#btn-close-log-x")?.addEventListener("click", () => { logModal.style.display = "none"; });

      root.querySelector("#btn-save-ntr-food")?.addEventListener("click", async () => {
        const name = root.querySelector("#ntr-custom-name").value.trim() || "Food Item";
        const meal = root.querySelector("#ntr-custom-meal").value;
        const serv = `${servInp.value.trim() || "100"} ${unitInp.value.trim() || "g"}`;
        const cals = parseFloat(root.querySelector("#ntr-in-cals").value) || 0;
        const p = parseFloat(root.querySelector("#ntr-in-p").value) || 0;
        const f = parseFloat(root.querySelector("#ntr-in-f").value) || 0;
        const c = parseFloat(root.querySelector("#ntr-in-c").value) || 0;

        let microObj = {};
        if (selectedFoodRef) {
          const ratio = (parseFloat(servInp.value) || selectedFoodRef.serving) / selectedFoodRef.serving;
          microObj = {
            fiber: Math.round((selectedFoodRef.fiber || 0) * ratio * 10) / 10,
            calcium: Math.round((selectedFoodRef.calcium || 0) * ratio * 10) / 10,
            iron: Math.round((selectedFoodRef.iron || 0) * ratio * 10) / 10,
            magnesium: Math.round((selectedFoodRef.magnesium || 0) * ratio * 10) / 10,
            potassium: Math.round((selectedFoodRef.potassium || 0) * ratio * 10) / 10,
            sodium: Math.round((selectedFoodRef.sodium || 0) * ratio * 10) / 10,
            zinc: Math.round((selectedFoodRef.zinc || 0) * ratio * 10) / 10
          };
          await incrementFoodUsage(selectedFoodRef.name);
        }

        dayData.items.push({ name, meal, serving: serv, cals, p, f, c, ...microObj });
        await saveNutrition();
        logModal.style.display = "none";
        render();
      });

      const libModal = root.querySelector("#food-library-modal");
      const libFilterInp = root.querySelector("#lib-filter-input");
      const libFoodsList = root.querySelector("#lib-foods-list");

      const renderLibraryList = (query) => {
        const q = (query || "").toLowerCase();
        const sorted = [...foodLibrary].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        const filtered = sorted.filter(f => f.name.toLowerCase().includes(q));

        if (filtered.length === 0) {
          libFoodsList.innerHTML = '<div style="padding:10px; color:#71717a; text-align:center; font-size:0.75rem;">No foods found. Click "+ New" to add.</div>';
          return;
        }

        libFoodsList.innerHTML = filtered.map(f => `
          <div class="ntr-search-item lib-item" data-name="${f.name}">
            <div style="flex:1;">
              <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">
                ${f.name} ${!f.isBase ? '<span style="color:#fde68a; font-size:0.65rem; background:#202023; padding:1px 5px; border-radius:3px;">Custom</span>' : ''}
                <span style="color:#71717a; font-size:0.7rem;">(${f.serving} ${f.unit || 'g'})</span>
              </div>
              <div style="font-size:0.68rem; color:#a1a1aa;">${f.cals} kcal • P: ${f.p}g | F: ${f.f}g | C: ${f.c}g</div>
            </div>
            ${!f.isBase ? `<button class="ntr-del-btn btn-del-cf" data-name="${f.name}" title="Delete">✕</button>` : ''}
          </div>
        `).join("");

        libFoodsList.querySelectorAll(".lib-item").forEach(item => {
          item.addEventListener("click", (e) => {
            if (e.target.classList.contains('btn-del-cf')) return;
            const found = foodLibrary.find(f => f.name === item.dataset.name);
            if (found) {
              libModal.style.display = "none";
              logModal.style.display = "flex";
              selectedFoodRef = found;
              root.querySelector("#ntr-custom-name").value = found.name;
              servInp.value = found.serving;
              unitInp.value = found.unit || "g";
              updateScaledNutrients(found.serving, found);
            }
          });
        });

        libFoodsList.querySelectorAll(".btn-del-cf").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const foodName = btn.dataset.name;
            customFoods = customFoods.filter(f => f.name !== foodName);
            await saveCustomFoods();
            renderLibraryList(libFilterInp.value);
          });
        });
      };

      root.querySelector("#btn-open-food-library")?.addEventListener("click", () => {
        libModal.style.display = "flex";
        libFilterInp.value = "";
        renderLibraryList("");
        libFilterInp.focus({ preventScroll: true });
      });
      libFilterInp?.addEventListener("input", () => renderLibraryList(libFilterInp.value));
      root.querySelector("#btn-close-lib-modal")?.addEventListener("click", () => { libModal.style.display = "none"; });
      root.querySelector("#btn-close-lib-x")?.addEventListener("click", () => { libModal.style.display = "none"; });

      root.querySelector("#btn-lib-create-new")?.addEventListener("click", () => {
        libModal.style.display = "none";
        cfModal.style.display = "flex";
        root.querySelector("#cf-name").value = "";
        root.querySelector("#cf-serving").value = "100";
        root.querySelector("#cf-unit").value = "g";
        root.querySelector("#cf-cals").value = "";
        root.querySelector("#cf-p").value = "";
        root.querySelector("#cf-f").value = "";
        root.querySelector("#cf-c").value = "";
        root.querySelector("#cf-name").focus({ preventScroll: true });
      });

      const cfModal = root.querySelector("#custom-food-modal");
      root.querySelector("#btn-close-cf-modal")?.addEventListener("click", () => { cfModal.style.display = "none"; });
      root.querySelector("#btn-close-cf-x")?.addEventListener("click", () => { cfModal.style.display = "none"; });

      root.querySelector("#btn-save-permanent-cf")?.addEventListener("click", async () => {
        const name = root.querySelector("#cf-name").value.trim();
        if (!name) return;

        const serv = parseFloat(root.querySelector("#cf-serving").value) || 100;
        const unit = root.querySelector("#cf-unit").value.trim() || "g";
        const cals = parseFloat(root.querySelector("#cf-cals").value) || 0;
        const p = parseFloat(root.querySelector("#cf-p").value) || 0;
        const f = parseFloat(root.querySelector("#cf-f").value) || 0;
        const c = parseFloat(root.querySelector("#cf-c").value) || 0;
        const autoLog = root.querySelector("#cf-auto-log").checked;

        const newFood = { name, serving: serv, unit, cals, p, f, c, isBase: false, usageCount: 1 };
        customFoods.push(newFood);
        await saveCustomFoods();

        if (autoLog) {
          dayData.items.push({ name, meal: "Snacks", serving: `${serv} ${unit}`, cals, p, f, c });
          await saveNutrition();
        }

        cfModal.style.display = "none";
        render();
      });

      const mbModal = root.querySelector("#meal-builder-modal");
      const mbSelect = root.querySelector("#mb-select-food");
      const mbQtyInp = root.querySelector("#mb-add-qty");
      const mbIngList = root.querySelector("#mb-ingredients-list");
      const mbTotalsDisp = root.querySelector("#mb-totals-display");
      let activeMealIngredients = [];

      const updateMealTotals = () => {
        let totCals = 0, totP = 0, totF = 0, totC = 0;
        mbIngList.innerHTML = activeMealIngredients.map((ing, idx) => {
          totCals += ing.cals; totP += ing.p; totF += ing.f; totC += ing.c;
          return `
            <div class="ntr-row-item" style="grid-template-columns: 2fr 1fr 20px; padding: 4px 0;">
              <div style="font-size:0.75rem; color:#fff;">${ing.name} <span style="color:#71717a;">(${ing.qty}g)</span></div>
              <div style="font-size:0.72rem; color:#f59e0b; text-align:right;">${ing.cals.toFixed(0)} kcal</div>
              <button class="ntr-del-btn btn-del-ing" data-idx="${idx}">✕</button>
            </div>
          `;
        }).join("");

        if (activeMealIngredients.length === 0) {
          mbIngList.innerHTML = '<div style="color:#71717a; font-size:0.72rem; text-align:center;">No ingredients added</div>';
        }

        mbTotalsDisp.innerHTML = `
          <span style="color:#f59e0b;">${totCals.toFixed(1)} kcal</span>
          <span style="color:#10b981;">P: ${totP.toFixed(1)}g</span>
          <span style="color:#ef4444;">F: ${totF.toFixed(1)}g</span>
          <span style="color:#0ea5e9;">C: ${totC.toFixed(1)}g</span>
        `;

        mbIngList.querySelectorAll(".btn-del-ing").forEach(b => {
          b.addEventListener("click", () => {
            activeMealIngredients.splice(parseInt(b.dataset.idx, 10), 1);
            updateMealTotals();
          });
        });
      };

      root.querySelector("#btn-open-meal-builder")?.addEventListener("click", () => {
        mbModal.style.display = "flex";
        activeMealIngredients = [];
        mbSelect.innerHTML = foodLibrary.map(f => `<option value="${f.name}">${f.name} (${f.serving}${f.unit || 'g'})</option>`).join("");
        updateMealTotals();
      });
      root.querySelector("#btn-close-mb-modal")?.addEventListener("click", () => { mbModal.style.display = "none"; });
      root.querySelector("#btn-close-mb-x")?.addEventListener("click", () => { mbModal.style.display = "none"; });

      root.querySelector("#btn-mb-add-item")?.addEventListener("click", () => {
        const selectedName = mbSelect.value.split(" (")[0];
        const food = foodLibrary.find(f => f.name === selectedName);
        const qty = parseFloat(mbQtyInp.value) || 100;

        if (food) {
          const ratio = qty / food.serving;
          activeMealIngredients.push({
            name: food.name,
            qty: qty,
            cals: Math.round(food.cals * ratio * 10) / 10,
            p: Math.round(food.p * ratio * 10) / 10,
            f: Math.round(food.f * ratio * 10) / 10,
            c: Math.round(food.c * ratio * 10) / 10
          });
          updateMealTotals();
        }
      });

      root.querySelector("#btn-mb-log-meal")?.addEventListener("click", async () => {
        if (activeMealIngredients.length === 0) return;
        const mealName = root.querySelector("#mb-meal-name").value.trim() || "Combined Meal";
        let totCals = 0, totP = 0, totF = 0, totC = 0, totGrams = 0;

        activeMealIngredients.forEach(i => {
          totCals += i.cals; totP += i.p; totF += i.f; totC += i.c; totGrams += i.qty;
        });

        dayData.items.push({
          name: mealName,
          meal: "Lunch",
          serving: `${totGrams} g`,
          cals: Math.round(totCals * 10) / 10,
          p: Math.round(totP * 10) / 10,
          f: Math.round(totF * 10) / 10,
          c: Math.round(totC * 10) / 10
        });

        await saveNutrition();
        mbModal.style.display = "none";
        render();
      });

      const bcModal = root.querySelector("#barcode-modal");
      const bcVideo = root.querySelector("#bc-video");
      const bcStatus = root.querySelector("#bc-status");
      const bcManualInp = root.querySelector("#bc-manual-input");
      const bcPreview = root.querySelector("#bc-result-preview");
      const bcProdName = root.querySelector("#bc-prod-name");
      const bcProdMacros = root.querySelector("#bc-prod-macros");
      const btnBcUse = root.querySelector("#btn-bc-use-prod");

      let videoStream = null;
      let scanInterval = null;
      let zxingReader = null;
      let scannedProductData = null;

      const stopCamera = () => {
        if (scanInterval) this.untrackInterval(scanInterval);
        if (zxingReader) {
          try { zxingReader.reset(); } catch (e) {}
          zxingReader = null;
        }
        if (videoStream) {
          videoStream.getTracks().forEach(t => t.stop());
          videoStream = null;
        }
      };

      // iOS (Obsidian's WKWebView) has no native BarcodeDetector API, which
      // is why the camera used to sit there doing nothing. We lazy-load a
      // pure-JS decoder (ZXing) as a fallback so scanning actually works
      // there too — but instead of injecting a <script src="https://...">
      // tag, which Obsidian's mobile webview can silently block (the
      // request never fires onload OR onerror, so the UI just hangs on
      // "Loading scanner..." forever, indistinguishable from "just a
      // camera"), we fetch the library's source with Obsidian's own
      // requestUrl (which isn't subject to that page-level restriction)
      // and execute it directly. Loaded once and cached on window.
      const ensureZXing = () => {
        if (window.ZXing) return Promise.resolve(window.ZXing);
        if (!window.__somaZXingLoading) {
          window.__somaZXingLoading = (async () => {
            const resp = await requestUrl({
              url: "https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js",
              method: "GET"
            });
            if (!resp || !resp.text) throw new Error("ZXing download returned no content");
            // Execute the UMD bundle in the global scope so it attaches
            // itself to window.ZXing, same as a <script> tag would.
            const runInGlobalScope = new Function(resp.text);
            runInGlobalScope.call(window);
            if (!window.ZXing) throw new Error("ZXing script ran but did not attach to window.ZXing");
            return window.ZXing;
          })().catch((err) => {
            window.__somaZXingLoading = null;
            throw err;
          });
        }
        return window.__somaZXingLoading;
      };

      // Different products/regions register the same barcode under slightly
      // different digit lengths (12-digit UPC-A vs 13-digit EAN-13 with a
      // leading 0). This produced the "false or missing" lookups. We try
      // the sensible variants automatically before giving up.
      const barcodeVariants = (code) => {
        const c = String(code).trim();
        const variants = [c];
        if (c.length === 12) variants.push("0" + c);
        if (c.length === 13 && c.startsWith("0")) variants.push(c.slice(1));
        return [...new Set(variants)];
      };

      const tryFetchJson = async (url) => {
        try {
          const resp = await requestUrl({ url, method: "GET" });
          return resp.json;
        } catch (e) {
          return null;
        }
      };

      const parseOFFProduct = (prod, barcode) => {
        const name = prod.product_name || prod.product_name_fr || prod.product_name_en || null;
        if (!name) return null;
        const nutriments = prod.nutriments || {};
        const cals = nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || Math.round((nutriments["energy_100g"] || 0) / 4.184) || 0;
        return {
          name,
          barcode,
          serving: 100,
          unit: "g",
          cals: Math.round(cals * 10) / 10,
          p: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
          f: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
          c: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
          isBase: false,
          usageCount: 1
        };
      };

      // Provider chain: Open Food Facts first (best coverage incl. North
      // African / Algerian products, esp. French-labelled ones), then its
      // sister "Open Products Facts" database (products sometimes get
      // logged there instead), then UPCItemDB as a last resort — it won't
      // have macros, but at least gets the product name so manual entry
      // is faster instead of starting from a blank card.
      const PRODUCT_PROVIDERS = [
        { label: "Open Food Facts", fetch: async (code) => {
            const data = await tryFetchJson(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
            return (data && data.status === 1 && data.product) ? parseOFFProduct(data.product, code) : null;
          }
        },
        { label: "Open Products Facts", fetch: async (code) => {
            const data = await tryFetchJson(`https://world.openproductsfacts.org/api/v0/product/${code}.json`);
            return (data && data.status === 1 && data.product) ? parseOFFProduct(data.product, code) : null;
          }
        },
        { label: "UPCItemDB", fetch: async (code) => {
            const data = await tryFetchJson(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
            const item = data && Array.isArray(data.items) && data.items[0];
            if (!item || !item.title) return null;
            return { name: item.title, barcode: code, serving: 100, unit: "g", cals: 0, p: 0, f: 0, c: 0, isBase: false, usageCount: 1, needsMacros: true };
          }
        }
      ];

      const fetchProductByBarcode = async (barcode) => {
        const cached = customFoods.find(f => f.barcode === barcode);
        if (cached) {
          scannedProductData = { ...cached };
          bcProdName.textContent = `${cached.name} (Cached)`;
          bcProdMacros.textContent = `Per ${cached.serving}${cached.unit}: ${cached.cals} kcal | P: ${cached.p}g | F: ${cached.f}g | C: ${cached.c}g`;
          bcPreview.style.display = "block";
          bcStatus.textContent = "Product loaded from offline cache";
          stopCamera();
          return;
        }

        const codesToTry = barcodeVariants(barcode);

        for (const provider of PRODUCT_PROVIDERS) {
          for (const code of codesToTry) {
            bcStatus.textContent = `Checking ${provider.label} (${code})...`;
            let result;
            try {
              result = await provider.fetch(code);
            } catch (e) {
              result = null;
            }
            if (result) {
              scannedProductData = result;
              if (!customFoods.some(f => f.name === result.name)) {
                customFoods.push(scannedProductData);
                await saveCustomFoods();
              }
              bcProdName.textContent = result.name + (result.needsMacros ? " (macros not available — please fill in)" : "");
              bcProdMacros.textContent = `Per 100g: ${result.cals} kcal | P: ${result.p}g | F: ${result.f}g | C: ${result.c}g`;
              bcPreview.style.display = "block";
              bcStatus.textContent = `Found via ${provider.label}`;
              stopCamera();
              return;
            }
          }
        }

        bcStatus.textContent = "Not found in any database. Try manual entry below.";
      };

      const startCamera = async () => {
        scannedProductData = null;
        bcPreview.style.display = "none";
        bcStatus.textContent = "Starting camera...";
        try {
          videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          bcVideo.srcObject = videoStream;
          await bcVideo.play();
          bcStatus.textContent = "Camera active. Center barcode.";

          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
            scanInterval = this.trackInterval(async () => {
              try {
                const barcodes = await detector.detect(bcVideo);
                if (barcodes.length > 0) {
                  const code = barcodes[0].rawValue;
                  this.untrackInterval(scanInterval);
                  bcManualInp.value = code;
                  await fetchProductByBarcode(code);
                }
              } catch (e) {}
            }, 600);
          } else {
            // No native scanner API (this is the normal case on iOS) —
            // fall back to the JS decoder so scanning still works.
            bcStatus.textContent = "Loading scanner (first time only)...";
            try {
              const ZXing = await ensureZXing();
              zxingReader = new ZXing.BrowserMultiFormatReader();
              bcStatus.textContent = "Camera active. Center barcode.";
              zxingReader.decodeFromVideoElement(bcVideo, async (result, err) => {
                if (result && result.getText) {
                  const code = result.getText();
                  bcManualInp.value = code;
                  if (zxingReader) { try { zxingReader.reset(); } catch (e) {} zxingReader = null; }
                  await fetchProductByBarcode(code);
                }
              });
            } catch (e) {
              bcStatus.textContent = "Scanner unavailable (no internet for first-time setup?). Enter barcode manually below.";
            }
          }
        } catch (e) {
          bcStatus.textContent = "Camera unavailable. Enter barcode manually:";
        }
      };

      root.querySelector("#btn-open-barcode")?.addEventListener("click", () => {
        bcModal.style.display = "flex";
        bcManualInp.value = "";
        startCamera();
      });

      root.querySelector("#btn-close-bc-modal")?.addEventListener("click", () => { stopCamera(); bcModal.style.display = "none"; });
      root.querySelector("#btn-close-bc-x")?.addEventListener("click", () => { stopCamera(); bcModal.style.display = "none"; });
      root.querySelector("#btn-bc-fetch")?.addEventListener("click", () => {
        const code = bcManualInp.value.trim();
        if (code) fetchProductByBarcode(code);
      });

      btnBcUse?.addEventListener("click", () => {
        if (!scannedProductData) return;
        stopCamera();
        bcModal.style.display = "none";
        logModal.style.display = "flex";

        selectedFoodRef = scannedProductData;
        root.querySelector("#ntr-custom-name").value = scannedProductData.name;
        servInp.value = scannedProductData.serving;
        unitInp.value = scannedProductData.unit;
        updateScaledNutrients(scannedProductData.serving, scannedProductData);
      });
    };

    render();
  }

  // ==========================================================================
  // CODEBLOCK 6 & 7: MACRO & RECOMP AUDIT WIDGETS (`weekly-audit` & `monthly-audit`)
  // ==========================================================================
  // ==========================================================================
  // CODEBLOCK 9: HABIT TRACKER (`habittracker`) — merged from Habit Radar
  // ==========================================================================
  async mountHabitTracker(containerEl, source, ctx) {
    containerEl.empty();

    const store = new SomaHabitStore(this);
    await store.load();
    const pluginLike = {
      settings: store.settings,
      saveSettings: () => store.saveSettings()
    };

    const options = { view: "today", header: true, summary: true, tabs: true };
    const lines = (source || "").split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const splitIdx = line.indexOf(":");
      if (splitIdx > -1) {
        const key = line.slice(0, splitIdx).trim().toLowerCase();
        const val = line.slice(splitIdx + 1).trim().toLowerCase();
        if (key === "view") options.view = val;
        if (key === "header") options.header = val !== "false";
        if (key === "summary") options.summary = val !== "false";
        if (key === "tabs") options.tabs = val !== "false";
      }
    }

    const controller = new HabitRadarUIController(this.app, pluginLike, containerEl, options);
    if (ctx && ctx.addChild) {
      const child = new HabitRadarRenderChild(containerEl, controller);
      ctx.addChild(child);
    } else {
      controller.render();
    }
    return controller;
  }

  async mountAuditWidget(containerEl, dayWindow = 7, title = "Audit") {
    containerEl.empty();
    const root = containerEl.createDiv({ cls: "soma-audit-root" });

    let history = await this.readVaultJson(HISTORY_FILE_PATH, {});
    let nutritionDB = await this.readVaultJson(NUTRITION_FILE_PATH, {});
    let habitStore = new SomaHabitStore(this);
    await habitStore.load();
    const habits = habitStore.settings.habits || [];

    const now = new Date();
    let totalBurn = 0, loggedDays = 0, weights = [];
    let foodLoggedDays = 0;
    let habitChecksDone = 0;

    for (let i = 0; i < dayWindow; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12, 0, 0);
      const key = getLocalDateKey(d);
      if (history[key]) {
        loggedDays++;
        totalBurn += (history[key].caloriesBurned || 0);
      }
      if (nutritionDB[key] && nutritionDB[key].bodyWeight) {
        weights.push(nutritionDB[key].bodyWeight);
      }
      if (nutritionDB[key] && Array.isArray(nutritionDB[key].items) && nutritionDB[key].items.length > 0) {
        foodLoggedDays++;
      }
      habits.forEach(h => {
        if (h.history && h.history[key] === true) habitChecksDone++;
      });
    }

    const avgWeight = weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : "N/A";
    const habitPossible = habits.length * dayWindow;
    const habitCompletionPct = habitPossible > 0 ? Math.round((habitChecksDone / habitPossible) * 100) : 0;

    root.innerHTML = `
      <div class="soma-card">
        <div class="soma-tag-badge">${dayWindow}-Day Review</div>
        <div style="font-size:1.05rem; font-weight:900; color:#fff; margin:4px 0 10px 0;">📊 ${title}</div>
        <div class="soma-stats-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:10px;">
          <div class="soma-stat-box" style="text-align:center;"><div class="soma-stat-lbl">Active Burn</div><div class="soma-stat-val" style="font-size:1.1rem; color:#f59e0b;">${totalBurn.toLocaleString()} kcal</div></div>
          <div class="soma-stat-box" style="text-align:center;"><div class="soma-stat-lbl">Avg Weight</div><div class="soma-stat-val" style="font-size:1.1rem; color:#38bdf8;">${avgWeight} kg</div></div>
          <div class="soma-stat-box" style="text-align:center;"><div class="soma-stat-lbl">Workouts Logged</div><div class="soma-stat-val" style="font-size:1.1rem; color:#10b981;">${loggedDays}/${dayWindow}d</div></div>
        </div>
        <div class="soma-stats-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:0;">
          <div class="soma-stat-box" style="text-align:center;"><div class="soma-stat-lbl">Food Logged</div><div class="soma-stat-val" style="font-size:1.1rem; color:#ef4444;">${foodLoggedDays}/${dayWindow}d</div></div>
          <div class="soma-stat-box" style="text-align:center;"><div class="soma-stat-lbl">Habit Completion</div><div class="soma-stat-val" style="font-size:1.1rem; color:#a855f7;">${habitPossible > 0 ? habitCompletionPct + '%' : 'N/A'}</div></div>
          <div class="soma-stat-box" style="text-align:center;"><div class="soma-stat-lbl">Habit Check-ins</div><div class="soma-stat-val" style="font-size:1.1rem; color:#22c55e;">${habitChecksDone}</div></div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // SHARED HELPER: Ensure nutrition DB always has a valid _settings block
  // ==========================================================================
  ensureNutritionSettings(nutritionDB) {
    if (!nutritionDB._settings) {
      nutritionDB._settings = { creatineStashGrams: 300, autoProteinTarget: false, proteinPerKg: 2.0 };
    } else {
      if (nutritionDB._settings.creatineStashGrams === undefined) nutritionDB._settings.creatineStashGrams = 300;
      if (nutritionDB._settings.autoProteinTarget === undefined) nutritionDB._settings.autoProteinTarget = false;
      if (nutritionDB._settings.proteinPerKg === undefined) nutritionDB._settings.proteinPerKg = 2.0;
    }
    return nutritionDB;
  }

  // ==========================================================================
  // CODEBLOCK 5: STANDALONE CREATINE TRACKER (`creatine-tracker`)
  // ==========================================================================
  async mountCreatineStandalone(containerEl, sourcePath) {
    containerEl.empty();
    const root = containerEl.createDiv({ cls: "cr-saturation-root" });

    const fileName = sourcePath ? sourcePath.split("/").pop() : "";
    const dateMatch = fileName ? fileName.match(/\d{4}-\d{2}-\d{2}/) : null;
    const todayKey = dateMatch ? dateMatch[0] : getLocalDateKey(new Date());

    let nutritionDB = await this.readVaultJson(NUTRITION_FILE_PATH, {});
    this.ensureNutritionSettings(nutritionDB);
    if (!nutritionDB[todayKey]) nutritionDB[todayKey] = { creatine: 0 };

    let saturation = 60.0, currentStreak = 0;
    const refDate = parseLocalDateKey(todayKey);

    for (let i = 30; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateKey(d);
      const dose = nutritionDB[dStr]?.creatine || 0;
      if (dose > 0) {
        saturation = Math.min(100.0, saturation + Math.max(1.4, (dose / 5.0) * (100.0 - saturation) * 0.10));
      } else if (saturation > 60.0) {
        saturation = Math.max(60.0, saturation - (saturation * 0.015));
      }
    }

    let checkDate = new Date(refDate);
    for (let s = 0; s < 60; s++) {
      const dStr = getLocalDateKey(checkDate);
      if ((nutritionDB[dStr]?.creatine || 0) > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (s === 0) { checkDate.setDate(checkDate.getDate() - 1); continue; }
        break;
      }
    }

    const satPct = Math.round(saturation);
    const stashGrams = Math.max(0, nutritionDB._settings.creatineStashGrams || 0);
    const daysLeft = Math.floor(stashGrams / 5);
    const finishDate = new Date(refDate);
    finishDate.setDate(finishDate.getDate() + daysLeft);
    const finishFormatted = finishDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const todayDose = nutritionDB[todayKey]?.creatine || 0;

    root.innerHTML = `
      <div class="soma-card ${satPct >= 95 ? 'soma-card-emerald-glow' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.05rem; font-weight:900; color:#fff;">⚡ Creatine Saturation</span>
            ${currentStreak > 0 ? `<span class="soma-tag" style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid #f59e0b;">🔥 ${currentStreak}d Streak</span>` : ''}
          </div>
          <span style="font-size:0.85rem; font-weight:800; color:${satPct >= 95 ? '#10b981' : '#f59e0b'};">${satPct}% • ${satPct >= 95 ? 'Saturated' : 'Building'}</span>
        </div>
        <div class="soma-bar-wrap" style="margin-bottom:10px;"><div class="soma-bar-fill" style="width:${satPct}%; background:#10b981;"></div></div>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#9ca3af; margin-bottom:12px;">
          <span>Tub Stash: <b style="color:#fff;">${stashGrams}g</b> (${daysLeft}d left)</span>
          <span style="color:#f59e0b;">Depletion: <b>${finishFormatted}</b></span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:#fff;">Today: <b>${todayDose}g</b></span>
          <div style="display:flex; gap:6px;">
            <button class="soma-btn" id="btn-c-3">+3g</button>
            <button class="soma-btn soma-btn-save" id="btn-c-5">+5g</button>
            <button class="soma-btn" id="btn-c-reset">↺ Reset</button>
          </div>
        </div>
      </div>
    `;

    const persist = async () => {
      await this.writeVaultJson(NUTRITION_FILE_PATH, nutritionDB);
      await this.mountCreatineStandalone(containerEl, sourcePath);
    };

    const addDose = async (grams) => {
      nutritionDB[todayKey].creatine = (nutritionDB[todayKey].creatine || 0) + grams;
      nutritionDB._settings.creatineStashGrams = Math.max(0, (nutritionDB._settings.creatineStashGrams || 0) - grams);
      await persist();
    };

    root.querySelector("#btn-c-3")?.addEventListener("click", () => addDose(3));
    root.querySelector("#btn-c-5")?.addEventListener("click", () => addDose(5));
    root.querySelector("#btn-c-reset")?.addEventListener("click", async () => {
      const cur = nutritionDB[todayKey].creatine || 0;
      nutritionDB._settings.creatineStashGrams = (nutritionDB._settings.creatineStashGrams || 0) + cur;
      nutritionDB[todayKey].creatine = 0;
      await persist();
    });
  }

  // ==========================================================================
  // CODEBLOCK 6: STANDALONE EDITABLE WEEKLY PLANNER / CALENDAR CASCADE (`weekly-gym` / `weekly-gym-tracker`)
  // ==========================================================================
  async mountWeeklyPlanner(containerEl) {
    containerEl.empty();
    const root = containerEl.createDiv({ cls: "soma-weekly-planner-root" });

    let settings = await this.readVaultJson(SETTINGS_FILE_PATH, { scheduleOverrides: {} });
    if (!settings.scheduleOverrides) settings.scheduleOverrides = {};

    const today = parseLocalDateKey(getLocalDateKey(new Date()));
    const startOfWeek = new Date(today);
    const dow = startOfWeek.getDay();
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

    const splitNames = Object.keys(ROUTINE_PRESETS);
    const allSplitOptions = ["Rest Day", ...splitNames];

    const render = () => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const key = getLocalDateKey(d);
        const proj = SomaIntelligenceEngine.getProgramProjectedDay(d, settings.scheduleOverrides);
        days.push({ key, d, proj });
      }

      root.innerHTML = `
        <div class="soma-card">
          <div style="font-size:1.05rem; font-weight:900; color:#fff; margin-bottom:10px;">📅 Editable Calendar Cascade</div>
          ${days.map(({ key, d, proj }) => `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-weight:800; color:#fff; font-size:0.85rem;">${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}${key === getLocalDateKey(today) ? ' <span style="color:#10b981;">• Today</span>' : ''}</div>
                <div style="font-size:0.7rem; color:#9ca3af;">${proj.phaseBadge}${settings.scheduleOverrides[key] ? ' • Custom' : ''}</div>
              </div>
              <select class="soma-input" style="width:auto; height:34px; text-align:left; padding:0 8px;" data-action="set-day-split" data-key="${key}">
                <option value="">— Auto (${proj.isRest ? 'Rest' : proj.split}) —</option>
                ${allSplitOptions.map(s => `<option value="${s}" ${settings.scheduleOverrides[key] === s ? 'selected' : ''}>${s}</option>`).join("")}
              </select>
            </div>
          `).join("")}
        </div>
      `;

      root.querySelectorAll('[data-action="set-day-split"]').forEach(sel => {
        sel.addEventListener("change", async (e) => {
          const key = e.target.dataset.key;
          const val = e.target.value;
          if (val === "") delete settings.scheduleOverrides[key];
          else settings.scheduleOverrides[key] = val;
          await this.writeVaultJson(SETTINGS_FILE_PATH, settings);
          render();
        });
      });
    };

    render();
  }

  // ==========================================================================
  // CODEBLOCK 7: WEEKLY MACRO DASHBOARD (`macro-weekly`)
  // ==========================================================================
  async mountWeeklyDashboard(containerEl, sourcePath) {
    containerEl.empty();
    const root = containerEl.createDiv({ cls: "soma-weekly-dash-root" });

    let nutritionDB = await this.readVaultJson(NUTRITION_FILE_PATH, {});
    this.ensureNutritionSettings(nutritionDB);

    const fileName = sourcePath ? sourcePath.split("/").pop() : "";
    const dateMatch = fileName ? fileName.match(/\d{4}-\d{2}-\d{2}/) : null;
    const anchorKey = dateMatch ? dateMatch[0] : getLocalDateKey(new Date());
    const anchor = parseLocalDateKey(anchorKey);

    const startOfWeek = new Date(anchor);
    const dow = startOfWeek.getDay();
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

    const rows = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const key = getLocalDateKey(d);
      const day = nutritionDB[key];
      let cals = 0, p = 0, c = 0, f = 0;
      if (day && day.items) {
        day.items.forEach(it => { cals += it.cals || 0; p += it.p || 0; c += it.c || 0; f += it.f || 0; });
      }
      rows.push({ key, d, cals: Math.round(cals), p: Math.round(p), c: Math.round(c), f: Math.round(f), logged: !!(day && day.items && day.items.length) });
    }

    const loggedRows = rows.filter(r => r.logged);
    const avg = (field) => loggedRows.length ? Math.round(loggedRows.reduce((a, r) => a + r[field], 0) / loggedRows.length) : 0;

    root.innerHTML = `
      <div class="soma-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:1.05rem; font-weight:900; color:#fff;">🍽️ Weekly Macro Dashboard</div>
          <span class="soma-tag soma-tag-emerald">${loggedRows.length}/7 Logged</span>
        </div>
        <div style="display:grid; grid-template-columns: 1.2fr repeat(4, 1fr); gap:6px; font-size:0.72rem; color:#9ca3af; font-weight:800; padding:4px 6px;">
          <div>Day</div><div>Kcal</div><div>P</div><div>C</div><div>F</div>
        </div>
        ${rows.map(r => `
          <div style="display:grid; grid-template-columns: 1.2fr repeat(4, 1fr); gap:6px; padding:6px; border-top:1px solid rgba(255,255,255,0.06); font-size:0.78rem; ${r.logged ? 'color:#fff;' : 'color:#4b5563;'}">
            <div>${r.d.toLocaleDateString("en-US", { weekday: "short" })}</div>
            <div>${r.logged ? r.cals : '—'}</div>
            <div>${r.logged ? r.p + 'g' : '—'}</div>
            <div>${r.logged ? r.c + 'g' : '—'}</div>
            <div>${r.logged ? r.f + 'g' : '—'}</div>
          </div>
        `).join("")}
        <div style="display:flex; justify-content:space-between; background:#16181f; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:10px 14px; margin-top:10px; font-size:0.78rem;">
          <span style="color:#9ca3af; font-weight:700;">Weekly Average</span>
          <span style="color:#fff; font-weight:800;">${avg('cals')} kcal • P ${avg('p')}g • C ${avg('c')}g • F ${avg('f')}g</span>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // CODEBLOCK 8: PROGRESS CHARTS — 1RM TRENDLINES & WEEKLY VOLUME (`soma-progress`)
  // ==========================================================================
  async mountProgressWidget(containerEl, source) {
    containerEl.empty();
    const root = containerEl.createDiv({ cls: "soma-progress-root" });

    const history = await this.readVaultJson(HISTORY_FILE_PATH, {});
    const requestedExercise = (source || "").trim();

    const sessions = Object.entries(history)
      .map(([dateKey, s]) => ({ dateKey, ...s }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    // Build per-exercise 1RM trend
    const exerciseTrends = {};
    for (const s of sessions) {
      for (const ex of s.exercises || []) {
        if (requestedExercise && ex.name.toLowerCase() !== requestedExercise.toLowerCase()) continue;
        let best1RM = 0;
        for (const set of ex.sets || []) {
          if (set.done) {
            const rawW = parseFloat(set.weight) || 0;
            const totalW = (ex.usesBar && rawW > 0) ? (ex.barWeight || 20) + rawW : rawW;
            const est = SomaIntelligenceEngine.calculate1RM(totalW, parseInt(set.reps) || 0);
            if (est > best1RM) best1RM = est;
          }
        }
        if (best1RM > 0) {
          if (!exerciseTrends[ex.name]) exerciseTrends[ex.name] = [];
          exerciseTrends[ex.name].push({ dateKey: s.dateKey, est1RM: best1RM });
        }
      }
    }

    // Weekly volume per muscle group (last 8 weeks)
    const weeklyVolume = {};
    for (const s of sessions) {
      const d = parseLocalDateKey(s.dateKey);
      const weekStart = new Date(d);
      const dow = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() + (dow === 0 ? -6 : 1 - dow));
      const weekKey = getLocalDateKey(weekStart);
      if (!weeklyVolume[weekKey]) weeklyVolume[weekKey] = {};
      for (const [muscleKey, data] of Object.entries(s.muscles || {})) {
        weeklyVolume[weekKey][muscleKey] = (weeklyVolume[weekKey][muscleKey] || 0) + (data.sets || 0);
      }
    }
    const recentWeeks = Object.keys(weeklyVolume).sort().slice(-8);

    const trendKeys = Object.keys(exerciseTrends).slice(0, requestedExercise ? 1 : 6);

    const renderSparkline = (points) => {
      if (points.length === 0) return "";
      const max = Math.max(...points.map(p => p.est1RM));
      const min = Math.min(...points.map(p => p.est1RM));
      const range = Math.max(1, max - min);
      const w = 260, h = 46;
      const stepX = points.length > 1 ? w / (points.length - 1) : 0;
      const coords = points.map((p, i) => {
        const x = i * stepX;
        const y = h - ((p.est1RM - min) / range) * (h - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <polyline points="${coords}" fill="none" stroke="#10b981" stroke-width="2" />
      </svg>`;
    };

    root.innerHTML = `
      <div class="soma-card">
        <div style="font-size:1.05rem; font-weight:900; color:#fff; margin-bottom:10px;">📈 Progress: Est. 1RM Trends${requestedExercise ? ` — ${requestedExercise}` : ''}</div>
        ${trendKeys.length === 0 ? `<div style="color:#9ca3af; font-size:0.8rem; text-align:center; padding:12px;">No completed sets logged yet${requestedExercise ? ` for "${requestedExercise}"` : ''}.</div>` : trendKeys.map(name => {
          const points = exerciseTrends[name];
          const last = points[points.length - 1];
          const first = points[0];
          const delta = Math.round((last.est1RM - first.est1RM) * 10) / 10;
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-weight:800; color:#fff; font-size:0.85rem;">${name}</div>
                <div style="font-size:0.7rem; color:#9ca3af;">${points.length} data pts • ${delta >= 0 ? '+' : ''}${delta} since first log</div>
              </div>
              <div>${renderSparkline(points)}</div>
              <div style="text-align:right; font-weight:900; color:#10b981; font-size:0.95rem;">${last.est1RM}</div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="soma-card" style="margin-top:12px;">
        <div style="font-size:1.05rem; font-weight:900; color:#fff; margin-bottom:10px;">🧬 Weekly Volume (Sets) Per Muscle Group</div>
        ${recentWeeks.length === 0 ? `<div style="color:#9ca3af; font-size:0.8rem; text-align:center; padding:12px;">No workout history yet.</div>` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${recentWeeks.map(wk => {
              const muscles = weeklyVolume[wk];
              const total = Object.values(muscles).reduce((a, b) => a + b, 0);
              return `
                <div>
                  <div style="font-size:0.72rem; color:#9ca3af; margin-bottom:3px;">Week of ${wk} • ${total} total sets</div>
                  <div class="soma-bar-wrap"><div class="soma-bar-fill" style="width:${Math.min(100, total * 2)}%; background:#38bdf8;"></div></div>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>
    `;
  }

  // ==========================================================================
  // DATA EXPORT: CSV (workout history + macros) & JSON backup/restore
  // ==========================================================================
  async exportWorkoutHistoryCsv() {
    const history = await this.readVaultJson(HISTORY_FILE_PATH, {});
    const rows = [["Date", "Split", "Duration", "Calories Burned", "Total Volume", "Total Sets", "Exercise", "Set#", "Weight", "Reps", "Failure", "Done"]];
    for (const [dateKey, session] of Object.entries(history)) {
      for (const ex of session.exercises || []) {
        (ex.sets || []).forEach((s, i) => {
          rows.push([dateKey, session.split || "", session.durationFormatted || "", session.caloriesBurned || 0, session.totalVol || 0, session.totalSets || 0, ex.name, i + 1, s.weight ?? "", s.reps ?? "", s.failure ?? "", s.done ? "yes" : "no"]);
        });
      }
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    await this.writeVaultJson; // no-op reference to keep linter calm
    const path = "apps/scripts/soma-workout-export.csv";
    const dir = path.substring(0, path.lastIndexOf("/"));
    if (dir && !(await this.app.vault.adapter.exists(dir))) await this.app.vault.adapter.mkdir(dir);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file) await this.app.vault.modify(file, csv);
    else await this.app.vault.create(path, csv);
    new Notice(`Workout history exported to ${path}`);
  }

  async exportMacrosCsv() {
    const nutritionDB = await this.readVaultJson(NUTRITION_FILE_PATH, {});
    const rows = [["Date", "Body Weight", "Water(ml)", "Item", "Cals", "Protein", "Carbs", "Fat"]];
    for (const [dateKey, day] of Object.entries(nutritionDB)) {
      if (dateKey === "_settings" || dateKey === "__defaultGoals") continue;
      const items = day.items || [];
      if (items.length === 0) {
        rows.push([dateKey, day.bodyWeight ?? "", day.water ?? 0, "", "", "", "", ""]);
      } else {
        items.forEach(it => {
          rows.push([dateKey, day.bodyWeight ?? "", day.water ?? 0, it.name || "", it.cals || 0, it.p || 0, it.c || 0, it.f || 0]);
        });
      }
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const path = "apps/scripts/soma-macros-export.csv";
    const dir = path.substring(0, path.lastIndexOf("/"));
    if (dir && !(await this.app.vault.adapter.exists(dir))) await this.app.vault.adapter.mkdir(dir);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file) await this.app.vault.modify(file, csv);
    else await this.app.vault.create(path, csv);
    new Notice(`Macro diary exported to ${path}`);
  }

  async backupAllData() {
    const paths = [HISTORY_FILE_PATH, CUSTOM_EX_FILE_PATH, SETTINGS_FILE_PATH, NUTRITION_FILE_PATH, CUSTOM_FOODS_FILE, DATA_FILE_PATH, REGISTRY_FILE_PATH, WEEKLY_FILE_PATH];
    const bundle = {};
    for (const p of paths) {
      bundle[p] = await this.readVaultJson(p, null);
    }
    const path = `apps/scripts/soma-backup-${getLocalDateKey(new Date())}.json`;
    await this.writeVaultJson(path, bundle);
    new Notice(`Full backup saved to ${path}`);
  }

  async restoreFromBackup(backupPath) {
    const bundle = await this.readVaultJson(backupPath, null);
    if (!bundle) {
      new Notice(`Backup not found at ${backupPath}`);
      return;
    }
    for (const [p, data] of Object.entries(bundle)) {
      if (data !== null && data !== undefined) await this.writeVaultJson(p, data);
    }
    new Notice(`Restored data from ${backupPath}. Reopen your notes to see changes.`);
  }
};

// ============================================================================
// NATIVE OBSIDIAN SETTINGS TAB
// ============================================================================
class SomaSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "SOMA Smart Coach & Recovery HUD Pro" });

    new Setting(containerEl)
      .setName("Default unit")
      .setDesc("Used by new workout logs (existing logs keep their own unit).")
      .addDropdown(drop => {
        drop.addOption("kg", "Kilograms (kg)");
        drop.addOption("lb", "Pounds (lb)");
        this.plugin.readVaultJson(SETTINGS_FILE_PATH, { unit: "kg" }).then(s => drop.setValue(s.unit || "kg"));
        drop.onChange(async (val) => {
          const s = await this.plugin.readVaultJson(SETTINGS_FILE_PATH, {});
          s.unit = val;
          await this.plugin.writeVaultJson(SETTINGS_FILE_PATH, s);
        });
      });

    new Setting(containerEl)
      .setName("Auto protein target")
      .setDesc("Automatically set daily protein goal from your latest logged body weight.")
      .addToggle(toggle => {
        this.plugin.readVaultJson(NUTRITION_FILE_PATH, {}).then(n => toggle.setValue(!!n._settings?.autoProteinTarget));
        toggle.onChange(async (val) => {
          const n = await this.plugin.readVaultJson(NUTRITION_FILE_PATH, {});
          this.plugin.ensureNutritionSettings(n);
          n._settings.autoProteinTarget = val;
          await this.plugin.writeVaultJson(NUTRITION_FILE_PATH, n);
        });
      });

    new Setting(containerEl)
      .setName("Protein target (g per kg bodyweight)")
      .setDesc("Only used when auto protein target is enabled.")
      .addText(text => {
        this.plugin.readVaultJson(NUTRITION_FILE_PATH, {}).then(n => text.setValue(String(n._settings?.proteinPerKg ?? 2.0)));
        text.onChange(async (val) => {
          const num = parseFloat(val);
          if (isNaN(num)) return;
          const n = await this.plugin.readVaultJson(NUTRITION_FILE_PATH, {});
          this.plugin.ensureNutritionSettings(n);
          n._settings.proteinPerKg = num;
          await this.plugin.writeVaultJson(NUTRITION_FILE_PATH, n);
        });
      });

    containerEl.createEl("h3", { text: "Data" });

    new Setting(containerEl)
      .setName("Export workout history to CSV")
      .setDesc("Writes apps/scripts/soma-workout-export.csv")
      .addButton(btn => btn.setButtonText("Export").onClick(() => this.plugin.exportWorkoutHistoryCsv()));

    new Setting(containerEl)
      .setName("Export macro diary to CSV")
      .setDesc("Writes apps/scripts/soma-macros-export.csv")
      .addButton(btn => btn.setButtonText("Export").onClick(() => this.plugin.exportMacrosCsv()));

    new Setting(containerEl)
      .setName("Backup all data to JSON")
      .setDesc("Saves a single JSON snapshot of every SOMA data file, dated to today.")
      .addButton(btn => btn.setButtonText("Backup Now").onClick(() => this.plugin.backupAllData()));
  }
}