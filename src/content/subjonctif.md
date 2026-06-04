---
id: subjonctif-present
eyebrow: Guide · Mood
title: Le subjonctif {{présent}}
intro: Le mode du cœur, du doute et du désir. Not a tense — a lens. Learn the triggers and the forms follow.
tags: [subjonctif, grammar]
level: A2 → B1
---

## Formation

Prends le radical de la 3ᵉ personne du pluriel (*ils*) au présent, jette la terminaison
`-ent`, et ajoute les terminaisons :

| pronom | terminaison |
| --- | --- |
| que je | **-e** |
| que tu | **-es** |
| qu'il / elle | **-e** |
| que nous | **-ions** |
| que vous | **-iez** |
| qu'ils / elles | **-ent** |

So: *ils parl**ent*** → `parl-` → *que je parle, que nous parlions, qu'ils parlent.*

:::note Le raccourci — verbes en -ER
For `-er` verbs the subjunctive is **identical to the present**… except *nous* and *vous*,
which take `-ions` / `-iez` (just like the imperfect). *présent: nous parlons → subj: que nous
parl**ions***. C'est presque gratuit.
:::

:::note Deux radicaux (le pied du verbe change)
Some verbs keep the *nous/vous* present stem for *nous/vous* in the subjunctive — the "boot"
changes in the middle. *BOIRE* — qu'il **boive** mais que nous **buvions**. Same pattern: *prendre,
venir, devoir, recevoir, voir, croire.*
:::

:::trap Le piège classique — espérer
*Espérer* expresses a wish, so learners reach for the subjunctive — but **j'espère que** takes the
**indicatif**: *« J'espère qu'il **fera** beau »*, not *fasse*. Compare *souhaiter* / *vouloir*,
which **do** trigger it. Likewise *après que* is logically indicatif (the action is real), even
though *avant que* takes the subjunctive. Va comprendre.
:::

:::note Présent vs passé du subjonctif
Use the **présent** when the action is simultaneous or later (*« qu'il **soit** là »*). Use the
**passé** (avoir/être au subjonctif + participe passé) when it already happened (*« je regrette
qu'il **soit parti** »*, *« contente qu'il **ait trouvé** un emploi »*). Same triggers — only the
timing changes the form.
:::

## Conjugueur

Choisis un verbe. Les irréguliers sont à savoir par cœur ; les "deux radicaux" changent le pied
pour *nous/vous* ; les réguliers suivent le radical de *ils* + terminaisons.

```conjugator
{
  "groups": [
    { "id": "irr", "label": "Les grands irréguliers", "note": "Radical propre — à mémoriser." },
    { "id": "two", "label": "Deux radicaux", "note": "Le pied change pour nous / vous." },
    { "id": "reg", "label": "Réguliers", "note": "Radical de « ils » + terminaisons." }
  ],
  "verbs": [
    { "inf": "être", "gloss": "to be", "group": "irr", "tag": "irrégulier", "note": "Irrégulier total. Le verbe le plus fréquent au subjonctif — à savoir par cœur.", "forms": ["sois","sois","soit","soyons","soyez","soient"] },
    { "inf": "avoir", "gloss": "to have", "group": "irr", "tag": "irrégulier", "note": "Sert aussi à former le subjonctif passé : « qu'il ait fini ».", "forms": ["aie","aies","ait","ayons","ayez","aient"] },
    { "inf": "aller", "gloss": "to go", "group": "irr", "tag": "2 radicaux", "note": "Deux radicaux : aill- mais nous allions / vous alliez.", "forms": ["aille","ailles","aille","allions","alliez","aillent"] },
    { "inf": "faire", "gloss": "to do / make", "group": "irr", "tag": "radical fass-", "note": "Un seul radical fass- partout. Facile une fois mémorisé.", "forms": ["fasse","fasses","fasse","fassions","fassiez","fassent"] },
    { "inf": "pouvoir", "gloss": "to be able", "group": "irr", "tag": "radical puiss-", "note": "Radical puiss- partout. « Pensez-vous qu'on puisse… »", "forms": ["puisse","puisses","puisse","puissions","puissiez","puissent"] },
    { "inf": "savoir", "gloss": "to know", "group": "irr", "tag": "radical sach-", "note": "Radical sach- partout.", "forms": ["sache","saches","sache","sachions","sachiez","sachent"] },
    { "inf": "vouloir", "gloss": "to want", "group": "irr", "tag": "2 radicaux", "note": "Deux radicaux : veuill- mais nous voulions / vous vouliez.", "forms": ["veuille","veuilles","veuille","voulions","vouliez","veuillent"] },
    { "inf": "falloir", "gloss": "to be necessary", "group": "irr", "tag": "impersonnel", "note": "Impersonnel : seulement « qu'il faille ». « Bien qu'il faille partir tôt… »", "forms": ["—","—","faille","—","—","—"] },
    { "inf": "pleuvoir", "gloss": "to rain", "group": "irr", "tag": "impersonnel", "note": "Impersonnel : « qu'il pleuve ». « J'ai peur qu'il pleuve ce week-end. »", "forms": ["—","—","pleuve","—","—","—"] },

    { "inf": "prendre", "gloss": "to take", "group": "two", "tag": "2 radicaux", "note": "prenn- mais nous prenions / vous preniez. Idem : apprendre, comprendre.", "forms": ["prenne","prennes","prenne","prenions","preniez","prennent"] },
    { "inf": "venir", "gloss": "to come", "group": "two", "tag": "2 radicaux", "note": "vienn- mais nous venions / vous veniez. Idem : tenir, devenir, revenir.", "forms": ["vienne","viennes","vienne","venions","veniez","viennent"] },
    { "inf": "boire", "gloss": "to drink", "group": "two", "tag": "2 radicaux", "note": "boiv- mais nous buvions / vous buviez.", "forms": ["boive","boives","boive","buvions","buviez","boivent"] },
    { "inf": "devoir", "gloss": "to have to", "group": "two", "tag": "2 radicaux", "note": "doiv- mais nous devions / vous deviez.", "forms": ["doive","doives","doive","devions","deviez","doivent"] },
    { "inf": "recevoir", "gloss": "to receive", "group": "two", "tag": "2 radicaux", "note": "reçoiv- (ç !) mais nous recevions / vous receviez.", "forms": ["reçoive","reçoives","reçoive","recevions","receviez","reçoivent"] },
    { "inf": "voir", "gloss": "to see", "group": "two", "tag": "2 radicaux", "note": "voi- mais nous voyions / vous voyiez (le -y- revient).", "forms": ["voie","voies","voie","voyions","voyiez","voient"] },
    { "inf": "croire", "gloss": "to believe", "group": "two", "tag": "2 radicaux", "note": "croi- mais nous croyions / vous croyiez.", "forms": ["croie","croies","croie","croyions","croyiez","croient"] },
    { "inf": "acheter", "gloss": "to buy", "group": "two", "tag": "accent change", "note": "achèt- (è) mais nous achetions / vous achetiez. Idem : jeter (jett-).", "forms": ["achète","achètes","achète","achetions","achetiez","achètent"] },

    { "inf": "parler", "gloss": "to speak", "group": "reg", "tag": "-er régulier", "note": "Régulier -er : comme le présent, sauf nous/vous en -ions/-iez.", "forms": ["parle","parles","parle","parlions","parliez","parlent"] },
    { "inf": "manger", "gloss": "to eat", "group": "reg", "tag": "-ger", "note": "Comme parler. Le -e du radical disparaît devant -ions/-iez.", "forms": ["mange","manges","mange","mangions","mangiez","mangent"] },
    { "inf": "finir", "gloss": "to finish", "group": "reg", "tag": "-ir (finiss-)", "note": "Radical finiss- (ils finissent). Idem : choisir, réussir, réfléchir.", "forms": ["finisse","finisses","finisse","finissions","finissiez","finissent"] },
    { "inf": "partir", "gloss": "to leave", "group": "reg", "tag": "-ir (part-)", "note": "Radical part- (ils partent). Idem : sortir, dormir, sentir, servir.", "forms": ["parte","partes","parte","partions","partiez","partent"] },
    { "inf": "mettre", "gloss": "to put", "group": "reg", "tag": "régulier", "note": "Radical mett- (ils mettent). Idem : permettre, promettre.", "forms": ["mette","mettes","mette","mettions","mettiez","mettent"] },
    { "inf": "écrire", "gloss": "to write", "group": "reg", "tag": "régulier", "note": "Radical écriv- (ils écrivent). Idem : décrire, inscrire.", "forms": ["écrive","écrives","écrive","écrivions","écriviez","écrivent"] },
    { "inf": "lire", "gloss": "to read", "group": "reg", "tag": "régulier", "note": "Radical lis- (ils lisent).", "forms": ["lise","lises","lise","lisions","lisiez","lisent"] },
    { "inf": "dire", "gloss": "to say", "group": "reg", "tag": "régulier", "note": "Radical dis- (ils disent).", "forms": ["dise","dises","dise","disions","disiez","disent"] },
    { "inf": "attendre", "gloss": "to wait", "group": "reg", "tag": "-dre", "note": "Radical attend- (ils attendent). Idem : répondre, entendre, vendre, perdre.", "forms": ["attende","attendes","attende","attendions","attendiez","attendent"] },
    { "inf": "connaître", "gloss": "to know", "group": "reg", "tag": "régulier", "note": "Radical connaiss- (ils connaissent).", "forms": ["connaisse","connaisses","connaisse","connaissions","connaissiez","connaissent"] }
  ]
}
```

## Déclencheurs

Le grand partage : verbes **« du cœur »** (désir, sentiment, doute, volonté) → subjonctif.
Verbes **« de la tête »** (constat, certitude, parole) → indicatif. The tell is the conjunction,
not the meaning.

```triggers
{
  "left": {
    "title": "→ Subjonctif (du cœur)",
    "items": [
      { "t": "il faut que", "g": "obligation" },
      { "t": "il vaut mieux que", "g": "il vaudrait mieux que" },
      { "t": "il est important / dommage que", "g": "jugement" },
      { "t": "je veux / j'aimerais que", "g": "désir" },
      { "t": "je souhaite que", "g": "désir" },
      { "t": "j'ai peur / je crains que", "g": "+ « ne » stylistique" },
      { "t": "je regrette que", "g": "sentiment" },
      { "t": "je ne pense / crois pas que", "g": "négatif !" },
      { "t": "pensez-vous que… ?", "g": "inversion" },
      { "t": "bien que / quoique", "g": "concession" }
    ]
  },
  "right": {
    "title": "→ Indicatif (de la tête)",
    "items": [
      { "t": "je pense / crois que", "g": "affirmatif" },
      { "t": "je sais / constate que", "g": "constat" },
      { "t": "je suppose / j'imagine que", "g": "" },
      { "t": "j'affirme / je déclare que", "g": "parole" },
      { "t": "il est évident / certain / clair que", "g": "certitude" },
      { "t": "il est probable que", "g": "+50% → indicatif" },
      { "t": "j'espère que", "g": "le grand piège !" },
      { "t": "après que", "g": "l'action est réelle" }
    ]
  },
  "footnote": "Learn the left column by heart — and watch « espérer » and « après que », which sound like wishes but stay indicatif."
}
```

## En voyage

À sortir à l'hôtel, au resto, à la gare. Send any of these straight to your flashcards.

```phrases
{
  "scenes": [
    { "scene": "À l'hôtel / poliment", "id": "hotel", "icon": "home", "phrases": [
      { "fr": "Il faudrait que vous me changiez de chambre, s'il vous plaît.", "en": "You'd need to change my room, please." },
      { "fr": "J'aimerais qu'il y ait un peu plus de calme.", "en": "I'd like there to be a bit more quiet." }
    ]},
    { "scene": "Au restaurant", "id": "resto", "icon": "volume", "phrases": [
      { "fr": "Je ne pense pas que ce soit ce que j'ai commandé.", "en": "I don't think this is what I ordered." },
      { "fr": "Il vaudrait mieux que je prenne quelque chose de léger.", "en": "It'd be better if I had something light." }
    ]},
    { "scene": "À la gare / problème de train", "id": "gare", "icon": "arrowRight", "phrases": [
      { "fr": "Il faut que je sois à Luxembourg avant midi.", "en": "I need to be in Luxembourg before noon." },
      { "fr": "Est-il possible qu'il y ait une grève aujourd'hui ?", "en": "Is it possible there's a strike today?" },
      { "fr": "Pensez-vous qu'on puisse encore avoir une correspondance ?", "en": "Do you think we can still get a connection?" }
    ]},
    { "scene": "Conversation / au concert", "id": "concert", "icon": "spark", "phrases": [
      { "fr": "Je trouve dommage que la salle soit si pleine.", "en": "I think it's a shame the hall is so full." },
      { "fr": "J'espère que le concert vous plaira.", "en": "I hope you'll enjoy the concert. (indicatif — espérer !)" }
    ]}
  ]
}
```

## Quiz

Subjonctif, indicatif… ou piège ?

```quiz
[
  { "prompt": "Il faut que je ___ tôt demain.", "options": ["parte","pars","partirai"], "answer": 0, "why": "« Il faut que » → subjonctif. Partir : que je parte." },
  { "prompt": "J'espère qu'il ___ beau.", "options": ["fasse","fera","fait"], "answer": 1, "why": "Piège ! Espérer → INDICATIF (futur ici) : « fera »." },
  { "prompt": "Je ne pense pas qu'elle ___ raison.", "options": ["a","ait","aura"], "answer": 1, "why": "Penser au négatif → subjonctif. Avoir : qu'elle ait." },
  { "prompt": "Il est évident qu'il ___ fatigué.", "options": ["soit","est","sois"], "answer": 1, "why": "Certitude (« il est évident ») → indicatif : « est »." },
  { "prompt": "J'aimerais que vous ___ avec nous.", "options": ["venez","veniez","viendrez"], "answer": 1, "why": "Désir → subjonctif. Venir, vous : que vous veniez." },
  { "prompt": "Il vaudrait mieux que tu ___ un taxi.", "options": ["prends","prennes","prendras"], "answer": 1, "why": "« Il vaudrait mieux que » → subjonctif. Prendre, tu : prennes." },
  { "prompt": "Je suis contente que tu ___ là.", "options": ["es","sois","seras"], "answer": 1, "why": "Sentiment → subjonctif. Être : que tu sois." },
  { "prompt": "Pensez-vous qu'on ___ entrer sans réserver ?", "options": ["peut","puisse","pourra"], "answer": 1, "why": "Question avec inversion → souvent subjonctif. Pouvoir : puisse." }
]
```
