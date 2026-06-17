// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useStore } from "@/store/useStore";
import { demoState } from "@/data/seed";

// The pages pull in next/navigation; stub the bits we use so components render
// outside the Next runtime.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useParams: () => ({ id: "m1" }),
}));

import HomePage from "@/app/page";
import MissionsPage from "@/app/missions/page";
import LorePage from "@/app/lore/page";
import ScorePage from "@/app/score/page";
import MapPage from "@/app/map/page";
import FamilyPage from "@/app/family/page";
import MissionDetailPage from "@/app/missions/[id]/page";

beforeEach(() => {
  cleanup();
  // Seed a populated, hydrated, onboarded family so AppFrame renders content.
  useStore.setState({ ...demoState(), hydrated: true });
});

describe("populated pages render without crashing", () => {
  it("home dashboard shows the family and score", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/The Martinez Family/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Memory Score/i)).toBeTruthy();
  });

  it("missions timeline lists the demo missions", () => {
    render(<MissionsPage />);
    expect(screen.getByText(/Mission Log/i)).toBeTruthy();
    expect(screen.getByText(/Kennedy Space Center/i)).toBeTruthy();
  });

  it("lore page builds the family legend", () => {
    render(<LorePage />);
    expect(screen.getByText(/Family Lore/i)).toBeTruthy();
    expect(screen.getAllByText(/completed 3 missions/i).length).toBeGreaterThan(0);
  });

  it("score page shows the breakdown", () => {
    render(<ScorePage />);
    expect(screen.getAllByText(/Family Memory Score/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Child participation/i)).toBeTruthy();
  });

  it("map page renders states visited", () => {
    render(<MapPage />);
    expect(screen.getByText(/Adventure Atlas/i)).toBeTruthy();
    expect(screen.getByText(/States visited/i)).toBeTruthy();
  });

  it("family page shows the crew", () => {
    render(<FamilyPage />);
    expect(screen.getByText(/The crew/i)).toBeTruthy();
    expect(screen.getByText(/Adventure leader/i)).toBeTruthy();
  });

  it("mission detail renders challenges and recap", () => {
    render(<MissionDetailPage />);
    expect(screen.getByText(/Mission Challenges/i)).toBeTruthy();
    expect(screen.getByText(/AI Mission Recap/i)).toBeTruthy();
  });
});
