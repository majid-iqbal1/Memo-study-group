import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from './components/auth';
import Homepage from './Homepage';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/homepage" element={<Homepage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
