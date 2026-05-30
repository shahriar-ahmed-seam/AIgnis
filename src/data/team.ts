// Team data for the /docs Team section. Drop optional photos in
// public/team/<id>.jpg — if missing, a uniform gradient avatar with initials
// is shown automatically. Emails marked TODO can be edited here.

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  badge: "Leader" | "Member";
  attendance: "Physical (In-person)" | "Remote";
  photo?: string; // /team/<id>.jpg
}

export const TEAM_NAME = "AInigma";

export const TEAM: TeamMember[] = [
  {
    id: "shahriar",
    name: "Shahriar Ahmed Seam",
    role: "Team Leader / Project Coordinator · Backend / Database / Scraper Engineer",
    email: "shahriarseam17@gmail.com",
    badge: "Leader",
    attendance: "Physical (In-person)",
    photo: "/team/shahriar.jpg",
  },
  {
    id: "shakil",
    name: "Shakil Ahmed",
    role: "Member",
    email: "shakil@aignis.team", // TODO: replace with real email
    badge: "Member",
    attendance: "Physical (In-person)",
    photo: "/team/shakil.jpg",
  },
  {
    id: "khaled",
    name: "Khaled Saifullah Chy.",
    role: "Member",
    email: "khaled@aignis.team", // TODO: replace with real email
    badge: "Member",
    attendance: "Physical (In-person)",
    photo: "/team/khaled.jpg",
  },
];
