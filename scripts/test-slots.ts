import fetch from 'node-fetch';

async function testSlotsAPI() {
  try {
    // Test with today's date
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`http://localhost:3001/api/bookings?date=${today}`);

    if (!response.ok) {
      console.log('API not running or error:', response.status);
      return;
    }

    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.data && data.data.allSlots) {
      console.log('\nAll Slots:');
      data.data.allSlots.forEach((slot: any) => {
        console.log(`${slot.label}: ${slot.isAvailable ? 'AVAILABLE' : 'BOOKED'}`);
      });
    }
  } catch (error) {
    console.log('Error testing API:', error.message);
  }
}

testSlotsAPI();