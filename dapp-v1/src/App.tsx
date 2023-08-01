import * as Pages from "@/pages";
import { Routes, Route, BrowserRouter } from "react-router-dom";

export function App() {
  return (
   <BrowserRouter>
     <Routes>
       <Route path="/" element={<Pages.Base />}>
         {/* General */}
         <Route index element={<div>hi</div>} />
         {/* End General */}
       </Route>
     </Routes>
   </BrowserRouter>
  )
}
