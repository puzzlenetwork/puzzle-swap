import React, { useCallback, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import { fetchNewsList, NewsListItem } from "@src/services/newsApi";
import NewsCard from "./components/NewsCard";

const Root = styled(Column)`
  width: 100%;
  max-width: 1200px;
  padding: 48px 24px;
  box-sizing: border-box;
  align-items: flex-start;
  gap: 32px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 24px;
  }
`;

const TitleBlock = styled(Column)`
  gap: 12px;
  max-width: 700px;
`;

const Title = styled(Text)`
  font-size: 40px;
  font-weight: 700;
  line-height: 48px;
  color: ${({ theme }) => theme.colors.primary800};
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 28px;
    line-height: 34px;
  }
`;

const Subtitle = styled(Text)`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.primary650};

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 24px 0;
`;

const EmptyState = styled.div`
  width: 100%;
  padding: 60px 24px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary500};
  font-size: 15px;
`;

const ErrorState = styled(EmptyState)`
  color: ${({ theme }) => theme.colors.error550};
`;

const PAGE_SIZE = 12;

export default function News() {
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNewsList(pageToLoad, PAGE_SIZE);
      setItems((prev) => (pageToLoad === 1 ? res.data : [...prev, ...res.data]));
      setTotal(res.meta.total);
      setPage(pageToLoad);
    } catch {
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const hasMore = items.length < total;

  return (
    <Root>
      <TitleBlock>
        <Title>News</Title>
        <Subtitle>
          Latest news from Waves, Puzzle Network and the broader DeFi world. Updated automatically every 4 hours.
        </Subtitle>
      </TitleBlock>

      {error && <ErrorState>{error}</ErrorState>}

      {!error && items.length === 0 && !loading && (
        <EmptyState>No news yet. Check back later.</EmptyState>
      )}

      {items.length > 0 && (
        <Grid>
          {items.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </Grid>
      )}

      {hasMore && (
        <Center>
          <Button
            kind="secondary"
            onClick={() => void load(page + 1)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </Center>
      )}

      {loading && items.length === 0 && <Center>Loading...</Center>}
    </Root>
  );
}
