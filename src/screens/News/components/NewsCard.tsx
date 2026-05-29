import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { NewsListItem, resolveImageUrl } from "@src/services/newsApi";
import { ReactComponent as PuzzleLogo } from "@src/assets/logo.svg";

interface Props {
  post: NewsListItem;
}

const Card = styled.article`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border-color: ${({ theme }) => theme.colors.primary200};
  }
`;

const ImageWrap = styled.div<{ hasImage: boolean }>`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ theme, hasImage }) =>
    hasImage ? "transparent" : `linear-gradient(135deg, ${theme.colors.primary50}, ${theme.colors.primary100})`};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Placeholder = styled.div`
  width: 48%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.45;

  svg {
    width: 100%;
    height: auto;
  }
`;

const Body = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 10px;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary500};
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.primary800};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Summary = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary650};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
`;

const Tag = styled.span`
  font-size: 11px;
  padding: 3px 8px;
  background: ${({ theme }) => theme.colors.primary50};
  color: ${({ theme }) => theme.colors.primary650};
  border-radius: 6px;
  font-weight: 500;
`;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsCard({ post }: Props) {
  const navigate = useNavigate();
  const img = resolveImageUrl(post.imageUrl);

  return (
    <Card onClick={() => navigate(`/news/${post.slug}`)}>
      <ImageWrap hasImage={Boolean(img)}>
        {img ? (
          <Image src={img} alt={post.title} loading="lazy" />
        ) : (
          <Placeholder>
            <PuzzleLogo />
          </Placeholder>
        )}
      </ImageWrap>
      <Body>
        <Meta>
          <span>{formatDate(post.publishedAt)}</span>
        </Meta>
        <Title>{post.title}</Title>
        <Summary>{post.summary}</Summary>
        {post.tags.length > 0 && (
          <TagRow>
            {post.tags.slice(0, 4).map((t) => (
              <Tag key={t}>#{t}</Tag>
            ))}
          </TagRow>
        )}
      </Body>
    </Card>
  );
}
