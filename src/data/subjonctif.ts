/* ============================================================
   COMPAGNON — Built-in cheat sheet: Le subjonctif présent
   Ported from the Claude Design prototype and enriched with the
   nuances the brief called out: the « espérer » trap, the
   présent-vs-passé note, and the two-radical explanation.
   Authoring a new sheet = writing another file like this one.
   See docs/CHEATSHEETS.md.
   ============================================================ */

import type { CheatSheet } from "@/lib/types";

export const SUBJONCTIF: CheatSheet = {
  id: "subjonctif-present",
  eyebrow: "Cheat sheet · Mood",
  // {{ }} marks the part rendered in the accent colour / italic.
  title: "Le subjonctif {{présent}}",
  intro:
    "The mood of doubt, desire, and necessity. Not a tense — a lens. Learn the triggers and the forms follow.",
  defaultTags: ["subjonctif", "grammar"],
  sections: [
    {
      kind: "formation",
      notes: [
        {
          kind: "recipe",
          title: "The core recipe",
          steps: [
            { text: "Take the ils form", ex: "ils parlent" },
            { text: "Drop -ent", ex: "parl-" },
            { text: "Add the endings", ex: "-e -es -e -ions -iez -ent" },
          ],
        },
        {
          kind: "endings",
          title: "Endings",
          rows: [
            ["que je", "-e"],
            ["que tu", "-es"],
            ["qu'il / elle", "-e"],
            ["que nous", "-ions"],
            ["que vous", "-iez"],
            ["qu'ils / elles", "-ent"],
          ],
        },
        {
          kind: "callout",
          title: "Remember this",
          body:
            "nous and vous often look exactly like the imperfect — que nous parlions, que vous parliez. That overlap is your friend: if you know the imperfect, you're halfway there.",
        },
        {
          kind: "callout",
          title: "Two-radical (boot) verbs",
          body:
            "Some verbs use one stem for je/tu/il/ils and a different one for nous/vous — the nous/vous forms keep the indicative stem. boire → que je boive but que nous buvions; venir → que je vienne but que nous venions; prendre → que je prenne but que nous prenions. Picture a boot around the four forms that change.",
        },
        {
          kind: "callout",
          title: "Présent vs passé du subjonctif",
          body:
            "Use the présent du subjonctif when the subordinate action happens at the same time as, or after, the main clause: Je doute qu'il vienne. Use the passé du subjonctif (avoir/être au subjonctif + participe passé) when it happened before: Je doute qu'il soit venu. Same triggers — only the timing changes the form.",
        },
        {
          kind: "trap",
          title: "The « espérer » trap",
          body:
            "Espérer feels like a wish, so learners reach for the subjonctif — but j'espère que takes the INDICATIF: j'espère qu'il vient (not vienne). Compare je souhaite que / je veux que, which DO trigger it. Likewise après que is logically indicatif (the action is real), even though avant que takes the subjonctif.",
        },
      ],
    },
    {
      kind: "conjugator",
      groups: [
        { id: "irregular", label: "Irregular", note: "Own subjunctive stem — memorise these." },
        { id: "two-stem", label: "Two-stem", note: "nous / vous keep the indicative stem." },
        { id: "regular", label: "Regular", note: "Drop -ent from ils, add endings." },
      ],
      verbs: [
        {
          id: "etre", inf: "être", gloss: "to be", group: "irregular",
          table: [["que je", "sois"], ["que tu", "sois"], ["qu'il / elle", "soit"], ["que nous", "soyons"], ["que vous", "soyez"], ["qu'ils / elles", "soient"]],
        },
        {
          id: "avoir", inf: "avoir", gloss: "to have", group: "irregular",
          table: [["que j'", "aie"], ["que tu", "aies"], ["qu'il / elle", "ait"], ["que nous", "ayons"], ["que vous", "ayez"], ["qu'ils / elles", "aient"]],
        },
        {
          id: "faire", inf: "faire", gloss: "to do / make", group: "irregular",
          table: [["que je", "fasse"], ["que tu", "fasses"], ["qu'il / elle", "fasse"], ["que nous", "fassions"], ["que vous", "fassiez"], ["qu'ils / elles", "fassent"]],
        },
        {
          id: "savoir", inf: "savoir", gloss: "to know", group: "irregular",
          table: [["que je", "sache"], ["que tu", "saches"], ["qu'il / elle", "sache"], ["que nous", "sachions"], ["que vous", "sachiez"], ["qu'ils / elles", "sachent"]],
        },
        {
          id: "aller", inf: "aller", gloss: "to go", group: "two-stem",
          table: [["que j'", "aille"], ["que tu", "ailles"], ["qu'il / elle", "aille"], ["que nous", "allions"], ["que vous", "alliez"], ["qu'ils / elles", "aillent"]],
        },
        {
          id: "prendre", inf: "prendre", gloss: "to take", group: "two-stem",
          table: [["que je", "prenne"], ["que tu", "prennes"], ["qu'il / elle", "prenne"], ["que nous", "prenions"], ["que vous", "preniez"], ["qu'ils / elles", "prennent"]],
        },
        {
          id: "venir", inf: "venir", gloss: "to come", group: "two-stem",
          table: [["que je", "vienne"], ["que tu", "viennes"], ["qu'il / elle", "vienne"], ["que nous", "venions"], ["que vous", "veniez"], ["qu'ils / elles", "viennent"]],
        },
        {
          id: "boire", inf: "boire", gloss: "to drink", group: "two-stem",
          table: [["que je", "boive"], ["que tu", "boives"], ["qu'il / elle", "boive"], ["que nous", "buvions"], ["que vous", "buviez"], ["qu'ils / elles", "boivent"]],
        },
        {
          id: "parler", inf: "parler", gloss: "to speak", group: "regular",
          table: [["que je", "parle"], ["que tu", "parles"], ["qu'il / elle", "parle"], ["que nous", "parlions"], ["que vous", "parliez"], ["qu'ils / elles", "parlent"]],
        },
        {
          id: "finir", inf: "finir", gloss: "to finish", group: "regular",
          table: [["que je", "finisse"], ["que tu", "finisses"], ["qu'il / elle", "finisse"], ["que nous", "finissions"], ["que vous", "finissiez"], ["qu'ils / elles", "finissent"]],
        },
      ],
    },
    {
      kind: "triggers",
      left: {
        title: "Takes the subjonctif",
        items: [
          { t: "il faut que", g: "it's necessary that" },
          { t: "bien que / quoique", g: "although" },
          { t: "avant que", g: "before" },
          { t: "pour que / afin que", g: "so that" },
          { t: "je veux / souhaite que", g: "I want / wish that" },
          { t: "à condition que", g: "provided that" },
          { t: "je ne pense pas que", g: "I don't think that" },
          { t: "il est possible que", g: "it's possible that" },
        ],
      },
      right: {
        title: "Stays in the indicatif",
        items: [
          { t: "je pense que", g: "I think that" },
          { t: "il est certain que", g: "it's certain that" },
          { t: "parce que", g: "because" },
          { t: "après que", g: "after" },
          { t: "peut-être que", g: "maybe" },
          { t: "j'espère que", g: "I hope that  ⚠ the trap" },
          { t: "il paraît que", g: "it appears that" },
          { t: "puisque", g: "since / given that" },
        ],
      },
      footnote:
        "The tell is the conjunction, not the meaning. Learn the left column by heart — and watch « espérer » and « après que », which sound like wishes but stay indicatif.",
    },
    {
      kind: "phrases",
      scenes: [
        {
          id: "hotel", scene: "Hôtel", icon: "home",
          phrases: [
            { fr: "Il faudrait que la chambre soit prête avant midi.", en: "The room would need to be ready before noon." },
            { fr: "Bien que ce soit complet, auriez-vous une annulation ?", en: "Although it's full, would you have a cancellation?" },
          ],
        },
        {
          id: "resto", scene: "Restaurant", icon: "volume",
          phrases: [
            { fr: "Je voudrais qu'on me recommande un plat régional.", en: "I'd like someone to recommend me a regional dish." },
            { fr: "Il vaut mieux que nous réservions pour deux.", en: "It's better that we book for two." },
          ],
        },
        {
          id: "gare", scene: "Gare", icon: "arrowRight",
          phrases: [
            { fr: "Pourvu que le train ne soit pas en retard !", en: "Let's hope the train isn't late!" },
            { fr: "Il faut que je sois à Lyon avant ce soir.", en: "I need to be in Lyon before tonight." },
          ],
        },
      ],
    },
    {
      kind: "quiz",
      items: [
        { prompt: "Il faut que tu ___ patient.", options: ["es", "sois", "seras"], answer: 1, why: "« il faut que » triggers the subjonctif → sois." },
        { prompt: "Je suis sûr qu'il ___ raison.", options: ["ait", "a", "aurait"], answer: 1, why: "Certainty stays indicatif → a." },
        { prompt: "Bien qu'elle ___ jeune, elle est sage.", options: ["soit", "est", "était"], answer: 0, why: "« bien que » always takes the subjonctif → soit." },
        { prompt: "J'espère qu'il ___ bientôt.", options: ["vienne", "vient", "soit venu"], answer: 1, why: "The trap: « espérer que » stays indicatif → vient." },
        { prompt: "Nous partirons après qu'il ___ arrivé.", options: ["soit", "sera", "est"], answer: 1, why: "« après que » is indicatif (the action is real) → sera." },
      ],
    },
  ],
};

export const BUILTIN_CHEATSHEETS: CheatSheet[] = [SUBJONCTIF];
