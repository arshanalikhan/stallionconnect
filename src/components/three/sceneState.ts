/** Values the page writes on scroll / mouse move and the 3D scene reads every frame. */
export type SceneState = {
  /** Whole-page scroll progress, 0 at the top and 1 at the bottom. */
  page: number;
  /** Hero scroll progress, 0 at the top and 1 once the hero has scrolled away. */
  hero: number;
  /** 0 by day, 1 while the dark "Why us" section fills the screen. */
  night: number;
  /** Page-progress range covered by the "How we work" section; the gates sit here. */
  gates: [number, number];
  /**
   * Position between sections: 2.4 means 40% of the way from the third section
   * (index 2) to the fourth, measured by section centres crossing mid-screen.
   */
  sec: number;
  /** Mouse position, -1 to 1 on each axis. */
  mx: number;
  my: number;
  /** Viewport size in CSS pixels. */
  vw: number;
  vh: number;
};

export const initialSceneState = (): SceneState => ({
  page: 0,
  hero: 0,
  night: 0,
  gates: [0.4, 0.55],
  sec: 0,
  mx: 0,
  my: 0,
  vw: 1280,
  vh: 800,
});

export type Quality = "high" | "low";

/** Page sections in order; the 3D card has one resting place per section. */
export const SECTION_IDS = [
  "home",
  "services",
  "about",
  "ceo",
  "why-us",
  "process",
  "industries",
  "careers",
  "faq",
  "contact",
] as const;
