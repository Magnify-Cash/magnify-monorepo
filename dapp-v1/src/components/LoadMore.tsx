import React, { useState, useEffect } from 'react';
import { useQuery } from "urql";

const PaginatedList = ({ query, variables, dataKey, children, props }) => {
  const [allItems, setAllItems] = useState([]);
  const [cursor, setCursor] = useState(null);

  const [result] = useQuery({
    query: query,
    variables: { ...variables, after: cursor },
  });

  const { data, fetching, error } = result;

  useEffect(() => {
    if (data && data[dataKey] && data[dataKey].items) {
      setAllItems(prevItems => [...prevItems, ...data[dataKey].items]);
    }
  }, [data, dataKey]);

  const loadMore = () => {
    if (data && data[dataKey] && data[dataKey].pageInfo.endCursor) {
      setCursor(data[dataKey].pageInfo.endCursor);
    }
  };
  const hasNextPage = data && data[dataKey] && data[dataKey].pageInfo.hasNextPage;

  return children({
    items: allItems,
    loading: fetching,
    error,
    loadMore,
    hasNextPage,
    props: props
  });
};

export default PaginatedList;
