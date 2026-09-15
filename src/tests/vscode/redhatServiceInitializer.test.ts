import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildOptInMessage, onDidChangeTelemetryEnabled } from '../../common/vscode/redhatServiceInitializer';

// ---------------------------------------------------------------------------
// Mock 'vscode'
// ---------------------------------------------------------------------------
type ChangeListener = (e: { affectsConfiguration: (s: string) => boolean }) => void;
let registeredListener: ChangeListener | undefined;

vi.mock('vscode', () => {
  return {
    workspace: {
      onDidChangeConfiguration: vi.fn((cb: ChangeListener) => {
        registeredListener = cb;
        return { dispose: vi.fn() };
      }),
    },
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fireConfigChange(changed: string[]) {
  registeredListener?.({
    affectsConfiguration: (section: string) => changed.includes(section),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('onDidChangeTelemetryEnabled', () => {
  let flushQueue: ReturnType<typeof vi.fn>;
  let telemetryService: any;

  beforeEach(() => {
    registeredListener = undefined;
    flushQueue = vi.fn();
    telemetryService = { flushQueue };
  });

  describe('default behavior (no custom namespace)', () => {
    it('flushes queue when redhat.telemetry changes', () => {
      onDidChangeTelemetryEnabled(telemetryService);
      fireConfigChange(['redhat.telemetry']);
      expect(flushQueue).toHaveBeenCalledTimes(1);
    });

    it('flushes queue when VS Code global telemetry changes', () => {
      onDidChangeTelemetryEnabled(telemetryService);
      fireConfigChange(['telemetry']);
      expect(flushQueue).toHaveBeenCalledTimes(1);
    });

    it('does NOT flush queue when an unrelated config changes', () => {
      onDidChangeTelemetryEnabled(telemetryService);
      fireConfigChange(['some.other.setting']);
      expect(flushQueue).not.toHaveBeenCalled();
    });
  });

  describe('custom namespace (e.g. "myext.telemetry")', () => {
    it('flushes queue when the custom namespace config changes', () => {
      onDidChangeTelemetryEnabled(telemetryService, 'myext.telemetry');
      fireConfigChange(['myext.telemetry']);
      expect(flushQueue).toHaveBeenCalledTimes(1);
    });

    it('does NOT flush queue when redhat.telemetry changes (custom pipeline is isolated)', () => {
      onDidChangeTelemetryEnabled(telemetryService, 'myext.telemetry');
      fireConfigChange(['redhat.telemetry']);
      expect(flushQueue).not.toHaveBeenCalled();
    });

    it('does NOT flush queue when VS Code global telemetry changes (custom pipeline is isolated)', () => {
      onDidChangeTelemetryEnabled(telemetryService, 'myext.telemetry', true);
      fireConfigChange(['telemetry']);
      expect(flushQueue).not.toHaveBeenCalled();
    });

    it('flushes queue when VS Code global telemetry changes (custom pipeline honors global telemetry)', () => {
      onDidChangeTelemetryEnabled(telemetryService, 'myext.telemetry', false);
      fireConfigChange(['telemetry']);
      expect(flushQueue).toHaveBeenCalledTimes(1);
    });

    it('does NOT flush queue when an unrelated config changes', () => {
      onDidChangeTelemetryEnabled(telemetryService, 'myext.telemetry');
      fireConfigChange(['some.other.setting']);
      expect(flushQueue).not.toHaveBeenCalled();
    });
  });

  describe('default pipeline with ignoreGlobalTelemetryLevel: true', () => {
    it('flushes queue when redhat.telemetry changes', () => {
      onDidChangeTelemetryEnabled(telemetryService, undefined, true);
      fireConfigChange(['redhat.telemetry']);
      expect(flushQueue).toHaveBeenCalledTimes(1);
    });

    it('does NOT flush queue when VS Code global telemetry changes', () => {
      onDidChangeTelemetryEnabled(telemetryService, undefined, true);
      fireConfigChange(['telemetry']);
      expect(flushQueue).not.toHaveBeenCalled();
    });
  });
});

describe('buildOptInMessage', () => {
  const EXT_ID = 'my.extension';

  it('appends privacy/opt-out suffix to a custom optInMessage', () => {
    const msg = buildOptInMessage({ optInMessage: 'Custom message.' }, EXT_ID);
    expect(msg).toContain('Custom message.');
    expect(msg).toContain('privacy statement');
    expect(msg).toContain('opt out');
  });

  it('appends from= as a proper query parameter for a plain custom URL', () => {
    const msg = buildOptInMessage({ privacyStatementUrl: 'https://example.com/privacy' }, EXT_ID);
    expect(msg).toContain('https://example.com/privacy?from=my.extension');
  });

  it('appends from= without breaking an existing query string', () => {
    const msg = buildOptInMessage({ privacyStatementUrl: 'https://example.com/privacy?locale=en' }, EXT_ID);
    expect(msg).toContain('locale=en');
    expect(msg).toContain('from=my.extension');
    // 'from' must not be part of the locale value
    expect(msg).not.toContain('locale=en?from');
  });

  it('appends from= without corrupting a URL that has a fragment', () => {
    const msg = buildOptInMessage({ privacyStatementUrl: 'https://example.com/privacy#section' }, EXT_ID);
    expect(msg).toContain('from=my.extension');
    // fragment must stay at the end, after the query string
    expect(msg).toMatch(/\?from=[^#]+#section/);
  });

  it('uses custom optOutInstructionsUrl in the default message', () => {
    const msg = buildOptInMessage({ optOutInstructionsUrl: 'https://example.com/opt-out' }, EXT_ID);
    expect(msg).toContain('https://example.com/opt-out');
  });

  it('falls back to Red Hat defaults when no URLs are provided', () => {
    const msg = buildOptInMessage(undefined, EXT_ID);
    expect(msg).toContain('redhat.com');
    expect(msg).toContain(EXT_ID);
  });

  it('ignores optInMessage when empty string; falls back to default', () => {
    // empty string is falsy — treated as absent
    const msg = buildOptInMessage({ optInMessage: '' }, EXT_ID);
    expect(msg).toContain('Help Red Hat');
  });

  it('handles a relative privacyStatementUrl without throwing', () => {
    const msg = buildOptInMessage({ privacyStatementUrl: '/privacy' }, EXT_ID);
    expect(msg).toContain('/privacy');
    expect(msg).toContain(`from=${EXT_ID}`);
  });

  it('handles a malformed privacyStatementUrl without throwing', () => {
    const msg = buildOptInMessage({ privacyStatementUrl: 'not a url' }, EXT_ID);
    expect(msg).toContain('not a url');
    expect(msg).toContain(`from=${EXT_ID}`);
  });

  it('appends from= with & when relative URL already has a query string', () => {
    const msg = buildOptInMessage({ privacyStatementUrl: '/privacy?locale=en' }, EXT_ID);
    expect(msg).toContain('/privacy?locale=en&from=');
  });

  it('throws when telemetryNamespace is set but required fields are absent', () => {
    expect(() => buildOptInMessage({ telemetryNamespace: 'myext' }, EXT_ID)).toThrow(
      'are required when telemetryNamespace is set',
    );
  });

  it('throws when telemetryNamespace is set but only optInMessage is provided', () => {
    expect(() => buildOptInMessage({ telemetryNamespace: 'myext', optInMessage: 'Custom text.' }, EXT_ID)).toThrow(
      'are required when telemetryNamespace is set',
    );
  });

  it('does not throw when telemetryNamespace and all required fields are provided', () => {
    expect(() =>
      buildOptInMessage(
        {
          telemetryNamespace: 'myext',
          optInMessage: 'Custom text.',
          privacyStatementUrl: 'https://example.com/privacy',
          optOutInstructionsUrl: 'https://example.com/opt-out',
        },
        EXT_ID,
      ),
    ).not.toThrow();
  });
});
