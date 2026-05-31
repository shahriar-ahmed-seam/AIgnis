// Team data for the /docs Team section. Drop optional photos in
// public/team/<id>.(png|jpg) — if a photo is missing, a uniform gradient
// avatar with initials is shown automatically. Empty emails are simply hidden.

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string; // leave "" to hide until known
  badge: "Leader" | "Member";
  attendance: "Physical (In-person)" | "Remote";
  photo?: string; // /team/<id>.png|jpg
}

export const TEAM_NAME = "AInigma";

export const TEAM: TeamMember[] = [
  {
    id: "shahriar",
    name: "Shahriar Ahmed Seam",
    role: "Team Lead · Backend / Database / Scraper Engineer",
    email: "shahriarseam17@gmail.com",
    badge: "Leader",
    attendance: "Physical (In-person)",
    photo: "/team/shahriar.png",
  },
  {
    id: "shakil",
    name: "Shakil Ahmed",
    role: "Member",
    email: "", // to be added
    badge: "Member",
    attendance: "Physical (In-person)",
  },
  {
    id: "khaled",
    name: "Khaled Saifullah Chy.",
    role: "Member",
    email: "", // to be added
    badge: "Member",
    attendance: "Physical (In-person)",
  },
];
