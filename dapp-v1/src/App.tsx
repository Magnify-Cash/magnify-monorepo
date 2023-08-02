import * as Pages from "@/pages";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export function App() {
  return (
   <BrowserRouter>
     <Routes>
       <Route path="/" element={<Pages.Base />}>
         {/* Home */}
         <Route index element={<Pages.Demo title="Demo" />} />

         {/* Borrow */}

         {/* Lend */}

         {/* Support */}

         {/* Catch All */}
         <Route path="*" element={<Navigate to="/" />} />
       </Route>
     </Routes>
   </BrowserRouter>
  )
}
