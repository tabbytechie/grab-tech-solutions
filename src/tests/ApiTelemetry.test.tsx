import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchApi } from "../lib/api";

describe("API Telemetry Interceptor", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("emits structured trace logs for every API request lifecycle", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ status: "success", payload: "data" }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await fetchApi("/test-endpoint");

    // Verify Telemetry Logs
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("API_REQUEST_INIT"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("API_REQUEST_SUCCESS"));
    
    const logs = (console.log as any).mock.calls.map((call: any) => JSON.parse(call[0].replace("[TELEMETRY] ", "")));
    
    expect(logs[0].event).toBe("API_REQUEST_INIT");
    expect(logs[0].endpoint).toBe("/test-endpoint");
    expect(logs[0].correlationId).toBeDefined();

    expect(logs[1].event).toBe("API_REQUEST_SUCCESS");
    expect(logs[1].status).toBe(200);
    expect(logs[1].duration).toMatch(/\d+\.\d+ms/);
  });

  it("emits failure traces on non-OK responses", async () => {
    const mockErrorResponse = {
      ok: false,
      status: 500,
      json: async () => ({ message: "Critical Database Failure" }),
    };
    (global.fetch as any).mockResolvedValue(mockErrorResponse);

    await expect(fetchApi("/failing-endpoint")).rejects.toThrow("Critical Database Failure");

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("TELEMETRY_FAILURE"));
    const errorLog = JSON.parse((console.error as any).mock.calls[0][0].replace("[TELEMETRY_FAILURE] ", ""));
    
    expect(errorLog.event).toBe("API_REQUEST_FAILURE");
    expect(errorLog.error).toBe("Critical Database Failure");
    expect(errorLog.status).toBe(500);
  });
});
