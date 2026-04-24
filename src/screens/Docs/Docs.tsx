import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Column, Row } from "@components/Flex";

type DocItem = { label: string; slug: string };
type DocSection = { title: string; items: DocItem[] };

const SECTIONS: DocSection[] = [
  {
    title: "Introduction",
    items: [
      { label: "Ranges: concentrated liquidity", slug: "" },
      { label: "Liquidity deposit & withdrawal", slug: "liquidity-deposit-and-withdrawal" },
      { label: "Track ranges & pool activity", slug: "how-to-track-ranges-and-pool-activity" }
    ]
  },
  {
    title: "Overview",
    items: [
      { label: "Core parameters", slug: "overview/core-parameters-of-puzzle-ranges" }
    ]
  },
  {
    title: "For Creators",
    items: [
      { label: "How to create a range", slug: "for-creators/how-to-create-a-range" },
      { label: "Range pool types & use cases", slug: "for-creators/range-pool-types-use-cases" }
    ]
  },
  {
    title: "For LPs",
    items: [
      { label: "How yield is generated", slug: "for-lps/how-yield-is-generated" }
    ]
  },
  {
    title: "For Traders",
    items: [
      { label: "Swapping inside ranges", slug: "for-traders/swapping-inside-ranges" }
    ]
  },
  {
    title: "For Everyone",
    items: [
      { label: "FAQ", slug: "for-everyone/faq" }
    ]
  }
];

const Root = styled(Row)`
  width: 100%;
  max-width: 1440px;
  padding: 24px 16px;
  gap: 24px;
  align-items: flex-start;
  box-sizing: border-box;
  @media (max-width: 880px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.nav`
  width: 280px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  position: sticky;
  top: 96px;
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
  box-sizing: border-box;
  @media (max-width: 880px) {
    width: 100%;
    position: static;
    max-height: none;
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.primary650};
  margin: 16px 8px 8px;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, theme }) => ($active ? theme.colors.blue500 : theme.colors.primary800)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : "transparent")};
  text-decoration: none;
  margin-bottom: 2px;
  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }
`;

const Content = styled.article`
  flex: 1;
  min-width: 0;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 32px;
  box-sizing: border-box;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.primary800};

  h1, h2, h3, h4 {
    color: ${({ theme }) => theme.colors.primary800};
    margin: 1.4em 0 0.5em;
    line-height: 1.25;
  }
  h1 { font-size: 28px; margin-top: 0; }
  h2 { font-size: 22px; }
  h3 { font-size: 18px; }
  p { margin: 0 0 1em; }
  ul, ol { padding-left: 1.5em; margin: 0 0 1em; }
  li { margin-bottom: 0.4em; }
  code {
    background: ${({ theme }) => theme.colors.primary100};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: ${({ theme }) => theme.colors.primary100};
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
  }
  pre code { background: none; padding: 0; }
  a {
    color: ${({ theme }) => theme.colors.blue500};
    text-decoration: underline;
  }
  blockquote {
    margin: 0 0 1em;
    padding: 8px 16px;
    border-left: 4px solid ${({ theme }) => theme.colors.primary300};
    color: ${({ theme }) => theme.colors.primary650};
    background: ${({ theme }) => theme.colors.primary50};
    border-radius: 0 8px 8px 0;
  }
  img {
    max-width: 100%;
    border-radius: 8px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 1em;
  }
  th, td {
    border: 1px solid ${({ theme }) => theme.colors.primary200};
    padding: 8px 12px;
    text-align: left;
  }
`;

const State = styled.div`
  color: ${({ theme }) => theme.colors.primary650};
  font-size: 14px;
`;

const Docs: React.FC = () => {
  const location = useLocation();
  const slug = useMemo(() => location.pathname.replace(/^\/docs\/?/, "").replace(/\/$/, ""), [location.pathname]);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const path = slug === "" ? "/docs/README.md" : `/docs/${slug}.md`;
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
        return res.text();
      })
      .then((txt) => {
        if (!cancelled) setMarkdown(txt);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  return (
    <Root>
      <Sidebar>
        {SECTIONS.map((sec) => (
          <Column key={sec.title} crossAxisSize="max">
            <SectionTitle>{sec.title}</SectionTitle>
            {sec.items.map((item) => {
              const to = item.slug ? `/docs/${item.slug}` : "/docs";
              const isActive = slug === item.slug;
              return (
                <NavLink key={item.slug || "root"} to={to} $active={isActive}>
                  {item.label}
                </NavLink>
              );
            })}
          </Column>
        ))}
      </Sidebar>
      <Content>
        {loading && <State>Loading…</State>}
        {error && <State>Error: {error}</State>}
        {!loading && !error && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        )}
      </Content>
    </Root>
  );
};

export default Docs;
