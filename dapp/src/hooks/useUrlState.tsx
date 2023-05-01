import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/*
It has four parameters. 
The first is the initial state of the hook. 
The second parameter is the name of the query param that will be shown in the url. 
The third function is a serialization function, that will take the state and turn it into a url friendly string. 
The fourth de-serialization function, will take the string and transform it back to the state. In the fourth step, its a good practice to make sure that the value is of correct type, since you don't want the rest of you application to fail because of invalid query params. 

const [bool, setBool] = useStateParams(
  false,
  'boolean',
  (s) => (s ? 'true' : 'false'),
  (s) => s === 'true'
);

const [slider, setSlider] = useStateParams(
  10,
  'slider',
  (s) => s.toString(),
  (s) => (Number(s) !== Number.NaN ? Number(s) : 10)
);

https://pierrehedkvist.com/posts/react-state-url
*/

export function useStateParams<T>(
  initialState: T,
  paramsName: string,
  serialize: (state: T) => string,
  deserialize: (state: string) => T
): [T, (state: T) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);

  const existingValue = search.get(paramsName);
  const [state, setState] = useState<T>(
    existingValue ? deserialize(existingValue) : initialState
  );

  useEffect(() => {
    // Updates state when user navigates backwards or forwards in browser history
    if (existingValue && deserialize(existingValue) !== state) {
      setState(deserialize(existingValue));
    }
  }, [existingValue]);

  const onChange = (s: T) => {
    setState(s);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(paramsName, serialize(s));
    const pathname = location.pathname;
    navigate({ pathname, search: searchParams.toString() });
  };

  return [state, onChange];
}
