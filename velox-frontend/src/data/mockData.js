export const vehicles = [
  { id: 'v1', brand: 'Toyota', model: 'Land Cruiser', type: 'SUV', dailyRate: 120, year: 2023, vehicleNumber: 'SUV-001', available: true },
  { id: 'v2', brand: 'Honda', model: 'Civic', type: 'Sedan', dailyRate: 65, year: 2024, vehicleNumber: 'SED-002', available: true },
  { id: 'v3', brand: 'Ford', model: 'Transit', type: 'Van', dailyRate: 95, year: 2022, vehicleNumber: 'VAN-003', available: false },
  { id: 'v4', brand: 'Nissan', model: 'Patrol', type: 'SUV', dailyRate: 130, year: 2023, vehicleNumber: 'SUV-004', available: true },
  { id: 'v5', brand: 'Hyundai', model: 'Sonata', type: 'Sedan', dailyRate: 55, year: 2024, vehicleNumber: 'SED-005', available: false },
  { id: 'v6', brand: 'Mercedes', model: 'Sprinter', type: 'Van', dailyRate: 110, year: 2023, vehicleNumber: 'VAN-006', available: true },
  { id: 'v7', brand: 'BMW', model: 'X5', type: 'SUV', dailyRate: 150, year: 2024, vehicleNumber: 'SUV-007', available: true },
  { id: 'v8', brand: 'Toyota', model: 'Camry', type: 'Sedan', dailyRate: 60, year: 2023, vehicleNumber: 'SED-008', available: true },
];

export const customers = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@mail.com', phone: '+1-555-0101', nationalId: 'NID-1001', role: 'customer' },
  { id: 'c2', name: 'Bob Williams', email: 'bob@mail.com', phone: '+1-555-0102', nationalId: 'NID-1002', role: 'customer' },
  { id: 'c3', name: 'Carol Davis', email: 'carol@mail.com', phone: '+1-555-0103', nationalId: 'NID-1003', role: 'customer' },
  { id: 'c4', name: 'David Brown', email: 'david@mail.com', phone: '+1-555-0104', nationalId: 'NID-1004', role: 'customer' },
  { id: 'c5', name: 'Eva Martinez', email: 'eva@mail.com', phone: '+1-555-0105', nationalId: 'NID-1005', role: 'customer' },
];

export const drivers = [
  { id: 'd1', name: 'Mike Ross', email: 'mike@mail.com', licenseNumber: 'LIC-2001', licenseType: 'Heavy Vehicle', role: 'driver' },
  { id: 'd2', name: 'Sarah Kim', email: 'sarah@mail.com', licenseNumber: 'LIC-2002', licenseType: 'Light Vehicle', role: 'driver' },
  { id: 'd3', name: 'Tom Chen', email: 'tom@mail.com', licenseNumber: 'LIC-2003', licenseType: 'Heavy Vehicle', role: 'driver' },
];

export const admins = [
  { id: 'a1', name: 'Admin One', email: 'admin1@mail.com', accessLevel: 'Super', role: 'admin' },
  { id: 'a2', name: 'Admin Two', email: 'admin2@mail.com', accessLevel: 'Standard', role: 'admin' },
];

export const rentals = [
  { id: 'r1', customerId: 'c1', driverId: 'd1', vehicleId: 'v1', startDate: '2025-01-10', endDate: '2025-01-15', totalCost: 600, status: 'Completed' },
  { id: 'r2', customerId: 'c2', driverId: 'd2', vehicleId: 'v2', startDate: '2025-02-01', endDate: '2025-02-05', totalCost: 260, status: 'Completed' },
  { id: 'r3', customerId: 'c3', driverId: 'd3', vehicleId: 'v4', startDate: '2025-03-10', endDate: '2025-03-20', totalCost: 1300, status: 'Active' },
  { id: 'r4', customerId: 'c1', driverId: 'd1', vehicleId: 'v6', startDate: '2025-04-01', endDate: '2025-04-08', totalCost: 770, status: 'Active' },
  { id: 'r5', customerId: 'c4', driverId: 'd2', vehicleId: 'v7', startDate: '2025-03-15', endDate: '2025-03-18', totalCost: 450, status: 'Completed' },
  { id: 'r6', customerId: 'c5', driverId: 'd3', vehicleId: 'v8', startDate: '2025-04-05', endDate: '2025-04-10', totalCost: 300, status: 'Active' },
];

export const payments = [
  { id: 'p1', rentalId: 'r1', amountPaid: 600, paymentMethod: 'Credit Card', transactionId: 'TXN-3001', paymentDate: '2025-01-10' },
  { id: 'p2', rentalId: 'r2', amountPaid: 260, paymentMethod: 'M-Pesa', transactionId: 'TXN-3002', paymentDate: '2025-02-01' },
  { id: 'p3', rentalId: 'r3', amountPaid: 1300, paymentMethod: 'Bank Transfer', transactionId: 'TXN-3003', paymentDate: '2025-03-10' },
  { id: 'p4', rentalId: 'r5', amountPaid: 450, paymentMethod: 'Credit Card', transactionId: 'TXN-3004', paymentDate: '2025-03-15' },
];

export const receipts = [
  { id: 'rc1', rentalId: 'r1', receiptNumber: 'REC-4001', baseCost: 600, lateFee: 0, finalTotal: 600, isVoided: false },
  { id: 'rc2', rentalId: 'r2', receiptNumber: 'REC-4002', baseCost: 260, lateFee: 30, finalTotal: 290, isVoided: false },
  { id: 'rc3', rentalId: 'r5', receiptNumber: 'REC-4003', baseCost: 450, lateFee: 0, finalTotal: 450, isVoided: true },
  { id: 'rc4', rentalId: 'r3', receiptNumber: 'REC-4004', baseCost: 1300, lateFee: 50, finalTotal: 1350, isVoided: false },
];

export const reviews = [
  { id: 'rv1', rentalId: 'r1', customerName: 'Alice Johnson', rating: 5, comment: 'Excellent vehicle and service. Very smooth ride.', reviewDate: '2025-01-16' },
  { id: 'rv2', rentalId: 'r2', customerName: 'Bob Williams', rating: 4, comment: 'Good car, clean and well maintained. Pickup was a bit late.', reviewDate: '2025-02-06' },
  { id: 'rv3', rentalId: 'r5', customerName: 'David Brown', rating: 3, comment: 'Decent experience but the SUV had some interior wear.', reviewDate: '2025-03-19' },
  { id: 'rv4', rentalId: 'r1', customerName: 'Alice Johnson', rating: 5, comment: 'Second rental with them and still impressed!', reviewDate: '2025-01-20' },
  { id: 'rv5', rentalId: 'r2', customerName: 'Bob Williams', rating: 2, comment: 'Return process was confusing and took too long.', reviewDate: '2025-02-10' },
];
