import "./newsletter.css";
import React from "react";
import type { FinancialSection, Globals, Issue } from "@/lib/types";
import { MONTH_NAMES } from "@/lib/types";
import {
  anniversariesInMonth,
  birthdaysInMonth,
  formatEventDate,
  groupTotal,
  isEmptyFinancial,
  money,
} from "@/lib/format";

/** Split a textarea blob into paragraphs on blank lines. */
function Paragraphs({ text }: { text: string }) {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function Section({
  title,
  children,
  show = true,
}: {
  title: string;
  children: React.ReactNode;
  show?: boolean;
}) {
  if (!show) return null;
  return (
    <>
      <h2 className="nl-h2">{title}</h2>
      {children}
    </>
  );
}

function Ledger({ caption, section }: { caption: string; section: FinancialSection }) {
  if (isEmptyFinancial(section)) return null;
  return (
    <table className="nl-ledger">
      <caption>{caption}</caption>
      <tbody>
        {section.balances.map((b) => (
          <tr key={b.id} className="headline">
            <td>
              {b.label}
              {b.note ? <span className="note"> — {b.note}</span> : null}
            </td>
            <td className="amt">{money(b.amount)}</td>
          </tr>
        ))}
        {section.groups.map((g) => (
          <React.Fragment key={g.id}>
            <tr className="group">
              <td colSpan={2}>{g.title}</td>
            </tr>
            {g.rows.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td className="amt">{money(r.amount)}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td className="amt">{money(groupTotal(g))}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

export function NewsletterTemplate({
  issue,
  globals,
  emblemSrc = "/logo_web.png",
}: {
  issue: Issue;
  globals: Globals;
  emblemSrc?: string;
}) {
  const birthdays = birthdaysInMonth(globals.members, issue.month);
  const anniversaries = anniversariesInMonth(globals.members, issue.month);
  const monthName = MONTH_NAMES[issue.month - 1];
  const prevMonthName = MONTH_NAMES[(issue.month + 10) % 12]; // month reported on
  const hasReports =
    issue.churchReport ||
    issue.ddReport ||
    issue.publicityReport ||
    issue.charityReport;

  return (
    <div className="nl-root">
      <div className="nl-sheet">
        {/* Masthead */}
        <header className="nl-masthead">
          <div className="nl-crest-row">
            <div className="nl-crest">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={emblemSrc} alt={`${globals.councilName} emblem`} />
            </div>
            <div>
              <p className="nl-kicker">Knights of Columbus</p>
              <h1 className="nl-council">{globals.councilName}</h1>
            </div>
          </div>
          <div className="nl-issuebar">
            <span className="big">
              Newsletter · {monthName} {issue.year}
            </span>
            <span className="muted">Charity · Unity · Fraternity · Patriotism</span>
          </div>
        </header>

        <div className="nl-body">
          {/* Calendar */}
          <Section title="This Month's Calendar" show={issue.calendar.length > 0}>
            <div className="nl-calendar">
              {issue.calendar.map((ev) => (
                <div className="nl-cal-row" key={ev.id}>
                  <span className="nl-cal-date">{formatEventDate(ev.date)}</span>
                  <span className="nl-cal-what">
                    <b>{ev.title}</b>
                    {ev.time ? ` · ${ev.time}` : ""}
                    {ev.location ? `, ${ev.location}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Meetings + GK report */}
          <div className="nl-cols">
            <div>
              <Section
                title={`${prevMonthName} Meetings`}
                show={!!(issue.officersMeeting || issue.businessMeeting || issue.motions.length)}
              >
                {issue.officersMeeting ? <Paragraphs text={issue.officersMeeting} /> : null}
                {issue.businessMeeting ? <Paragraphs text={issue.businessMeeting} /> : null}
                {issue.motions.length > 0 ? (
                  <div className="nl-card">
                    <h3>Motions Approved</h3>
                    <ul className="nl-list">
                      {issue.motions.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Section>
            </div>
            <div>
              <Section title="Grand Knight's Report" show={issue.gkReport.length > 0}>
                {issue.gkReport.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </Section>
            </div>
          </div>

          {/* GK summary + reflection */}
          <Section title="Grand Knight's Summary" show={issue.gkSummary.length > 0}>
            <ul className="nl-list nl-narrow">
              {issue.gkSummary.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Section>
          {issue.gkReflection ? (
            <div className="nl-reflection">
              <p>{issue.gkReflection}</p>
              <span className="attr">— Grand Knight's Reflection</span>
            </div>
          ) : null}

          {/* Financials */}
          <Section
            title="Treasurer & Financial Secretary"
            show={!isEmptyFinancial(issue.treasurer) || !isEmptyFinancial(issue.financialSecretary)}
          >
            <div className="nl-cols">
              <Ledger caption="Treasurer Report" section={issue.treasurer} />
              <Ledger caption="Financial Secretary Report" section={issue.financialSecretary} />
            </div>
          </Section>

          {/* Reports two-up */}
          {hasReports ? (
            <div className="nl-cols">
              <div>
                {issue.churchReport ? (
                  <Section title="Church Report">
                    <Paragraphs text={issue.churchReport} />
                  </Section>
                ) : null}
                {issue.publicityReport ? (
                  <Section title="Publicity Report">
                    <Paragraphs text={issue.publicityReport} />
                  </Section>
                ) : null}
                {issue.charityReport ? (
                  <Section title="Charity Ambassador">
                    <Paragraphs text={issue.charityReport} />
                  </Section>
                ) : null}
              </div>
              <div>
                {issue.ddReport ? (
                  <Section title="District Deputy Report">
                    <Paragraphs text={issue.ddReport} />
                    <div className="nl-officers">
                      {globals.officers.map((o) => (
                        <div key={o.id}>
                          <span className="role">{o.role}</span>
                          <span className="who">{o.name}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Pro-Life */}
          {issue.proLifeReport ? (
            <Section title="Pro-Life Report">
              <div className="nl-narrow">
                <Paragraphs text={issue.proLifeReport} />
              </div>
            </Section>
          ) : null}

          {/* Old / New business */}
          {(issue.oldBusiness || issue.newBusiness) && (
            <div className="nl-cols">
              <div>
                {issue.oldBusiness ? (
                  <Section title="Old Business">
                    <Paragraphs text={issue.oldBusiness} />
                  </Section>
                ) : null}
              </div>
              <div>
                {issue.newBusiness ? (
                  <Section title="New Business">
                    <Paragraphs text={issue.newBusiness} />
                  </Section>
                ) : null}
              </div>
            </div>
          )}

          {/* Knight of the month */}
          {issue.knightOfMonth ? (
            <div className="nl-badge">
              <div className="medal">★</div>
              <p>
                <b>Knight of the Month — {prevMonthName}:</b>{" "}
                {issue.knightOfMonth}
              </p>
            </div>
          ) : null}

          {/* Lecturer reflection */}
          {issue.lecturerReflection.body ? (
            <div className="nl-reflection">
              <p>{issue.lecturerReflection.body}</p>
              <span className="attr">
                — Lecturer's Reflection
                {issue.lecturerReflection.attribution
                  ? ` · ${issue.lecturerReflection.attribution}`
                  : ""}
              </span>
            </div>
          ) : null}

          {/* Prayer list */}
          <Section title="Prayer List" show={globals.prayerList.names.length > 0}>
            <div className="nl-prayer">
              <p>
                {globals.prayerList.intro ? globals.prayerList.intro + " " : ""}
                {globals.prayerList.names.join(", ")} — and all other Knights and their
                families, and all who support our charitable projects.
              </p>
              {globals.prayerList.contactEmail ? (
                <p className="contact">
                  To add or remove anyone, email{" "}
                  <a href={`mailto:${globals.prayerList.contactEmail}`}>
                    {globals.prayerList.contactEmail}
                  </a>
                  .
                </p>
              ) : null}
            </div>
          </Section>

          {/* Pope intention */}
          {issue.popeIntention ? (
            <div className="nl-reflection" style={{ borderColor: "var(--red)" }}>
              <p>{issue.popeIntention}</p>
              <span className="attr">— Holy Father's Intention for {monthName}</span>
            </div>
          ) : null}

          {/* Congratulations */}
          <Section
            title="Congratulations"
            show={birthdays.length > 0 || anniversaries.length > 0}
          >
            <div className="nl-congrats">
              {birthdays.length > 0 ? (
                <div className="box">
                  <h4>{monthName} Birthdays</h4>
                  <ul>
                    {birthdays.map((b, i) => (
                      <li key={i}>
                        <span className="d">{b.day}</span>
                        {b.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {anniversaries.length > 0 ? (
                <div className="box">
                  <h4>{monthName} Anniversaries</h4>
                  <ul>
                    {anniversaries.map((a, i) => (
                      <li key={i}>
                        <span className="d">{a.day}</span>
                        {a.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Section>
        </div>

        {/* Photos */}
        {issue.photos.length > 0 ? (
          <section className="nl-photos">
            <h2 className="nl-h2">{issue.photoSectionTitle || "Photos"}</h2>
            <div className="nl-photo-grid">
              {issue.photos.map((ph) => (
                <div className="nl-frame" key={ph.id}>
                  {ph.url ? (
                    <img src={ph.url} alt={ph.caption || "Council photo"} />
                  ) : (
                    "PHOTO"
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="nl-colophon">
          <span>
            <b>{globals.councilName}</b> · Knights of Columbus
          </span>
          <span>
            {globals.websiteUrl.replace(/^https?:\/\//, "")} · Vivat Jesus!
          </span>
        </footer>
      </div>
    </div>
  );
}
