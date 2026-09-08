# EQA Sample Production Analyser

A web-based statistical analysis tool for external quality assessment (EQA) panel production, developed for and evaluated on tuberculosis (AFB) sputum smear microscopy proficiency-testing materials. It automates the homogeneity, stability, and measurement-uncertainty procedures recommended by ISO 13528:2015, ISO Guide 35:2006, and ISO 17043:2023, and generates publication-ready dashboards from the results.

**Live demo:** https://svqwmr.csb.app/

This repository accompanies the manuscript *"Development and proof-of-concept evaluation of an automated web-based software tool for statistical analysis of external quality assessment panel preparation in tuberculosis microscopy"* (under review, *Accreditation and Quality Assurance*). See [Citation](#citation) below.

## Status

Proof-of-concept research software. It has been evaluated on a single production lot of simulated AFB-positive (3+) samples and has not yet undergone multicentre validation. See the associated manuscript's Limitations section before using it for routine EQA release decisions.

## Features

- **Homogeneity module** — mean, SD, CV, M−2SD acceptance criterion; paired *t*-test and *F*-test between readers; intraclass correlation coefficient (ICC) and concordance correlation coefficient; Bland–Altman agreement analysis; Grubbs' and Dixon's outlier tests; Levey–Jennings control chart with Westgard-rule zone shading.
- **Stability module** — dual-criteria assessment (statistical significance + ±15% practical-significance threshold) at each time point against baseline; one-way ANOVA variance-components decomposition (between- vs. within-time-point); CUSUM control chart; linear regression trend test; Mann–Kendall trend test.
- **Uncertainty module** — combined standard uncertainty budget (GUM methodology) with Pareto ranking of contributors; Monte Carlo simulation (configurable iterations, default 10,000) for distribution validation; expanded uncertainty at coverage factors *k* = 1, 2, 3.
- **Automated dashboards** — Summary Decision, Homogeneity Analysis, Stability Analysis, and Uncertainty Budget views, each exportable as a 300 DPI PNG image.
- Built-in sample dataset (the Lot ĐGĐ-P01 data reported in the manuscript) for quick evaluation.

## Data entry

Data are entered through a **4-step guided form** (Study Info → Homogeneity → Stability → Analysis): AFB counts are typed or pasted as comma/space-separated values into text fields for each reader/time point — there is currently **no file-upload or Excel-import function**. This is the actual behaviour of the code in this repository; if you have seen wording elsewhere describing "Excel file upload," that describes an earlier plan, not this release.

## Tech stack

- [React](https://react.dev/) 18 (Create React App)
- [Recharts](https://recharts.org/) for charts
- [html2canvas](https://github.com/niklasvh/html2canvas) + [jsPDF](https://github.com/parallax/jsPDF) for dashboard export

## Getting started

```bash
git clone <this-repo-url>
cd eqa-sample-production-analyser
npm install
npm start       # runs at http://localhost:3000
```

Production build:

```bash
npm run build
```

## Project structure

```
src/
  App.js               # root component
  index.js              # entry point
  EQAAnalyzer.js         # main UI: 4-step data entry + results tabs
  StatisticalEngine.js   # all statistical computations (pure functions, no UI)
  ChartLibrary.js        # dashboard chart/report components (Recharts)
  ExportDashboard.js     # PNG/PDF export of a dashboard section
  styles.css
public/
  index.html
```

`StatisticalEngine.js` has no dependency on React or the DOM and can be reused or unit-tested independently of the UI.

## Citation

If you use this software, please cite the associated manuscript (citation details will be added once the article is formally published; in the meantime please cite the preprint/submission and this repository).

## License

[MIT](LICENSE)

## Acknowledgements

Developed at the Faculty of Medical Technology, Van Lang University, Ho Chi Minh City, Vietnam, with the Centre for Quality Assurance in Medical Laboratory Testing, University of Medicine and Pharmacy at Ho Chi Minh City.

## Statistical engine corrections (revision for Accreditation and Quality Assurance)

Eight defects were identified and fixed while verifying the values reported in
the manuscript. They are documented inline in `src/StatisticalEngine.js` and
`src/ChartLibrary.js`:

1. **Exact t distribution.** All t-test p-values were previously computed from
   the standard normal CDF. `tCDF()` / `tTestPValue()` now evaluate Student's t
   exactly via the regularised incomplete beta function.
2. **One-sample stability test.** Each time point is compared with the baseline
   mean using a one-sample t-test with df = n - 1, replacing a two-sample test
   against a zero-variance constant vector (which gave df = 2n - 2).
2b. **Correct unit of analysis for the stability test.** The one-sample test in
   (2) was still being run on the n=6 individual readings (df=5) at each time
   point, even though each time point is 3 physical slides read twice, not 6
   independent slides. Two readings of the same slide are not independent
   evidence about whether that slide has drifted from baseline — treating them
   as such (pseudoreplication) shrinks the standard error and can manufacture
   "significant" drift the slide-level data do not support. The test is now
   run on the n=3 slide-level means, df = n - 1 = 2, matching the original
   thesis protocol (Nguyễn Thị Bé Nga, 2024) this software re-implements. This
   changes every stability p-value; with the corrected test, no time point in
   the ĐGĐ-P01 dataset reaches p < 0.05, so the dual-criteria (statistical +
   practical significance) distinction the manuscript previously illustrated
   with Day 3 and Week 2 no longer has an example in this dataset.
3. **Exact F distribution.** `fCDF()` was a placeholder returning `0.5`.
4. **Genuine ICC(2,1).** Two-way random effects, absolute agreement, single
   rater, with an exact 95 % confidence interval. The previous formula was
   ICC(1,1) despite the documented model.
5. **CUSUM.** The cumulative sum no longer discards the first time point.
6. **Regression on elapsed time.** Pass `stability.elapsedDays` to obtain a
   slope in AFB per day; otherwise the ordinal index is used.
7. **Seedable Monte Carlo.** `setRandomSeed(n)` makes the simulation exactly
   reproducible; pass `null` to restore `Math.random()`.

### Reproducing the published values

```bash
node verify.mjs
```

This re-executes the engine against the raw Lot ĐGĐ-P01 dataset with
`setRandomSeed(20240101)` and prints every statistic reported in the
manuscript. The expected output is stored in `VERIFICATION_OUTPUT.txt`. All
values have been cross-checked against `scipy.stats`.
