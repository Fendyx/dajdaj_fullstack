import { useState, useEffect } from "react";
import { CardGallery } from "./CardGallery";
import "./styles.css";

const mockProfiles = [
  {
    id: "1",
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    cardNumber: "4532 1234 5678 0001",
    registrationDate: "March 15, 2023",
    address: {
      street: "123 Maple Street, Apt 4B",
      city: "New York, NY",
      postalCode: "10001",
      country: "United States"
    },
    phoneNumber: "+1 (555) 123-4567"
  },
  {
    id: "2",
    fullName: "John Miller",
    email: "j.miller@email.com",
    cardNumber: "4532 1234 5678 0002",
    registrationDate: "June 8, 2023",
    address: {
      street: "456 Oak Avenue",
      city: "Los Angeles, CA",
      postalCode: "90210",
      country: "United States"
    },
    phoneNumber: "+1 (555) 987-6543"
  },
  {
    id: "3",
    fullName: "Emma Wilson",
    email: "emma.wilson@email.com",
    cardNumber: "4532 1234 5678 0003",
    registrationDate: "September 2, 2023",
    address: {
      street: "789 Pine Boulevard, Suite 12",
      city: "Chicago, IL",
      postalCode: "60601",
      country: "United States"
    },
    phoneNumber: "+1 (555) 456-7890"
  }
];

export function DeliveryProfiles() {
  const [profiles] = useState(mockProfiles);

  const handleEditProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    console.log(`Opening edit form for ${profile?.fullName}`);
  };

  const handleLogOut = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    console.log(`Logging out ${profile?.fullName}`);
  };

  const handleAddNewProfile = () => {
    console.log("Opening new recipient profile form");
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target === document.body) {
        switch (event.key) {
          case 'ArrowLeft':
          case 'ArrowRight':
            event.preventDefault();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CardGallery
      profiles={profiles}
      onEditProfile={handleEditProfile}
      onLogOut={handleLogOut}
      onAddNewProfile={handleAddNewProfile}
    />
  );
}