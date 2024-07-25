import { useState, useEffect } from "react";
import { useQuery } from "urql";

/**
 * PaginatedList Component
 *
 * A component to handle paginated queries using the urql library.
 * It manages the pagination state and fetches more items as needed.
 *
 * @param {Object} props - Component props
 * @param {String} props.query - The GraphQL query for fetching the items
 * @param {Object} props.variables - The variables for the GraphQL query
 * @param {String} props.dataKey - The key to access the data in the response
 * @param {String} props.manualRefetch - Should the query be refetched manually
 * @param {Function} props.children - The render prop function to render the list and controls
 * @param {Object} [props.props] - Additional props to pass to the children
 */

const PaginatedList = ({
  query,
  variables,
  dataKey,
  manualRefetch = false,
  children,
  props = {},
}) => {
  // State to store all fetched items
  const [allItems, setAllItems] = useState<any[]>([]);
  // State to store the cursor for pagination
  const [cursor, setCursor] = useState(null);
  // State to determine if the query should be paused
  const [paused, setPaused] = useState(false);

  // Execute the GraphQL query with the provided variables and cursor for pagination
  const [result, reexecuteQuery] = useQuery({
    query: query,
    variables: { ...variables, after: cursor },
    pause: paused,
  });

  // Function to refetch the query data
  const refetchData = () => {
    setPaused(false);
     reexecuteQuery({
      requestPolicy: "network-only",
    });
  };

  // Destructure data, fetching state, and error from the query result
  const { data, fetching, error } = result;

  useEffect(() => {
    if (
      !paused &&
      manualRefetch &&
      data &&
      data[dataKey] &&
      data[dataKey].items
    ) {
      // Pause the query after it has been executed once if manualRefetch is enabled
      setPaused(true);
    }
  }, [data, manualRefetch]);

  // Effect to reset allItems and cursor when variables change
  useEffect(() => {
    setAllItems([]);
    setCursor(null);
  }, [variables]);

  // Effect to update allItems when new data is fetched
  useEffect(() => {
    if (data && data?.[dataKey] && data?.[dataKey].items) {
      // Append new items to the existing list
      setAllItems((prevItems) => [...prevItems, ...data?.[dataKey].items]);
    }
  }, [data, dataKey]);

  // Function to load more items by updating the cursor
  const loadMore = () => {
    if (data && data[dataKey] && data[dataKey].pageInfo.endCursor) {
      setCursor(data[dataKey].pageInfo.endCursor);
      setPaused(false);
    }
  };

  // Check for null, undefined, or empty strings
  // Set paused to true if exists
  useEffect(() => {
    const hasEmptyString = Object.values(variables).some(value => value === '');
    const hasNull = Object.values(variables).some(value => value === null);
    const hasUndefined = Object.values(variables).some(value => value === undefined)
    if (hasEmptyString || hasNull || hasUndefined){
      setPaused(true)
    } else {
      setPaused(false)
    }
  },[variables])

  // Determine if there is a next page available
  const hasNextPage =
    data && data[dataKey] && data[dataKey].pageInfo.hasNextPage;

  // Render the children with the necessary data and controls
  return children({
    items: allItems,
    loading: fetching,
    error,
    loadMore,
    hasNextPage,
    props: { ...props, reexecuteQuery: refetchData },
  });
};

export default PaginatedList;
