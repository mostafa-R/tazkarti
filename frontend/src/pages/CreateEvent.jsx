import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventCreationForm from '../Components/EventCreationForm';

const CreateEventPage = () => {
  const navigate = useNavigate();

  const handleEventCreated = (eventData) => {
    // Navigate back to organizer dashboard after successful creation
    navigate('/organizer-dashboard', { 
      state: { message: 'Event created successfully!' }
    });
  };

  const handleCancel = () => {
    navigate('/organizer-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EventCreationForm 
        onSuccess={handleEventCreated}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateEventPage;
