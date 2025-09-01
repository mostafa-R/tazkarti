import React from 'react';
import OrganizerNavbar from '../Components/OrganizerNavbar';
import EnhancedBookingManagement from '../Components/EnhancedBookingManagement';

const ViewBookingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OrganizerNavbar />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <EnhancedBookingManagement />
      </div>
    </div>
  );
};

export default ViewBookingsPage;
