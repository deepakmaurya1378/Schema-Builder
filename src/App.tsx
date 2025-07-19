import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SchemaBuilder from "./pages/SchemaBuilder"
import SavedSchemas from './pages/PreviousSchema';

function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SchemaBuilder />} />
        <Route path="/saved-schemas" element={<SavedSchemas />} />
      </Routes>
    </Router>
  )
}

export default App
