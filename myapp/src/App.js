import './App.css';
import React, { useState, useEffect } from 'react';
const ITEMS_PER_PAGE = 10;
const Table = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Sno.</th>
          <th>Customer Name</th>
          <th>Age</th>
          <th>Phone</th>
          <th>Location</th>
          <th>Date</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.sno}</td>
            <td>{row.customer_name}</td>
            <td>{row.age}</td>
            <td>{row.phone}</td>
            <td>{row.location}</td>
            <td>{new Date(row.created_at).toDateString()}</td>
            <td>{new Date(row.created_at).toTimeString().split(' ')[0]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function App() {

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [maxPage, setMaxPage] = useState(1);

  useEffect(() => {


    fetchData();
  },[]);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/table-length');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const length = data.length;
      const calculatedMaxPage = Math.ceil(length / 10); // Assuming 10 records per page
      setMaxPage(calculatedMaxPage);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
    useEffect(()=>{
      fetchCustomers();
    }, [currentPage]);
    useEffect(()=>{
      if(searchTerm==''){
        fetchCustomers();
      }
      else{
        handleSearch()
      }
    }, [sortBy]);
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/customers?page=${currentPage}&sortBy=${sortBy}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

     // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  

  const clearSearch = async () => {
      setCurrentPage(1)
      fetchCustomers();
      fetchData()
      setSearchTerm('')
      return;
  }
  const handleSearch = async () => {
    if(searchTerm==''){

      setCurrentPage(1)
      fetchCustomers();
      fetchData()
      return;
    }
    try {
      const url = `http://localhost:5000/search?term=${encodeURIComponent(searchTerm)}&sortBy=${sortBy}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setData(data);
      setMaxPage(Math.ceil(data.length/10))
    } catch (error) {
      console.error('Error searching:', error);
    }
  };
    return (
      <>
      <div className='whole-container'>
      <div className="container">
        <div className='searchContainer'>
      <input type="text" placeholder="Search by name or location" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <button onClick={clearSearch}>All users</button>
      </div>
      <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
        <option value="sno">Sort by sNo.</option>
        <option value="created_at">Sort by Date</option>
      </select>
      </div>
      <Table data={data} />
      <div className='pagination-container'>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        {Array.from({ length: maxPage }, (_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>{i + 1}</button>
        ))}
        <button onClick={nextPage} disabled={currentPage === maxPage}>Next</button>
      </div>
      </div>
    </div>
    
    </>
  );
}

export default App;
