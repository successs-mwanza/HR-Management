import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EmployeeReport from "./EmployeeReport";

describe("EmployeeReport", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("navigates to productivity monitoring for the selected employee", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/employees/42")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 42,
            firstName: "Jane",
            middleName: "A.",
            lastName: "Doe",
            position: "Developer",
            department: "Engineering",
            email: "jane@example.com",
            phone: "1234567890",
            status: "Active",
          }),
        });
      }

      if (url.includes("/api/attendance/employee/42")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      return Promise.reject(new Error("Unexpected fetch call"));
    });

    render(
      <MemoryRouter initialEntries={["/employee-report/42"]}>
        <Routes>
          <Route path="/employee-report/:employeeId" element={<EmployeeReport />} />
          <Route path="/productivity" element={<div>Productivity screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/employee attendance report/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /open productivity monitoring/i }));

    await waitFor(() => {
      expect(screen.getByText(/productivity screen/i)).toBeInTheDocument();
    });
  });
});
