import { describe, expect, it } from 'vitest';

import { DESIGN_TOKENS, REPORT_CHART_COLORS, STATUS_DEFINITIONS } from './design-system';

describe('admin semantic color system', () => {
  it('uses the UTH palette for neutral administrative states', () => {
    expect(STATUS_DEFINITIONS.waived.bg).toBe('bg-teal-50');
    expect(STATUS_DEFINITIONS.waived.text).toBe('text-teal-800');
    expect(STATUS_DEFINITIONS.student.bg).toBe('bg-sky-50');
  });
});

describe('report chart palette', () => {
  it('keeps the recovery gauge on the UTH teal visual system', () => {
    expect(REPORT_CHART_COLORS.recoveryGauge).toBe(DESIGN_TOKENS.colors.primary[500]);
    expect(REPORT_CHART_COLORS.recoveryText).toBe(DESIGN_TOKENS.colors.primary[700]);
  });
});
