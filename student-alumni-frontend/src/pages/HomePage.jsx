import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h2>Welcome to the Student-Alumni Portal</h2>
        <p>Use the navbar to navigate through your dashboard, profile, alumni list, and more.</p>
      </div>
    </>
  );
};

export default HomePage;
