import { describe, expect, it } from 'vitest';

import { APP_CONTENT_RAIL, HEADER_CONTENT_RAIL } from './layoutPresentation';

describe('application content rails', () => {
  it('uses the full viewport instead of squeezing pages into a centered container', () => {
    expect(APP_CONTENT_RAIL).toContain('w-full');
    expect(HEADER_CONTENT_RAIL).toContain('w-full');
    expect(APP_CONTENT_RAIL).not.toContain('max-w-');
    expect(HEADER_CONTENT_RAIL).not.toContain('max-w-');
    expect(APP_CONTENT_RAIL).not.toContain('mx-auto');
  });
});
