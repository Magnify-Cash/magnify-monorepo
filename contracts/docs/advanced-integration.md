# Advanced Integration with NFTY Finance

In this section, we will extend the basic integration to fetch and display data from the NFTY Finance protocol using the NFTY Finance subgraph. Similar to the previous example, we will use React for the web interface and Apollo Client to send queries to the subgraph. Let's get started!

## Setting Up the Environment

First, ensure you have set up your React application as shown in the previous section. If you haven't done that yet, follow the steps mentioned there to create a new React app and set up Apollo Client.

## Graphql Client for NFTY Finance

Just like before, we need to set up a middleware to make requests to the NFTY Finance subgraph. Replace the existing imports in your `App.js` file with the following code:

```jsx
import React from 'react';
import './App.css';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export const client = new ApolloClient({
  link: new HttpLink({
	uri: 'https://api.thegraph.com/subgraphs/name/nftyfinance/nftyfinance-v1',
  }),
  cache: new InMemoryCache(),
});

function App() {
  return <div></div>;
}

export default App;
```

Here, we have updated the `uri` to point to the NFTY Finance subgraph instead of the NFTY Finance subgraph.

## Writing the Queries for NFTY Finance

Next, let's define the queries to fetch data from the NFTY Finance protocol. We will retrieve information about NFTY Finance contracts, lending desks, and active loans. Add the following code below the imports in `App.js`:

```jsx
import gql from 'graphql-tag';

const LENDING_DESKS_QUERY = gql`
  query lendingDesks {
	lendingDesks {
	  id
	  name
	  totalLiquidity
	  availableLiquidity
	  minimumCollateralizationRatio
	  liquidationPenalty
	  borrowInterestRate
	}
  }
`;

const ACTIVE_LOANS_QUERY = gql`
  query activeLoans {
	activeLoans {
	  id
	  borrower
	  lendingDesk {
		id
	  }
	  collateral
	  collateralizationRatio
	  debt
	  borrowInterestRate
	  loanStartTime
	  loanDuration
	  status
	}
  }
`;
```

These queries will fetch data about all lending desks and active loans in the NFTY Finance protocol.

## Fetching and Displaying Data

We will use the `useQuery` hook to fetch and display data about the lending desks and active loans. Replace the content of the `App` function with the following code:

```jsx
todo...
```