import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Client from './client/Client';

import Bank from './bank/Bank';
import Office from './office/Office';

function App() {
  return (
    <Router>
      <Routes>
      <Route path='/' element={<Bank/>}/>
      <Route path='/client' element={<Client/>}/>
      <Route path='/office' element={<Office/>}/>

      </Routes>
    </Router>
  );
}


export default App;
