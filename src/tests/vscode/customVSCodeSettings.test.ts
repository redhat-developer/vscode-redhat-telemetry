import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomVSCodeSettings } from '../../common/vscode/settings';

// ---------------------------------------------------------------------------
// Mock the 'vscode' module
// ---------------------------------------------------------------------------
// vi.mock is hoisted, so mockEnv must be declared via vi.hoisted to be
// accessible inside the factory.
const mockEnv = vi.hoisted(() => ({ appName: 'Visual Studio Code' }));

vi.mock('vscode', () => {
  const configStore: Record<string, Record<string, unknown>> = {};

  const getConfiguration = vi.fn((section?: string) => {
    const sectionKey = section ?? '';
    if (!configStore[sectionKey]) {
      configStore[sectionKey] = {};
    }
    return {
      get: vi.fn((key: string, defaultValue?: unknown) => {
        const value = configStore[sectionKey][key];
        return value !== undefined ? value : defaultValue;
      }),
      update: vi.fn((key: string, value: unknown) => {
        configStore[sectionKey][key] = value;
        return Promise.resolve();
      }),
      inspect: vi.fn((key: string) => configStore[sectionKey]?.[`__inspect__${key}`]),
    };
  });

  // Helper exposed on workspace to let tests set values
  const __setConfig = (section: string, key: string, value: unknown) => {
    if (!configStore[section]) configStore[section] = {};
    configStore[section][key] = value;
  };

  const __setInspect = (section: string, fullKey: string, inspectResult: unknown) => {
    if (!configStore[section]) configStore[section] = {};
    (configStore[section] as any)[`__inspect__${fullKey}`] = inspectResult;
  };

  const __reset = () => {
    for (const k of Object.keys(configStore)) delete configStore[k];
  };

  return {
    workspace: {
      getConfiguration,
      __setConfig,
      __setInspect,
      __reset,
    },
    // proxy so tests can mutate mockEnv fields at runtime
    env: new Proxy(mockEnv, { get: (t, p) => t[p as keyof typeof t] }),
  };
});

// ---------------------------------------------------------------------------
// Helpers to control the stub
// ---------------------------------------------------------------------------
import { workspace } from 'vscode';

const ws = workspace as any;

beforeEach(() => ws.__reset());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CustomVSCodeSettings', () => {
  const NS = 'myext';
  let settings: CustomVSCodeSettings;

  beforeEach(() => {
    settings = new CustomVSCodeSettings(NS);
  });

  describe('isTelemetryEnabled()', () => {
    it('returns true when namespace enabled=true', () => {
      ws.__setConfig(`${NS}.telemetry`, 'enabled', true);
      expect(settings.isTelemetryEnabled()).toBe(true);
    });

    it('returns false when namespace enabled=false', () => {
      ws.__setConfig(`${NS}.telemetry`, 'enabled', false);
      expect(settings.isTelemetryEnabled()).toBe(false);
    });

    it('returns false when global telemetryLevel is off (user opt-out must be honoured)', () => {
      ws.__setConfig('', 'telemetry.telemetryLevel', 'off');
      ws.__setConfig(`${NS}.telemetry`, 'enabled', true);
      expect(settings.isTelemetryEnabled()).toBe(false);
    });

    it('returns true when global telemetryLevel is off but ignoreGlobalTelemetryLevel=true', () => {
      const bypassSettings = new CustomVSCodeSettings(NS, true);
      ws.__setConfig('', 'telemetry.telemetryLevel', 'off');
      ws.__setConfig(`${NS}.telemetry`, 'enabled', true);
      expect(bypassSettings.isTelemetryEnabled()).toBe(true);
    });

    it('returns false when namespace key is not set (defaults to false)', () => {
      // do NOT set myext.telemetry.enabled → get() returns defaultValue=false
      expect(settings.isTelemetryEnabled()).toBe(false);
    });

    it('is unaffected by redhat.telemetry.enabled being true', () => {
      ws.__setConfig('redhat.telemetry', 'enabled', true); // should be ignored
      ws.__setConfig(`${NS}.telemetry`, 'enabled', false);
      expect(settings.isTelemetryEnabled()).toBe(false);
    });
  });

  describe('getTelemetryLevel()', () => {
    afterEach(() => {
      // restore appName after each test in this suite in case a test throws mid-way
      mockEnv.appName = 'Visual Studio Code';
    });

    it('returns "all" for a standard VS Code client', () => {
      expect(settings.getTelemetryLevel()).toBe('all');
    });

    it('returns "off" for a privacy-focused client (VS Codium)', () => {
      mockEnv.appName = 'VSCodium';
      expect(settings.getTelemetryLevel()).toBe('off');
    });

    it('returns "off" when telemetry.telemetryLevel is set to "off"', () => {
      ws.__setConfig('', 'telemetry.telemetryLevel', 'off');
      expect(settings.getTelemetryLevel()).toBe('off');
    });

    it('returns "error" when telemetry.telemetryLevel is set to "error"', () => {
      ws.__setConfig('', 'telemetry.telemetryLevel', 'error');
      expect(settings.getTelemetryLevel()).toBe('error');
    });

    it('returns "off" when legacy telemetry.enableTelemetry is false', () => {
      ws.__setConfig('', 'telemetry.enableTelemetry', false);
      expect(settings.getTelemetryLevel()).toBe('off');
    });

    it('returns "off" when legacy telemetry.enableCrashReporter is false', () => {
      ws.__setConfig('', 'telemetry.enableCrashReporter', false);
      expect(settings.getTelemetryLevel()).toBe('off');
    });
  });

  describe('isTelemetryConfigured()', () => {
    it('returns false when inspect returns all-undefined (never set)', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, {
        globalValue: undefined,
        workspaceValue: undefined,
        workspaceFolderValue: undefined,
        globalLanguageValue: undefined,
        workspaceLanguageValue: undefined,
        workspaceFolderLanguageValue: undefined,
      });
      expect(settings.isTelemetryConfigured()).toBe(false);
    });

    it('returns true when globalValue is set', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, { globalValue: true });
      expect(settings.isTelemetryConfigured()).toBe(true);
    });

    it('returns true when workspaceValue is set', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, { workspaceValue: false });
      expect(settings.isTelemetryConfigured()).toBe(true);
    });

    it('returns true when workspaceFolderValue is set', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, { workspaceFolderValue: true });
      expect(settings.isTelemetryConfigured()).toBe(true);
    });

    it('returns true when globalLanguageValue is set', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, { globalLanguageValue: true });
      expect(settings.isTelemetryConfigured()).toBe(true);
    });

    it('returns true when workspaceLanguageValue is set', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, { workspaceLanguageValue: false });
      expect(settings.isTelemetryConfigured()).toBe(true);
    });

    it('returns true when workspaceFolderLanguageValue is set', () => {
      ws.__setInspect('', `${NS}.telemetry.enabled`, { workspaceFolderLanguageValue: false });
      expect(settings.isTelemetryConfigured()).toBe(true);
    });
  });

  describe('updateTelemetryEnabledConfig()', () => {
    it('writes enabled=true to the custom namespace config, not redhat.*', async () => {
      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      (workspace.getConfiguration as any).mockImplementation((section?: string) => ({
        get: vi.fn(),
        update: section === `${NS}.telemetry` ? mockUpdate : vi.fn(),
        inspect: vi.fn(),
      }));

      await settings.updateTelemetryEnabledConfig(true);
      expect(mockUpdate).toHaveBeenCalledWith('enabled', true, true);
    });

    it('writes enabled=false to the custom namespace config on deny', async () => {
      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      (workspace.getConfiguration as any).mockImplementation((section?: string) => ({
        get: vi.fn(),
        update: section === `${NS}.telemetry` ? mockUpdate : vi.fn(),
        inspect: vi.fn(),
      }));

      await settings.updateTelemetryEnabledConfig(false);
      expect(mockUpdate).toHaveBeenCalledWith('enabled', false, true);
    });
  });

  describe('configSection getter', () => {
    it('returns "<namespace>.telemetry"', () => {
      expect(settings.configSection).toBe(`${NS}.telemetry`);
    });
  });

  describe('constructor validation', () => {
    it('throws when telemetryNamespace is an empty string', () => {
      expect(() => new CustomVSCodeSettings('')).toThrow('telemetryNamespace must be a non-empty string');
    });
  });
});
