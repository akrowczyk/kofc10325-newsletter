import type { StoreData } from "./types";

// Seed content: the real July 2026 issue plus the carry-over globals.
// This is what the store falls back to on first run so the app is never empty
// and the author has a real example to clone from.

export const seedData: StoreData = {
  globals: {
    councilName: "Holy Ghost Council 10325",
    councilNumber: "10325",
    websiteUrl: "https://kofc10325.org",
    officers: [
      { id: "o1", role: "Grand Knight", name: "Warren Wawczak" },
      { id: "o2", role: "Chaplain", name: "Fr. Sam Conforti" },
      { id: "o3", role: "Deputy Grand Knight", name: "John Ortiz" },
      { id: "o4", role: "Chancellor", name: "Deacon Robbie Lasica" },
      { id: "o5", role: "Recorder", name: "Ken Warneke" },
      { id: "o6", role: "Financial Secretary", name: "Bo Kowalski" },
      { id: "o7", role: "Treasurer", name: "Ray Matuszewski" },
      { id: "o8", role: "Advocate", name: "Frank Rice" },
      { id: "o9", role: "Warden", name: "Frank Monaco" },
      { id: "o10", role: "Inside Guard", name: "Rocco Fasano" },
      { id: "o11", role: "Outside Guard", name: "Paul Kmiecik" },
      { id: "o12", role: "Lecturer", name: "Chuck Seriano" },
      { id: "o13", role: "Trustee", name: "Dave Krause" },
      { id: "o14", role: "Trustee", name: "Gary Effert" },
      { id: "o15", role: "Trustee", name: "Phil Yanez" },
    ],
    members: [
      { id: "m1", name: "Andrew Krowczyk", birthday: { month: 7, day: 8 } },
      { id: "m2", name: "Tammy Campeotto", birthday: { month: 7, day: 9 } },
      { id: "m3", name: "Patricia Warneke", birthday: { month: 7, day: 9 } },
      { id: "m4", name: "Dennis Bero", birthday: { month: 7, day: 19 } },
      { id: "m5", name: "Rosita Fasano", birthday: { month: 7, day: 23 } },
      { id: "m6", name: "Lorraine Kmiecik", birthday: { month: 7, day: 29 } },
      { id: "m7", name: "Larry Venere", birthday: { month: 7, day: 31 } },
    ],
    prayerList: {
      intro: "Pray for protection and guidance for those who are deployed, and for",
      names: [
        "John Alli", "Mitch Bartoshevich", "Carole & Larry Bernett", "Frank Birner",
        "Matt Borgard", "Bianca & Brad Borowski", "Michelle & Ryan Brezek",
        "Jane Coconate", "Joseph Elgio", "Joyce Gilroy", "Jan Kante", "Scott Kerfman",
        "Jeanna & Ray Matuszewski", "Larry Mayer", "Marco & Teresa Morelli",
        "Debbie Ortiz", "Lana Rose Prempas", "Pat Rice", "Barbara Shea",
        "Marge Thomka", "Bradley, Kevin, Tom & Warren Wawczak", "Phil Yanez",
      ],
      contactEmail: "frankrice424@att.com",
    },
    standingSummary: [
      "Participate in parish events. Wear your K of C shirts, jackets and badges — be proud to be a Knight.",
      "Pray for the world and our country: both need it.",
      "Keep Fr. Sam, Deacon Robbie, and Deacon-in-training Bo Kowalski in your prayers as they minister to God's people.",
      "Pray for our Holy Father Pope Leo XIV as he guides the Church and our world forward.",
      "Please don't forget our K.I.N. fund.",
      "Pray for our political leaders, local and national, that they use wisdom and justice.",
      "Keep Seminarian Peter Davis and recently ordained Jonathan Hernandez in your prayers.",
      "Support our Charity Ambassador's Fund.",
    ],
  },
  issues: [
    {
      id: "2026-07",
      slug: "2026-07",
      year: 2026,
      month: 7,
      status: "published",
      publishedAt: "2026-07-01T12:00:00.000Z",
      updatedAt: "2026-07-01T12:00:00.000Z",
      calendar: [
        { id: "c1", date: "2026-07-08", title: "4th Degree Assembly Meeting", time: "7:00 pm" },
        { id: "c2", date: "2026-07-09", title: "Officers Meeting", time: "7:00 pm", location: "on computer via Free Conference Call" },
        { id: "c3", date: "2026-07-12", title: "Rosary led by KC", time: "after 10:30 Mass" },
        { id: "c4", date: "2026-07-15", title: "Business Meeting", time: "7:00 pm", location: "Koinonia Room" },
      ],
      officersMeeting:
        "The Officers' Meeting on June 10 (by computer) was attended by Jim Coconate, Frank Rice, and GK Warren Wawczak.",
      businessMeeting:
        "The June 17 Business Meeting in the Holy Ghost Koinonia Room was attended by Fr. Sam Conforti, Dave Campeotto, Angel Hermida, Bo Kowalski, Andrew Krowczyk, Ray Matuszewski, Frank Monaco, John Ortiz, Frank Rice, DD Albert Treado, Ken Warneke, and GK Warren Wawczak.",
      motions: [
        "Minutes from the May meeting as printed in the June Newsletter",
        "Bills presented by the Financial Secretary",
        "$200 donation to Thomas More Society",
        "$100 to weDignify",
        "$100 to Students for Life",
      ],
      gkReport: [
        "Council received a thank-you letter from Thomas More Society, and donation requests from Thomas More Society, weDignify & Students for Life.",
        'Council received a $250.00 donation from John Borta in honor of Frank Monaco for being a "great neighbor and all-around good guy."',
        "Andrew Krowczyk has applied to be Financial Secretary, succeeding Bo Kowalski.",
      ],
      gkSummary: [
        "Participate in parish events. Wear your K of C shirts, jackets and badges — be proud to be a Knight.",
        "Pray for the world and our country: both need it.",
        "Keep Fr. Sam, Deacon Robbie, and Deacon-in-training Bo Kowalski in your prayers as they minister to God's people.",
        "Pray for our Holy Father Pope Leo XIV as he guides the Church and our world forward.",
        "Please don't forget our K.I.N. fund.",
        "Pray for our political leaders, local and national, that they use wisdom and justice.",
        "Keep Seminarian Peter Davis and recently ordained Jonathan Hernandez in your prayers.",
        "Support our Charity Ambassador's Fund.",
        "Attend the next meeting Wednesday, July 15 in the Koinonia Room!",
      ],
      gkReflection:
        "Model yourself to be more like St. Joseph — quiet, obedient to God's word, and hard-working.",
      treasurer: {
        balances: [
          { id: "b1", label: "Balance May 20, 2026", amount: 12707.95 },
          { id: "b2", label: "Balance June 17, 2026", amount: 13198.59, note: "includes K.I.N. Fund $7,910" },
        ],
        groups: [
          {
            id: "g1", title: "Receipts",
            rows: [
              { id: "r1", label: "Baby Bottles", amount: 187.64 },
              { id: "r2", label: "Donations", amount: 500.0 },
              { id: "r3", label: "Member Donations", amount: 193.0 },
              { id: "r4", label: "Dues", amount: 30.0 },
            ],
          },
          {
            id: "g2", title: "Checks",
            rows: [
              { id: "r5", label: "Ordination Gift", amount: 100.0 },
              { id: "r6", label: "Newman Fund", amount: 220.0 },
              { id: "r7", label: "State Pro-Life Fund", amount: 50.0 },
              { id: "r8", label: "State Charitable Assist Fund", amount: 50.0 },
            ],
          },
        ],
      },
      financialSecretary: {
        balances: [],
        groups: [
          {
            id: "fg1", title: "Receipts",
            rows: [
              { id: "fr1", label: "Baby Bottles", amount: 187.64 },
              { id: "fr2", label: "Donations", amount: 500.0 },
              { id: "fr3", label: "Member Donations", amount: 193.0 },
              { id: "fr4", label: "Dues", amount: 30.0 },
            ],
          },
          {
            id: "fg2", title: "Vouchers",
            rows: [
              { id: "fr5", label: "Ordination Gift", amount: 100.0 },
              { id: "fr6", label: "Newman Fund", amount: 220.0 },
              { id: "fr7", label: "State Pro-Life Fund", amount: 50.0 },
              { id: "fr8", label: "State Charitable Assist Fund", amount: 50.0 },
            ],
          },
        ],
      },
      churchReport:
        "Chaplain Fr. Sam Conforti told us the glass wall between the Narthex and the worship space will be installed June 23–24.\n\nFr. Sam welcomes flowers in the church, and encouraged KC to work with the CCW to provide flowers twice each year.\n\nTwo new statues will soon be installed in church — one of Mary, the other of St. Joseph.",
      ddReport:
        "DD Albert Treado, Associate Diocesan Chairman for Charities, advised us to operate toward the Star Council Award, and to file the Columbian Award and Program forms. He reminded us that meetings are no longer limited to KC members — invite people to attend.\n\nDD Treado presided over the installation of the officers for 2026–2027.",
      includeOfficers: true, // July issue listed the newly installed officers
      publicityReport:
        "The June Parish Newsletter contained an article on KC Benefits. A bulletin insert was submitted thanking everyone for donations to the Baby Bottle Collection.",
      charityReport:
        "Dave Campeotto reported donations from the May meeting: $5 Pro-Life, $5 Charitable Assistance, $5 Newman Clubs.",
      proLifeReport:
        "The Baby Bottle Collection totaled $2,843.86 for the Women's Centers. We will apply to the Supreme Council to have them sent another $400.\n\nSince 2022, 3,200 KC councils — including ours, through the Baby Bottle Project — have provided $19 million to 2,000 Pregnancy Resource Centers and 126 maternity homes.\n\nSince 2009, 2,054 life-saving ultrasound machines, valued at more than $97 million, have been donated by the Knights of Columbus to Pregnancy Resource Centers and pro-life medical clinics.",
      oldBusiness:
        "GK Warren Wawczak and Angel Hermida participated in the Memorial Day Parade, May 25.\n\nSeveral Knights participated in the Corpus Christi Procession, June 7 — see photos below.\n\nThe Rosary after Mass on June 14 was shared by 12 people.",
      newBusiness:
        "John Ortiz is getting 300 Raffle Ticket Books to sell after Masses in August.\n\nMotions were made and approved to donate to three Pro-Life organizations (see Motions Approved above).",
      knightOfMonth:
        "Treasurer Ray Matuszewski, for emptying and depositing the baby-bottle donations.",
      lecturerReflection: {
        body:
          "Devotion to the Sacred Heart, as the McGivney family knew it, was inspired by 17th-century apparitions to St. Margaret Mary Alacoque. Our Lord told her his heart was the symbol of his inexhaustible mercy, and asked her to spread the message of Divine Mercy in the face of irreverence and waning faith in the Real Presence. Jesus promised that devotion to his Sacred Heart would bear the fruit of true repentance and preparedness for our final journey into eternity.",
        attribution: "from the Fr. McGivney Guild Newsletter, Apr–Jun 2026",
      },
      popeIntention:
        "Let us pray for the respect and protection of human life in all its stages, recognizing it as a gift from God.",
      congratulations: [
        {
          id: "cg1",
          title: "New Arrival",
          entries: [
            {
              id: "cge1",
              when: "Feb 16",
              text: "Mariana Fasano, daughter of Rosita & Rocco Fasano",
            },
          ],
        },
      ],
      photoSectionTitle: "Corpus Christi Procession · June 7",
      photos: [
        { id: "p1", caption: "" },
        { id: "p2", caption: "" },
        { id: "p3", caption: "" },
        { id: "p4", caption: "" },
      ],
    },
  ],
};
