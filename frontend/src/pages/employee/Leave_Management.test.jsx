import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LeaveManagement from "./Leave_Management";

jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    BarChart: ({ children }) => <div>{children}</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    PieChart: ({ children }) => <div>{children}</div>,
    Pie: () => null,
    Cell: () => null,
    LineChart: ({ children }) => <div>{children}</div>,
    Line: () => null,
    AreaChart: () => null,
    Area: () => null,
  };
});

describe("LeaveManagement", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("submits a new leave request to the backend with the expected payload", async () => {
    global.fetch.mockImplementation((url, options = {}) => {
      if (url === "http://localhost:8081/api/leave-management" && options.method === "GET") {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      if (url === "http://localhost:8081/api/leave-management" && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, employeeName: "Alice Doe" }),
        });
      }

      return Promise.reject(new Error("Unexpected fetch call"));
    });

    render(<LeaveManagement />);

    fireEvent.click(screen.getByRole("button", { name: /new leave request/i }));

    fireEvent.change(screen.getByLabelText(/employee name/i), {
      target: { value: "Alice Doe" },
    });
    fireEvent.change(screen.getByLabelText(/department/i), {
      target: { value: "Engineering" },
    });
    fireEvent.change(screen.getByLabelText(/leave type/i), {
      target: { value: "Sick" },
    });
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-08-01" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-08-03" },
    });
    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: "Flu recovery" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8081/api/leave-management",
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: expect.any(String),
        })
      );
    });

    const [, requestOptions] = global.fetch.mock.calls[1];
    const payload = JSON.parse(requestOptions.body);

    expect(payload).toMatchObject({
      employeeName: "Alice Doe",
      department: "Engineering",
      leaveType: "Sick",
      startDate: "2026-08-01",
      endDate: "2026-08-03",
      reason: "Flu recovery",
      status: "Pending",
      approved: "0",
      pending: "1",
      rejected: "0",
      totalRequest: 1,
      totalDays: 3,
    });
  });
});
