import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TimeCards } from "./time-cards";

describe("TimeCards", () => {
  afterEach(cleanup);

  it("renders both real time zones with capitalized Spanish dates", () => {
    render(<TimeCards now={new Date("2026-08-21T12:00:00Z")} />);

    const london = screen.getByRole("region", { name: "Hora en Londres" });
    const colombia = screen.getByRole("region", { name: "Hora en Colombia" });

    expect(within(london).getByText("13:00")).toBeInTheDocument();
    expect(within(london).getByText("Viernes, 21 de Agosto")).toBeInTheDocument();
    expect(within(colombia).getByText("07:00")).toBeInTheDocument();
    expect(within(colombia).getByText("Viernes, 21 de Agosto")).toBeInTheDocument();
  });
});

