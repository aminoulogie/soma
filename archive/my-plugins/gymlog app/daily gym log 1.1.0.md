```dataviewjs
async function initUpgradedWorkoutLogger() {
// ============================================================================
// 1. DATA SOURCES & HISTORY LOADING
// ============================================================================
const dataFile = app.vault.getAbstractFileByPath("apps/scripts/soma-data.json");
const registryFile = app.vault.getAbstractFileByPath("apps/scripts/muscleRegistry.json");
const historyFilePath = "apps/scripts/soma-history.json";
const customExFilePath = "apps/scripts/custom-exercises.json";

if (!dataFile || !registryFile) {
    if (!dataFile) dv.paragraph("❌ `apps/scripts/soma-data.json` not found");
    if (!registryFile) dv.paragraph("❌ `apps/scripts/muscleRegistry.json` not found");
    return;
}

let history = {};
const hFile = app.vault.getAbstractFileByPath(historyFilePath);
if (hFile) {
  try { history = JSON.parse(await app.vault.read(hFile)); } catch (e) {}
}

let customExercises = [];
const cFile = app.vault.getAbstractFileByPath(customExFilePath);
if (cFile) {
  try { customExercises = JSON.parse(await app.vault.read(cFile)); } catch (e) {}
}

const baseExerciseDB = [
  // CHEST
  { name: "Incline Dumbbell Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Incline Barbell Bench", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Smith Machine Incline Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Low-to-High Cable Fly", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "High-to-Low Cable Fly", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Flat Barbell Bench Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Flat Dumbbell Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Decline Barbell/DB Bench", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "B-Tier", isAxial: false, isBW: false },
  { name: "Flat Dumbbell Flyes", muscle: "Chest", subTarget: "Mid Pec (Sternal)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "B-Tier", isAxial: false, isBW: false },
  { name: "Pec Deck Fly (Machine)", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bodyweight Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Weighted Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Machine Chest Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bodyweight Push-ups", muscle: "Chest", subTarget: "Mid Pec & Core", targetKeys: ["chest", "triceps"], position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Weighted Push-ups", muscle: "Chest", subTarget: "Mid Pec & Core", targetKeys: ["chest", "triceps"], position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },

  // BACK
  { name: "Bodyweight Pull-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back", "biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Bodyweight Chin-ups", muscle: "Back", subTarget: "Lats & Biceps", targetKeys: ["upper_back", "biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Weighted Pull-ups / Chin-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back", "biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bodyweight Inverted Rows", muscle: "Back", subTarget: "Upper Back / Rhomboids", targetKeys: ["upper_back", "trapezius_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Lat Pulldown (Wide/Neutral)", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Close-Grip / V-Bar Pulldown", muscle: "Back", subTarget: "Lats (Iliac / Lower)", targetKeys: ["upper_back", "biceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Single-Arm Lat Cable Row", muscle: "Back", subTarget: "Lats (Iliac / Lower)", targetKeys: ["upper_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Single-Arm Dumbbell Row", muscle: "Back", subTarget: "Lats & Upper Back", targetKeys: ["upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Straight-Arm Cable Pulldown", muscle: "Back", subTarget: "Lats (Isolation)", targetKeys: ["upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back / Rhomboids", targetKeys: ["trapezius_back", "upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Meadows Row", muscle: "Back", subTarget: "Upper Lats & Teres Major", targetKeys: ["upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Barbell Bent-Over Row", muscle: "Back", subTarget: "Upper Back / Lats", targetKeys: ["upper_back", "trapezius_back", "lower_back"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Seated Cable Row (Wide)", muscle: "Back", subTarget: "Upper Back / Mid-Traps", targetKeys: ["trapezius_back", "upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Barbell Deadlift", muscle: "Back", subTarget: "Erectors / Posterior Chain", targetKeys: ["lower_back", "hamstring", "gluteal"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Hyperextensions", muscle: "Back", subTarget: "Lower Back (Erectors)", targetKeys: ["lower_back", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Dumbbell Shrugs", muscle: "Back", subTarget: "Upper Traps", targetKeys: ["trapezius_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Barbell Shrugs", muscle: "Back", subTarget: "Upper Traps", targetKeys: ["trapezius_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },

  // SHOULDERS
  { name: "Standing Overhead Press (OHP)", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps", "triceps_back"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Machine Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Arnold Press (Dumbbell)", muscle: "Shoulders", subTarget: "Front / Lateral Delt", targetKeys: ["deltoids", "triceps"], position: "Mid-Range", risk: "Moderate 🟡", tier: "B-Tier", isAxial: false, isBW: false },
  { name: "Front Dumbbell / Cable Raise", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier", isAxial: false, isBW: false },
  { name: "Cable Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Cable Y-Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Dumbbell Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Machine Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Upright Row (Cable/Barbell)", muscle: "Shoulders", subTarget: "Side Delt & Upper Traps", targetKeys: ["deltoids", "trapezius_back"], position: "Shortened (Peak)", risk: "Moderate 🟡", tier: "B-Tier", isAxial: false, isBW: false },
  { name: "Face Pulls", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back", "trapezius_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Reverse Pec Deck", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Incline Rear Delt DB Flyes", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },

  // ARMS - BICEPS & FOREARMS
  { name: "Standing Barbell / EZ-Bar Curl", muscle: "Biceps", subTarget: "Overall Biceps", targetKeys: ["biceps"], position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Dumbbell Preacher Curl", muscle: "Biceps", subTarget: "Short Head (Inner)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "One-Arm Dumbbell Preacher Curl", muscle: "Biceps", subTarget: "Short Head (Inner / Unilateral)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Preacher Curl (Machine/EZ)", muscle: "Biceps", subTarget: "Short Head (Inner)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Incline Dumbbell Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bayesian Cable Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Spider Curl (Dumbbell/Barbell)", muscle: "Biceps", subTarget: "Short Head (Peak)", targetKeys: ["biceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Concentration Curl", muscle: "Biceps", subTarget: "Short Head (Peak)", targetKeys: ["biceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier", isAxial: false, isBW: false },
  { name: "Hammer Curl (Dumbbell/Cable)", muscle: "Biceps", subTarget: "Brachialis & Forearms", targetKeys: ["biceps"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Reverse Grip EZ-Bar Curl", muscle: "Biceps", subTarget: "Brachioradialis / Forearms", targetKeys: ["biceps"], position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Wrist Curls (Barbell/DB)", muscle: "Arms", subTarget: "Forearm Flexors", targetKeys: ["biceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier", isAxial: false, isBW: false },

  // ARMS - TRICEPS
  { name: "Close-Grip Barbell Bench", muscle: "Triceps", subTarget: "Medial & Lateral Head", targetKeys: ["triceps", "chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "EZ Bar Skullcrusher", muscle: "Triceps", subTarget: "Long & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Lying Barbell Tricep Extension (Skull Crusher)", muscle: "Triceps", subTarget: "Long & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Seated Dumbbell Tricep Extension", muscle: "Triceps", subTarget: "Long Head Triceps", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Standing Low Pulley Overhead Tricep Extension (Rope Extension)", muscle: "Triceps", subTarget: "Long Head (Lengthened)", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "High Pulley Overhead Tricep Extension", muscle: "Triceps", subTarget: "Long Head Triceps", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Overhead Dual Cable Extension", muscle: "Triceps", subTarget: "Long Head Triceps", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Single-Arm Katana Extension", muscle: "Triceps", subTarget: "Long Head Triceps", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Straight Bar Tricep Extension", muscle: "Triceps", subTarget: "Lateral & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Rope Tricep Extension", muscle: "Triceps", subTarget: "Lateral Head (Peak Flare)", targetKeys: ["triceps", "triceps_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Lateral & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Bodyweight Tricep Bench Dips", muscle: "Triceps", subTarget: "Medial & Lateral Head", targetKeys: ["triceps", "triceps_back"], position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Weighted Tricep Bench Dips", muscle: "Triceps", subTarget: "Medial & Lateral Head", targetKeys: ["triceps", "triceps_back"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },

  // LEGS & CALVES
  { name: "Bodyweight Squats (Air Squats)", muscle: "Legs", subTarget: "Quads & Glutes", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Bodyweight Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["gluteal", "quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Bodyweight Walking Lunges", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Bodyweight Standing Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Hack Squat", muscle: "Legs", subTarget: "Quads (Knee Extensors)", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Barbell Back Squat", muscle: "Legs", subTarget: "Quads & Glutes", targetKeys: ["quadriceps", "gluteal", "lower_back"], position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Barbell Front Squat", muscle: "Legs", subTarget: "Quads & Core", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier", isAxial: true, isBW: false },
  { name: "Goblet Squat (Dumbbell/KB)", muscle: "Legs", subTarget: "Quads & Adductors", targetKeys: ["quadriceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Leg Press", muscle: "Legs", subTarget: "Quads & Adductors", targetKeys: ["quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Leg Extensions", muscle: "Legs", subTarget: "Rectus Femoris", targetKeys: ["quadriceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Walking Dumbbell Lunges", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["gluteal", "quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Romanian Deadlift (DB/Barbell)", muscle: "Legs", subTarget: "Hamstrings (Lengthened)", targetKeys: ["hamstring", "gluteal", "lower_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", isAxial: true, isBW: false },
  { name: "Seated Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Knee Flexion)", targetKeys: ["hamstring"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Lying Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Shortened)", targetKeys: ["hamstring"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Barbell / Machine Hip Thrust", muscle: "Legs", subTarget: "Glutes (Maximus)", targetKeys: ["gluteal"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Machine Hip Abduction", muscle: "Legs", subTarget: "Gluteus Medius / Minimus", targetKeys: ["gluteal"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Machine Hip Adduction", muscle: "Legs", subTarget: "Adductor Magnus / Longus", targetKeys: ["adductors"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", isAxial: false, isBW: false },
  { name: "Standing Machine Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Leg Press Calf Press", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Seated Calf Raise Machine", muscle: "Legs", subTarget: "Calves (Soleus)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },

  // ABS & CORE
  { name: "Hanging Leg / Knee Raise", muscle: "Abs", subTarget: "Lower Rectus Abdominis", targetKeys: ["gluteal"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: true },
  { name: "Cable Kneeling Rope Crunch", muscle: "Abs", subTarget: "Upper Rectus Abdominis", targetKeys: ["gluteal"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", isAxial: false, isBW: false },
  { name: "Ab Wheel Rollout", muscle: "Abs", subTarget: "Core Stability / Anti-Extension", targetKeys: ["gluteal"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", isAxial: false, isBW: true },
  { name: "Decline Bench Crunch / Sit-up", muscle: "Abs", subTarget: "Rectus Abdominis", targetKeys: ["gluteal"], position: "Mid-Range", risk: "Low 🟢", tier: "B-Tier", isAxial: false, isBW: true }
];

const exerciseDB = [...baseExerciseDB, ...customExercises];

const routinePresets = {
  "Push (Chest/Delts/Triceps)": [
    { name: "Incline Dumbbell Press" },
    { name: "Flat Dumbbell Press" },
    { name: "Cable Lateral Raise" },
    { name: "Standing Low Pulley Overhead Tricep Extension (Rope Extension)" },
    { name: "Straight Bar Tricep Extension" }
  ],
  "Pull (Back/RearDelts/Biceps)": [
    { name: "Lat Pulldown (Wide/Neutral)" },
    { name: "Chest-Supported T-Bar Row" },
    { name: "Face Pulls" },
    { name: "One-Arm Dumbbell Preacher Curl" },
    { name: "Hammer Curl (Dumbbell/Cable)" }
  ],
  "Legs (Quads/Hams/Glutes/Calves)": [
    { name: "Hack Squat" },
    { name: "Romanian Deadlift (DB/Barbell)" },
    { name: "Leg Extensions" },
    { name: "Seated Leg Curl" },
    { name: "Standing Machine Calf Raise" },
    { name: "Seated Calf Raise Machine" }
  ],
  "Calisthenics / Bodyweight Push-Pull": [
    { name: "Bodyweight Pull-ups" },
    { name: "Bodyweight Chest Dips" },
    { name: "Bodyweight Inverted Rows" },
    { name: "Bodyweight Push-ups" },
    { name: "Hanging Leg / Knee Raise" }
  ],
  "Arms Hypertrophy Focus": [
    { name: "One-Arm Dumbbell Preacher Curl" },
    { name: "EZ Bar Skullcrusher" },
    { name: "Incline Dumbbell Curl" },
    { name: "High Pulley Overhead Tricep Extension" },
    { name: "Straight Bar Tricep Extension" },
    { name: "Hammer Curl (Dumbbell/Cable)" }
  ]
};

// Find last performance for automated progressive overload
function getLastPerformance(exerciseName) {
  let latestDate = 0;
  let topSet = null;

  for (const session of Object.values(history)) {
    if (session.exercises && (session.timestamp || 0) > latestDate) {
      const match = session.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (match && match.sets && match.sets.length > 0) {
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

// Calculate smart progression target
function calculateOverloadTarget(lastSet, isBW = false) {
  if (!lastSet) {
    return isBW 
      ? { weight: 0, reps: 10, note: "BW Baseline Start" } 
      : { weight: 20, reps: 10, note: "Baseline Start" };
  }
  const lastW = parseFloat(lastSet.weight) || 0;
  const lastR = parseInt(lastSet.reps) || (isBW ? 10 : 8);
  const lastF = parseInt(lastSet.failure) || 3;

  if (lastR >= 15 && isBW && lastW === 0 && lastF <= 3) {
    return { weight: 0, reps: lastR + 2, note: `+2 Reps Target (Hit ${lastR}r BW)` };
  } else if (lastR >= 12 && lastF <= 3) {
    const inc = isBW && lastW === 0 ? 2.5 : 2.5;
    return { weight: lastW + inc, reps: 8, note: `+2.5kg Load (Hit ${lastR}r)` };
  } else if (lastF <= 3) {
    return { weight: lastW, reps: lastR + 1, note: `+1 Rep Target (Last: ${lastR}r)` };
  } else {
    return { weight: lastW, reps: lastR, note: `Solidify Form (${lastW > 0 ? lastW + 'kg' : 'BW'})` };
  }
}

// ============================================================================
// 2. ROOT CONTAINER & UI STYLES
// ============================================================================
const trackerRoot = dv.el("div", "", { cls: "wk-daily-root" });

const style = document.createElement("style");
style.textContent = `
  .wk-daily-root { max-width: 680px; margin: 0 auto; font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); color: #f8fafc; }
  .wk-app { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; box-shadow: 0 16px 45px rgba(0,0,0,0.65); box-sizing: border-box; position: relative; width: 100%; }
  .wk-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }
  .wk-live-duration { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-variant-numeric: tabular-nums; }
  
  .wk-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
  .wk-stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px; text-align: center; }
  .wk-stat-lbl { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .wk-stat-val { font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 3px; }

  .wk-timer-radial-dock { display: flex; align-items: center; justify-content: space-between; background: #0c1e3d; border: 1px solid #1d4ed8; border-radius: 16px; padding: 10px 16px; margin-bottom: 14px; }
  .wk-timer-ring-box { position: relative; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; }
  .wk-timer-ring-svg { transform: rotate(-90deg); }
  .wk-timer-ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 4; }
  .wk-timer-ring-bar { fill: none; stroke: #38bdf8; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .wk-timer-ring-txt { position: absolute; font-size: 0.75rem; font-weight: 800; color: #ffffff; font-variant-numeric: tabular-nums; }
  .wk-timer-btn { background: #11264c; border: 1px solid #1e40af; color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
  .wk-timer-btn:hover { background: #1d4ed8; color: #ffffff; }

  .wk-action-row { display: flex; gap: 8px; margin-bottom: 14px; }
  .wk-btn { flex: 1; background: #0f172a; color: #ffffff; border: 1px solid #1e293b; border-radius: 10px; padding: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }
  .wk-btn:hover { background: #1e293b; border-color: #334155; }
  .wk-btn-custom { background: #1e1b4b; border-color: #4338ca; color: #c7d2fe; }
  .wk-btn-custom:hover { background: #312e81; color: #fff; }
  .wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }
  .wk-btn-save:hover { background: #047857; color: #ffffff; }

  .wk-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
  .wk-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .wk-card-title { font-weight: 800; font-size: 0.95rem; color: #ffffff; }
  .wk-tag-container { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
  .wk-tag { font-size: 0.63rem; font-weight: 700; padding: 2px 7px; border-radius: 5px; }
  .wk-tag-sub { background: #172554; color: #38bdf8; }
  .wk-tag-tier { background: #312e81; color: #c7d2fe; font-weight: 800; }
  .wk-tag-axial { background: rgba(239,68,68,0.18); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-weight: 800; }
  .wk-tag-bw { background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.4); color: #6ee7b7; font-weight: 800; }

  .wk-target-intel { background: rgba(56, 189, 248, 0.08); border: 1px dashed rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 6px 10px; font-size: 0.73rem; color: #38bdf8; font-weight: 700; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }

  .wk-set-row { display: grid; grid-template-columns: 24px 1fr 1fr 1fr 34px 22px; gap: 8px; align-items: center; margin-bottom: 7px; padding: 4px; border-radius: 8px; transition: all 0.25s ease; }
  .wk-th { font-size: 0.62rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: center; }
  .wk-input { background: #0f1c38; border: 1px solid #1e3a8a; border-radius: 8px; color: #38bdf8; font-weight: 700; padding: 6px 4px; text-align: center; font-size: 0.88rem; width: 100%; outline: none; box-sizing: border-box; height: 36px; }
  .wk-input.kg-clickable { cursor: pointer; }
  .wk-input:focus { border-color: #60a5fa; background: #172554; color: #ffffff; }
  .wk-check { width: 22px; height: 22px; accent-color: #3b82f6; cursor: pointer; margin: 0 auto; }
  .wk-set-row.row-done { background: rgba(16, 185, 129, 0.08); box-shadow: inset 0 0 0 1px rgba(16,185,129,0.25); }
  .wk-set-row.row-done .wk-input { border-color: #059669; color: #34d399; background: #062820; }
  .wk-set-row.row-done .wk-check { accent-color: #10b981; }
  .wk-btn-del { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.95rem; font-weight: 700; }
  .wk-btn-addset { width: 100%; background: rgba(56, 189, 248, 0.04); border: 1px dashed #1e3a8a; border-radius: 8px; color: #38bdf8; font-size: 0.75rem; font-weight: 700; padding: 7px; margin-top: 8px; cursor: pointer; }

  /* IN-APP EXERCISE CREATOR MODAL */
  .wk-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 2000; align-items: center; justify-content: center; }
  .wk-modal-box { background: #0b1324; border: 1px solid #3b82f6; border-radius: 16px; padding: 20px; width: 90%; max-width: 420px; box-shadow: 0 16px 45px rgba(0,0,0,0.9); }
  .wk-modal-title { font-size: 1.1rem; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
  .wk-field-lbl { font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 8px 0 4px 0; }
  .wk-modal-input { width: 100%; height: 38px; background: #070d19; border: 1px solid #1e3a8a; color: #fff; border-radius: 8px; padding: 6px 10px; font-weight: 700; font-size: 0.82rem; box-sizing: border-box; outline: none; }

  .wk-recap-screen { background: #070d19; border-radius: 20px; box-sizing: border-box; }
  .wk-recap-head { text-align: center; padding: 10px 0 18px 0; border-bottom: 1px solid #1e293b; margin-bottom: 16px; }
  .wk-recap-title { font-size: 1.4rem; font-weight: 800; color: #ffffff; margin: 6px 0 0 0; }
  .wk-recap-badge { background: #059669; color: #ffffff; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.08em; display: inline-block; }
  .wk-recap-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; }
  .wk-recap-set-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #94a3b8; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .wk-btn-new-session { width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; padding: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; margin-top: 14px; }
  .wk-btn-new-session:hover { background: #1d4ed8; }

  .wk-plate-modal { display: none; position: absolute; z-index: 1100; background: #0b1324; border: 1px solid #3b82f6; border-radius: 14px; padding: 14px; box-shadow: 0 12px 35px rgba(0,0,0,0.85); width: 260px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .wk-plate-bar-visual { display: flex; align-items: center; justify-content: center; height: 50px; background: #070d19; border-radius: 8px; margin: 10px 0; padding: 0 8px; border: 1px solid #1e293b; gap: 3px; }
  .wk-plate-sleeve { width: 14px; height: 10px; background: #94a3b8; border-radius: 2px; }
  .wk-plate-disc { border-radius: 3px; display: inline-block; }
  .wk-disc-25 { background: #ef4444; width: 8px; height: 38px; }
  .wk-disc-20 { background: #3b82f6; width: 8px; height: 34px; }
  .wk-disc-15 { background: #eab308; width: 7px; height: 30px; }
  .wk-disc-10 { background: #10b981; width: 7px; height: 26px; }
  .wk-disc-5  { background: #ffffff; width: 6px; height: 22px; }
  .wk-disc-25s{ background: #64748b; width: 5px; height: 18px; }
`;
trackerRoot.appendChild(style);

const trackerApp = trackerRoot.createDiv({ cls: "wk-app" });

// ============================================================================
// 3. ENGINE LOGIC & PERSISTENCE
// ============================================================================
let activeSplitCategory = "Push";
let sessionExercises = [];
let sessionStartTime = Date.now();
let timerInterval = null;
let timerSeconds = 90;
let timerTotal = 90;
let durationInterval = null;

const currentFilePath = dv.current().file.path;
const noteDateKey = dv.current().file.name;

async function saveWorkoutHistory(data) {
  history[noteDateKey] = data;
  let file = app.vault.getAbstractFileByPath(historyFilePath);
  if (!file) {
    await app.vault.create(historyFilePath, JSON.stringify(history, null, 2));
  } else {
    await app.vault.modify(file, JSON.stringify(history, null, 2));
  }
}

async function saveCustomExercise(ex) {
  customExercises.push(ex);
  exerciseDB.push(ex);
  let file = app.vault.getAbstractFileByPath(customExFilePath);
  if (!file) {
    await app.vault.create(customExFilePath, JSON.stringify(customExercises, null, 2));
  } else {
    await app.vault.modify(file, JSON.stringify(customExercises, null, 2));
  }
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

function calculateCaloriesBurned(minutes, totalVolumeKg, totalSets, avgIntensity) {
  const baseBurnPerMin = 6.0;
  const intensityMultiplier = 0.8 + (avgIntensity * 0.1);
  const volumeBonus = totalVolumeKg * 0.005;
  const estimatedCalories = (minutes * baseBurnPerMin * intensityMultiplier) + volumeBonus;
  return Math.max(15, Math.round(estimatedCalories));
}

function calculatePlates(targetWeight) {
  let perSide = (targetWeight - 20) / 2;
  if (perSide <= 0) return [];
  const plateTypes = [
    { weight: 25, cls: "wk-disc-25" },
    { weight: 20, cls: "wk-disc-20" },
    { weight: 15, cls: "wk-disc-15" },
    { weight: 10, cls: "wk-disc-10" },
    { weight: 5,  cls: "wk-disc-5" },
    { weight: 2.5,cls: "wk-disc-25s" }
  ];
  const plates = [];
  plateTypes.forEach(p => {
    while (perSide >= p.weight) {
      plates.push(p);
      perSide -= p.weight;
    }
  });
  return plates;
}

function renderFinishedScreen(data) {
  if (durationInterval) clearInterval(durationInterval);
  let cardsHtml = "";

  (data.exercises || []).forEach(ex => {
    let setsListHtml = "";
    (ex.sets || []).forEach((s, idx) => {
      const defaultKg = ex.isBW ? "0" : "80";
      const displayWeight = (s.weight !== undefined && s.weight !== "") ? s.weight : (s.done ? defaultKg : "0");
      const displayReps = (s.reps !== undefined && s.reps !== "") ? s.reps : (s.done ? "8" : "0");
      const failLevel = s.failure || "3";
      
      const weightLabel = ex.isBW 
        ? (parseFloat(displayWeight) > 0 ? `<b style="color:#38bdf8;">+${displayWeight} kg</b>` : `<b style="color:#6ee7b7;">Bodyweight</b>`)
        : `<b style="color:#38bdf8;">${displayWeight} kg</b>`;

      setsListHtml += `
        <div class="wk-recap-set-item">
          <span>Set ${idx + 1}: ${weightLabel} × <b style="color:#ffffff;">${displayReps} reps</b></span>
          <span style="color:${s.done ? '#34d399' : '#64748b'}; font-weight:700;">Lvl ${failLevel} ${s.done ? '✅' : '⏳'}</span>
        </div>
      `;
    });

    cardsHtml += `
      <div class="wk-recap-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:800; font-size:0.95rem; color:#ffffff;">${ex.name}</span>
          <span class="wk-tag wk-tag-sub">${ex.subTarget || ex.muscle}</span>
        </div>
        <div>${setsListHtml}</div>
      </div>
    `;
  });

  trackerApp.innerHTML = `
    <div class="wk-recap-screen">
      <div class="wk-recap-head">
        <span class="wk-recap-badge">Session Complete</span>
        <h2 class="wk-recap-title">Workout Summary & Analysis</h2>
        <div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Logged & Saved to vault note properties successfully.</div>
      </div>
      <div class="wk-stats-grid">
        <div class="wk-stat-box"><div class="wk-stat-lbl">Time</div><div class="wk-stat-val" style="color:#a7f3d0;">${data.durationFormatted}</div></div>
        <div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" style="color:#f59e0b;">${data.caloriesBurned} kcal</div></div>
        <div class="wk-stat-box"><div class="wk-stat-lbl">Volume (Added Load)</div><div class="wk-stat-val">${(data.totalVol || 0).toLocaleString()} kg</div></div>
        <div class="wk-stat-box"><div class="wk-stat-lbl">Sets Completed</div><div class="wk-stat-val">${data.totalSets}</div></div>
      </div>
      <div>${cardsHtml}</div>
      <button class="wk-btn-new-session" id="btn-start-new">🔄 Start / Edit Workout</button>
    </div>
  `;

  trackerApp.querySelector("#btn-start-new").onclick = () => {
    sessionExercises = [];
    sessionStartTime = Date.now();
    initActiveApp();
  };
}

function initActiveApp() {
  const splitOptionsHtml = Object.keys(routinePresets).map(r => `<option value="${r}">${r}</option>`).join("");

  trackerApp.innerHTML = `
    <div class="wk-topbar">
      <div>
        <span class="wk-badge">PRO Tracker 3.0</span>
        <h3 style="margin:4px 0 0 0; font-size:1.25rem; font-weight:800;">Live Workout Logger</h3>
      </div>
      <div class="wk-live-duration" id="live-session-time">⏱️ 00:00</div>
    </div>
    
    <div class="wk-stats-grid">
      <div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" id="stat-cals" style="color:#f59e0b;">0 kcal</div></div>
      <div class="wk-stat-box"><div class="wk-stat-lbl">Volume (kg)</div><div class="wk-stat-val" id="stat-vol">0</div></div>
      <div class="wk-stat-box"><div class="wk-stat-lbl">Sets Done</div><div class="wk-stat-val" id="stat-sets">0</div></div>
      <div class="wk-stat-box"><div class="wk-stat-lbl">Exercises</div><div class="wk-stat-val" id="stat-ex">0</div></div>
    </div>

    <div class="wk-timer-radial-dock">
      <div style="display:flex; align-items:center; gap:12px;">
        <div class="wk-timer-ring-box">
          <svg class="wk-timer-ring-svg" width="54" height="54">
            <circle class="wk-timer-ring-bg" cx="27" cy="27" r="22" />
            <circle class="wk-timer-ring-bar" id="timer-ring-circle" cx="27" cy="27" r="22" stroke-dasharray="138.23" stroke-dashoffset="0" />
          </svg>
          <div class="wk-timer-ring-txt" id="timer-val">90s</div>
        </div>
        <div>
          <div style="font-weight:800; font-size:0.85rem;">Rest Countdown</div>
          <div style="font-size:0.7rem; color:#94a3b8;">Automatic on set check</div>
        </div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="wk-timer-btn" id="t-60">+60s</button>
        <button class="wk-timer-btn" id="t-90">+90s</button>
        <button class="wk-timer-btn" id="t-reset" style="background:#ef4444; border-color:#ef4444;">Reset</button>
      </div>
    </div>
    
    <div class="wk-action-row">
      <button class="wk-btn" id="btn-routine">⚡ Load Split</button>
      <button class="wk-btn" id="btn-open-add">🔍 Add / Search</button>
      <button class="wk-btn wk-btn-custom" id="btn-create-custom">➕ Create Custom</button>
      <button class="wk-btn wk-btn-save" id="btn-save-note">💾 Save Log</button>
    </div>
    
    <div class="wk-selector-card" id="routine-selector" style="display:none; background:#0f172a; border:1px solid #2563eb; border-radius:14px; padding:14px; margin-bottom:14px;">
      <div style="font-weight:800; font-size:0.95rem; margin-bottom:10px;">Select Routine Split</div>
      <select class="wk-dropdown" id="split-select" style="width:100%; height:40px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:10px;">
        ${splitOptionsHtml}
      </select>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="wk-btn" id="btn-split-cancel" style="flex:none; padding:6px 14px;">Cancel</button>
        <button class="wk-btn" id="btn-split-load" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Load Split</button>
      </div>
    </div>
    
    <div class="wk-selector-card" id="add-selector" style="display:none; background:#0f172a; border:1px solid #2563eb; border-radius:14px; padding:14px; margin-bottom:14px;">
      <div style="font-weight:800; font-size:0.95rem; margin-bottom:8px;">Find & Add Exercise</div>
      <input type="text" class="wk-search-input" id="search-box" style="width:100%; height:38px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:8px; box-sizing:border-box;" placeholder="Search exercise, target..." />
      <div class="wk-search-results" id="search-list" style="max-height:190px; overflow-y:auto; border:1px solid #1e293b; border-radius:8px; background:#070d19; margin-bottom:10px;"></div>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="wk-btn" id="btn-ex-cancel" style="flex:none; padding:6px 14px;">Close</button>
      </div>
    </div>

    <!-- CUSTOM EXERCISE MODAL -->
    <div class="wk-modal-overlay" id="custom-ex-modal">
      <div class="wk-modal-box">
        <div class="wk-modal-title">✨ Create Custom Exercise</div>
        <div class="wk-field-lbl">Exercise Name</div>
        <input type="text" class="wk-modal-input" id="cust-name" placeholder="e.g. Incline Cable Press" />
        
        <div class="wk-field-lbl">Target Muscle Group</div>
        <select class="wk-modal-input" id="cust-muscle">
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

        <div class="wk-field-lbl">Sub-Target Head</div>
        <input type="text" class="wk-modal-input" id="cust-sub" placeholder="e.g. Clavicular Pec / Long Head" />

        <div class="wk-field-lbl">Resistance Curve Position</div>
        <select class="wk-modal-input" id="cust-pos">
          <option value="Lengthened (Stretch)">Lengthened (Stretch)</option>
          <option value="Mid-Range">Mid-Range</option>
          <option value="Shortened (Peak)">Shortened (Peak)</option>
        </select>

        <div class="wk-field-lbl" style="margin-top:10px;">Exercise Type</div>
        <label style="font-size:0.8rem; color:#cbd5e1; display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="cust-isbw" style="width:16px; height:16px;" /> Pure Bodyweight Movement (No Barbell Base)
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button class="wk-btn" id="btn-cust-cancel" style="flex:none; padding:6px 14px;">Cancel</button>
          <button class="wk-btn" id="btn-cust-save" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Add & Save</button>
        </div>
      </div>
    </div>

    <div class="wk-plate-modal" id="plate-popover">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:800; font-size:0.85rem; color:#38bdf8;">🏋️ Barbell Loading</span>
        <button class="wk-btn-del" id="btn-close-plate">✕</button>
      </div>
      <div id="plate-popover-text" style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Total Weight: 80 kg</div>
      <div class="wk-plate-bar-visual" id="plate-bar-render"></div>
      <div id="plate-breakdown-list" style="font-size:0.75rem; color:#cbd5e1; text-align:center;"></div>
    </div>
    
    <div id="cards-container"></div>
  `;

  const liveDurationEl = trackerApp.querySelector("#live-session-time");
  function updateLiveSessionTimer() {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    liveDurationEl.textContent = "⏱️ " + String(mins).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
  }

  if (durationInterval) clearInterval(durationInterval);
  updateLiveSessionTimer();
  durationInterval = setInterval(updateLiveSessionTimer, 1000);

  const cardsContainer = trackerApp.querySelector("#cards-container");
  const timerDisplay = trackerApp.querySelector("#timer-val");
  const timerRing = trackerApp.querySelector("#timer-ring-circle");
  const circumference = 2 * Math.PI * 22;

  function startRestTimer(seconds) {
    clearInterval(timerInterval);
    timerSeconds = seconds;
    timerTotal = seconds;
    updateTimerUI();

    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        playChime();
      }
      updateTimerUI();
    }, 1000);
  }

  function updateTimerUI() {
    timerDisplay.textContent = timerSeconds + "s";
    const progress = Math.max(0, timerSeconds / timerTotal);
    const offset = circumference - (progress * circumference);
    timerRing.style.strokeDashoffset = offset;
  }

  trackerApp.querySelector("#t-60").onclick = () => startRestTimer(60);
  trackerApp.querySelector("#t-90").onclick = () => startRestTimer(90);
  trackerApp.querySelector("#t-reset").onclick = () => {
    clearInterval(timerInterval);
    timerSeconds = 0;
    updateTimerUI();
  };

  // Custom modal controls
  const customModal = trackerApp.querySelector("#custom-ex-modal");
  trackerApp.querySelector("#btn-create-custom").onclick = () => { customModal.style.display = "flex"; };
  trackerApp.querySelector("#btn-cust-cancel").onclick = () => { customModal.style.display = "none"; };
  trackerApp.querySelector("#btn-cust-save").onclick = async () => {
    const name = trackerApp.querySelector("#cust-name").value.trim();
    const muscle = trackerApp.querySelector("#cust-muscle").value;
    const subTarget = trackerApp.querySelector("#cust-sub").value.trim() || muscle;
    const pos = trackerApp.querySelector("#cust-pos").value;
    const isBW = trackerApp.querySelector("#cust-isbw").checked;

    if (!name) return;
    const newEx = {
      name: name,
      muscle: muscle.toUpperCase(),
      subTarget: subTarget,
      targetKeys: [muscle],
      position: pos,
      risk: "Low 🟢",
      tier: "Custom",
      isAxial: false,
      isBW: isBW
    };

    await saveCustomExercise(newEx);
    addExerciseToSession(newEx.name);
    customModal.style.display = "none";
  };

  const addSelector = trackerApp.querySelector("#add-selector");
  const routineSelector = trackerApp.querySelector("#routine-selector");
  const searchBox = trackerApp.querySelector("#search-box");
  const searchList = trackerApp.querySelector("#search-list");

  function renderSearchList(query) {
    const q = (query || "").toLowerCase();
    const filtered = exerciseDB.filter(ex => 
      ex.name.toLowerCase().includes(q) ||
      ex.subTarget.toLowerCase().includes(q) ||
      ex.muscle.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      searchList.innerHTML = '<div style="padding:10px; color:#64748b; font-size:0.8rem; text-align:center;">No matching exercises found.</div>';
      return;
    }

    searchList.innerHTML = filtered.map(ex => `
      <div class="wk-search-item" data-name="${ex.name}" style="padding:8px 10px; border-bottom:1px solid #111827; cursor:pointer;">
        <div style="font-weight:700; color:#ffffff; font-size:0.82rem;">${ex.name}</div>
        <div style="font-size:0.7rem; color:#94a3b8; display:flex; gap:6px; margin-top:2px; flex-wrap:wrap;">
          ${ex.isBW ? '<span style="color:#6ee7b7; font-weight:800;">[Bodyweight]</span> • ' : ''}
          <span style="color:#38bdf8;">${ex.subTarget}</span> • 
          <span>${ex.position}</span> • 
          <span>${ex.tier}</span>
        </div>
      </div>
    `).join("");

    searchList.querySelectorAll(".wk-search-item").forEach(item => {
      item.onclick = () => {
        addExerciseToSession(item.dataset.name);
        addSelector.style.display = "none";
      };
    });
  }

  searchBox.oninput = () => renderSearchList(searchBox.value);

  trackerApp.querySelector("#btn-open-add").onclick = () => {
    routineSelector.style.display = "none";
    addSelector.style.display = "block";
    searchBox.value = "";
    renderSearchList("");
    searchBox.focus();
  };
  trackerApp.querySelector("#btn-ex-cancel").onclick = () => { addSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-routine").onclick = () => {
    addSelector.style.display = "none";
    routineSelector.style.display = "block";
  };
  trackerApp.querySelector("#btn-split-cancel").onclick = () => { routineSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-split-load").onclick = () => {
    const selected = trackerApp.querySelector("#split-select").value;
    if (selected.includes("Push")) activeSplitCategory = "Push";
    else if (selected.includes("Pull")) activeSplitCategory = "Pull";
    else if (selected.includes("Legs")) activeSplitCategory = "Legs";
    else activeSplitCategory = selected;

    const list = routinePresets[selected] || [];
    sessionExercises = list.map(item => {
      const data = exerciseDB.find(e => e.name === item.name) || {};
      const isBW = !!data.isBW;
      const last = getLastPerformance(item.name);
      const target = calculateOverloadTarget(last, isBW);

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
        overloadTarget: target,
        sets: [
          { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: "", done: false },
          { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: "", done: false },
          { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: Math.max(6, target.reps - 1), failure: "", done: false }
        ]
      };
    });
    routineSelector.style.display = "none";
    renderTracker();
  };

  function addExerciseToSession(name) {
    const data = exerciseDB.find(e => e.name === name) || { name: name, muscle: "Custom", targetKeys: [] };
    const isBW = !!data.isBW;
    const last = getLastPerformance(data.name);
    const target = calculateOverloadTarget(last, isBW);

    sessionExercises.push({
      name: data.name,
      muscle: data.muscle,
      subTarget: data.subTarget || "",
      targetKeys: data.targetKeys || [],
      position: data.position || "",
      risk: data.risk || "Low 🟢",
      tier: data.tier || "A-Tier",
      isAxial: !!data.isAxial,
      isBW: isBW,
      overloadTarget: target,
      sets: [
        { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: "", done: false },
        { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: target.reps, failure: "", done: false },
        { weight: target.weight > 0 ? target.weight : (isBW ? 0 : ""), reps: Math.max(6, target.reps - 1), failure: "", done: false }
      ]
    });
    renderTracker();
  }

  function updateStats() {
    let totalVol = 0;
    let totalSets = 0;
    let sumIntensity = 0;

    sessionExercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.done) {
          totalSets++;
          const defaultW = ex.isBW ? 0 : 80;
          const w = parseFloat(s.weight) >= 0 ? parseFloat(s.weight) : defaultW;
          const r = parseFloat(s.reps) || 8;
          totalVol += (w * r);
          sumIntensity += (parseFloat(s.failure) || 3);
        }
      });
    });

    const elapsedMins = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
    const cals = calculateCaloriesBurned(elapsedMins, totalVol, totalSets, avgIntensity);

    trackerApp.querySelector("#stat-cals").textContent = `${cals} kcal`;
    trackerApp.querySelector("#stat-vol").textContent = totalVol.toLocaleString();
    trackerApp.querySelector("#stat-sets").textContent = String(totalSets);
    trackerApp.querySelector("#stat-ex").textContent = String(sessionExercises.length);
  }

  const plateModal = trackerApp.querySelector("#plate-popover");
  const plateRender = trackerApp.querySelector("#plate-bar-render");
  const plateList = trackerApp.querySelector("#plate-breakdown-list");
  const plateText = trackerApp.querySelector("#plate-popover-text");

  trackerApp.querySelector("#btn-close-plate").onclick = () => { plateModal.style.display = "none"; };

  function showPlateCalculator(weight) {
    const w = parseFloat(weight) || 80;
    if (w < 20) {
      plateText.textContent = `Added Dumbbell/Belt Load: ${w} kg`;
      plateRender.innerHTML = `<span style="font-size:0.75rem; color:#94a3b8;">No 20kg Olympic Bar stack needed</span>`;
      plateList.innerHTML = `Loaded with: <b>${w} kg</b> added weight`;
      plateModal.style.display = "block";
      return;
    }

    plateText.textContent = `Bar: 20kg • Per Side: ${Math.max(0, ((w - 20) / 2)).toFixed(1)} kg`;
    const plates = calculatePlates(w);

    let discsHtml = '<div class="wk-plate-sleeve"></div>';
    plates.forEach(p => {
      discsHtml += `<div class="wk-plate-disc ${p.cls}"></div>`;
    });
    plateRender.innerHTML = discsHtml;
    
    if (plates.length > 0) {
      plateList.innerHTML = `Stack per side: <b>${plates.map(p => p.weight + "kg").join(" + ")}</b>`;
    } else {
      plateList.innerHTML = "Olympic Bar Only (20 kg)";
    }
    plateModal.style.display = "block";
  }

  function renderTracker() {
    cardsContainer.innerHTML = "";

    sessionExercises.forEach((ex, exIdx) => {
      const card = document.createElement("div");
      card.className = "wk-card";

      const targetWeightTxt = ex.isBW && ex.overloadTarget.weight === 0 ? "Bodyweight" : `${ex.overloadTarget.weight} kg`;
      const targetInfo = ex.overloadTarget ? `
        <div class="wk-target-intel">
          <span>🎯 Target: ${targetWeightTxt} × ${ex.overloadTarget.reps} reps</span>
          <span style="font-size:0.68rem; color:#94a3b8;">${ex.overloadTarget.note}</span>
        </div>
      ` : '';

      const tagsHtml = `
        <div class="wk-tag-container">
          ${ex.isBW ? `<span class="wk-tag wk-tag-bw">🧍 Bodyweight</span>` : ''}
          ${ex.subTarget ? `<span class="wk-tag wk-tag-sub">${ex.subTarget}</span>` : ''}
          ${ex.tier ? `<span class="wk-tag wk-tag-tier">${ex.tier}</span>` : ''}
          ${ex.isAxial ? `<span class="wk-tag wk-tag-axial">⚡ Axial Load (CNS)</span>` : ''}
        </div>
      `;

      let rowsHtml = `
        <div class="wk-set-row">
          <div class="wk-th">SET</div>
          <div class="wk-th">${ex.isBW ? '+KG' : 'KG'}</div>
          <div class="wk-th">REPS</div>
          <div class="wk-th">FAIL</div>
          <div class="wk-th">DONE</div>
          <div></div>
        </div>
      `;

      ex.sets.forEach((s, sIdx) => {
        const placeholderKg = ex.isBW ? "0" : "80";
        const tooltipTxt = ex.isBW ? "Added weight load (0 = pure bodyweight)" : "Double-click for plates breakdown";

        rowsHtml += `
          <div class="wk-set-row ${s.done ? 'row-done' : ''}">
            <div style="font-size:0.75rem; text-align:center; color:#64748b; font-weight:800;">${sIdx + 1}</div>
            <input type="number" class="wk-input kg-clickable set-weight" data-ex="${exIdx}" data-set="${sIdx}" value="${s.weight}" placeholder="${placeholderKg}" title="${tooltipTxt}" />
            <input type="number" class="wk-input set-reps" data-ex="${exIdx}" data-set="${sIdx}" value="${s.reps}" placeholder="8" />
            <input type="number" min="1" max="5" class="wk-input set-fail" data-ex="${exIdx}" data-set="${sIdx}" value="${s.failure}" placeholder="1-5" />
            <input type="checkbox" class="wk-check set-done" data-ex="${exIdx}" data-set="${sIdx}" ${s.done ? "checked" : ""} />
            <button class="wk-btn-del btn-del-set" data-ex="${exIdx}" data-set="${sIdx}">✕</button>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="wk-card-top">
          <span class="wk-card-title">${exIdx + 1}. ${ex.name}</span>
          <button class="wk-btn-del btn-del-card" data-ex="${exIdx}">✕</button>
        </div>
        ${tagsHtml}
        ${targetInfo}
        ${rowsHtml}
        <button class="wk-btn-addset btn-add-set" data-ex="${exIdx}">+ Add Set</button>
      `;

      cardsContainer.appendChild(card);
    });

    updateStats();
    attachTrackerEvents();
  }

  function attachTrackerEvents() {
    trackerApp.querySelectorAll(".set-weight").forEach(inp => {
      inp.oninput = (e) => {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].weight = e.target.value;
        updateStats();
      };
      inp.ondblclick = (e) => {
        const ex = sessionExercises[e.target.dataset.ex];
        const val = e.target.value || (ex.isBW ? 0 : 80);
        showPlateCalculator(val);
      };
    });

    trackerApp.querySelectorAll(".set-reps").forEach(inp => {
      inp.oninput = (e) => {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].reps = e.target.value;
        updateStats();
      };
    });

    trackerApp.querySelectorAll(".set-fail").forEach(inp => {
      inp.oninput = (e) => {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].failure = e.target.value;
      };
    });

    trackerApp.querySelectorAll(".set-done").forEach(chk => {
      chk.onchange = (e) => {
        const isDone = e.target.checked;
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].done = isDone;
        const row = e.target.closest('.wk-set-row');
        if (row) {
          if (isDone) row.classList.add('row-done');
          else row.classList.remove('row-done');
        }
        if (isDone) startRestTimer(90);
        updateStats();
      };
    });

    trackerApp.querySelectorAll(".btn-del-set").forEach(btn => {
      btn.onclick = () => {
        sessionExercises[btn.dataset.ex].sets.splice(btn.dataset.set, 1);
        renderTracker();
      };
    });

    trackerApp.querySelectorAll(".btn-add-set").forEach(btn => {
      btn.onclick = () => {
        const ex = sessionExercises[btn.dataset.ex];
        sessionExercises[btn.dataset.ex].sets.push({ weight: ex.isBW ? 0 : "", reps: "", failure: "", done: false });
        renderTracker();
      };
    });

    trackerApp.querySelectorAll(".btn-del-card").forEach(btn => {
      btn.onclick = () => {
        sessionExercises.splice(btn.dataset.ex, 1);
        renderTracker();
      };
    });
  }

  trackerApp.querySelector("#btn-save-note").onclick = async () => {
    let totalVol = 0;
    let totalSets = 0;
    let sumIntensity = 0;
    let axialVolume = 0;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const durationFormatted = `${mins}m ${secs}s`;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const muscleHits = {};
    sessionExercises.forEach(ex => {
      const doneSets = ex.sets.filter(s => s.done);
      if (doneSets.length > 0 && ex.targetKeys) {
        const avgFail = doneSets.reduce((acc, s) => acc + (parseFloat(s.failure) || 3), 0) / doneSets.length;
        ex.targetKeys.forEach(k => {
          if (!muscleHits[k]) muscleHits[k] = { sets: 0, sumFail: 0, count: 0 };
          muscleHits[k].sets += doneSets.length;
          muscleHits[k].sumFail += (avgFail * doneSets.length);
          muscleHits[k].count += doneSets.length;
        });
      }
      ex.sets.forEach(s => {
        const defaultW = ex.isBW ? 0 : 80;
        const w = (s.weight !== undefined && s.weight !== "") ? (parseFloat(s.weight) || 0) : (s.done ? defaultW : 0);
        const r = parseFloat(s.reps) || (s.done ? 8 : 0);
        const failVal = s.failure || "3";
        if (s.done) {
          totalSets++;
          totalVol += (w * r);
          if (ex.isAxial) axialVolume += (w * r);
          sumIntensity += (parseFloat(failVal) || 3);
        }
      });
    });

    const finalMuscles = {};
    for (const k in muscleHits) {
      finalMuscles[k] = {
        sets: muscleHits[k].sets,
        avgFail: Math.round((muscleHits[k].sumFail / muscleHits[k].count) * 10) / 10
      };
    }

    const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
    const caloriesBurned = calculateCaloriesBurned(elapsedMinutes, totalVol, totalSets, avgIntensity);

    const recapData = {
      timestamp: Date.now(),
      dateStr: new Date().toISOString(),
      split: activeSplitCategory,
      durationFormatted: durationFormatted,
      caloriesBurned: caloriesBurned,
      totalVol: totalVol,
      axialVol: axialVolume,
      totalSets: totalSets,
      muscles: finalMuscles,
      exercises: sessionExercises
    };

    await saveWorkoutHistory(recapData);

    const currentFile = app.vault.getAbstractFileByPath(currentFilePath);
    if (currentFile) {
      await app.fileManager.processFrontMatter(currentFile, fm => {
        delete fm["soma_workout"];
        fm["workout_split"] = activeSplitCategory;
        fm["workout_volume"] = totalVol;
        fm["workout_sets"] = totalSets;
        fm["workout_calories"] = caloriesBurned;
      });
    }

    renderFinishedScreen(recapData);
  };
}

if (history && history[noteDateKey]) {
  renderFinishedScreen(history[noteDateKey]);
} else {
  initActiveApp();
}
}
initUpgradedWorkoutLogger();