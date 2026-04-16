import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Link, useParams } from "react-router-dom";
import { Column } from "@components/Flex";
import { fetchNewsBySlug, NewsPost, resolveImageUrl } from "@src/services/newsApi";
import { ROUTES } from "@src/constants";

const Root = styled(Column)`
  width: 100%;
  max-width: 800px;
  padding: 48px 24px;
  box-sizing: border-box;
  align-items: flex-start;
  gap: 24px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 18px;
  }
`;

const BackLink = styled(Link)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary500};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary800};
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary500};
`;

const SourceBadge = styled.span`
  padding: 3px 10px;
  background: ${({ theme }) => theme.colors.primary50};
  color: ${({ theme }) => theme.colors.primary650};
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.3px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.primary800};
  margin: 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const Summary = styled.p`
  font-size: 18px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.primary650};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
`;

const Content = styled.div`
  width: 100%;
  font-size: 16px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.primary800};
  white-space: pre-wrap;

  p {
    margin: 0 0 16px;
  }

  a {
    color: ${({ theme }) => theme.colors.blue500};
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  font-size: 12px;
  padding: 4px 10px;
  background: ${({ theme }) => theme.colors.primary50};
  color: ${({ theme }) => theme.colors.primary650};
  border-radius: 6px;
  font-weight: 500;
`;

const SourceLink = styled.a`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary500};
  text-decoration: none;
  border-bottom: 1px dashed currentColor;

  &:hover {
    color: ${({ theme }) => theme.colors.primary800};
  }
`;

const ErrorState = styled.div`
  padding: 60px 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary500};
  font-size: 15px;
`;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "notFound" | "error">("loading");

  useEffect(() => {
    if (!slug) return;
    setState("loading");
    fetchNewsBySlug(slug)
      .then((data) => {
        if (!data) {
          setState("notFound");
          return;
        }
        setPost(data);
        setState("ok");
      })
      .catch(() => setState("error"));
  }, [slug]);

  if (state === "loading") {
    return (
      <Root>
        <ErrorState>Loading...</ErrorState>
      </Root>
    );
  }

  if (state === "notFound") {
    return (
      <Root>
        <BackLink to={ROUTES.NEWS}>← Back to news</BackLink>
        <ErrorState>Article not found.</ErrorState>
      </Root>
    );
  }

  if (state === "error" || !post) {
    return (
      <Root>
        <BackLink to={ROUTES.NEWS}>← Back to news</BackLink>
        <ErrorState>Failed to load the article.</ErrorState>
      </Root>
    );
  }

  const img = resolveImageUrl(post.imageUrl);

  return (
    <Root>
      <BackLink to={ROUTES.NEWS}>← Back to news</BackLink>

      <Meta>
        <SourceBadge>{post.sourceType}</SourceBadge>
        <span>{formatDate(post.publishedAt)}</span>
        {post.sourceAuthor && <span>• {post.sourceAuthor}</span>}
      </Meta>

      <Title>{post.title}</Title>
      <Summary>{post.summary}</Summary>

      {img && <HeroImage src={img} alt={post.title} />}

      <Content>{post.content}</Content>

      {post.tags.length > 0 && (
        <TagRow>
          {post.tags.map((t) => (
            <Tag key={t}>#{t}</Tag>
          ))}
        </TagRow>
      )}

      <SourceLink href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
        View source →
      </SourceLink>
    </Root>
  );
}
