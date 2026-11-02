import { useNavigate } from 'react-router-dom';
import PageLayout from './PageLayout';

function DoctorPatients() {
  const navigate = useNavigate();
  return (
    <PageLayout title="Patient List" activePath="/doctor-patients">
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>Patient list is available in the Doctor Dashboard.</p>
        <button className="btn-sm btn-sm-teal" style={{ marginTop: 16 }} onClick={() => navigate('/doctor-dashboard')}>Go to Dashboard</button>
      </div>
    </PageLayout>
  );
}

export default DoctorPatients;
