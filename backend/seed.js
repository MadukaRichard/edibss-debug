const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Rider = require('./models/Rider');
const Review = require('./models/Review');
const SiteContent = require('./models/SiteContent');
const DeliveryFeeRule = require('./models/DeliveryFeeRule');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Rider.deleteMany({}), Review.deleteMany({}), SiteContent.deleteMany({}), DeliveryFeeRule.deleteMany({})]);

  // Users
  const admin = await User.create({ name:'MediRun Admin', email:'admin@medirun.com', phone:'+234 803 000 0001', password:'admin123', role:'admin' });
  const customer = await User.create({ name:'Adaeze Okonkwo', email:'test@medirun.com', phone:'+234 812 345 6789', password:'test123' });
  console.log('Users seeded');

  // Products
  const products = await Product.insertMany([
    { name:'Amoxicillin 500mg', description:'Broad-spectrum antibiotic for bacterial infections. 10 capsules per pack.', price:1800, category:'Medicines', stock:312, averageRating:4.3, reviewCount:3 },
    { name:'Omeprazole 20mg', description:'Proton pump inhibitor for acid reflux and heartburn. 14 capsules.', price:2100, category:'Medicines', stock:200 },
    { name:'Vitamin C 1000mg', description:'High-dose Vitamin C for immunity support. 30 effervescent tablets.', price:2200, category:'Vitamins', stock:450, averageRating:4.4, reviewCount:1 },
    { name:'Omron BP Monitor M3', description:'Automatic blood pressure monitor with cuff. Clinically validated.', price:24500, category:'Devices', stock:18, averageRating:4.9, reviewCount:1 },
    { name:'Infrared Thermometer', description:'No-contact forehead thermometer. 1-second reading. Auto power off.', price:8900, category:'Diagnostics', stock:60 },
    { name:'Cetaphil Moisturising Lotion', description:'Gentle fragrance-free lotion for sensitive skin. 250ml.', price:5600, category:'Baby Care', stock:90 },
    { name:'First Aid Kit (30-piece)', description:'Complete emergency kit with bandages, antiseptic wipes, plasters, scissors.', price:4500, category:'First Aid', stock:75 },
    { name:'Zinc Sulphate Syrup', description:'Zinc supplement for children. 60ml bottle. Strawberry flavour.', price:1200, category:'Baby Care', stock:140 },
    { name:'Paracetamol 500mg', description:'Effective pain and fever relief. 20 tablets.', price:350, category:'Medicines', stock:1000 },
    { name:'Multivitamin Capsules', description:'Complete daily multivitamin with Vitamins A, B-complex, C, D and E. 30 caps.', price:3800, category:'Vitamins', stock:230 },
    { name:'Hand Sanitiser 500ml', description:'70% ethanol-based hand sanitiser. WHO-recommended formula.', price:1500, category:'First Aid', stock:300 },
    { name:'Glucometer Kit', description:'Blood glucose monitor with 10 test strips and lancets.', price:12000, category:'Diagnostics', stock:35, requiresPrescription:false },
  ]);
  console.log('Products seeded');

  // Riders
  const riders = await Rider.insertMany([
    { name:'Emmanuel Kehinde', phone:'+234 803 441 2290', vehicle:'Motorcycle', plateNumber:'LAG-234-EK', zone:'Ikeja', status:'available', location:{ lat:6.5944, lng:3.3436 }, rating:4.8, totalDeliveries:312 },
    { name:'Sunday Bello', phone:'+234 706 882 5510', vehicle:'Motorcycle', plateNumber:'LAG-507-SB', zone:'Lekki', status:'available', location:{ lat:6.4355, lng:3.5064 }, rating:4.9, totalDeliveries:198 },
    { name:'Fatima Kwari', phone:'+234 812 090 3344', vehicle:'Bicycle', plateNumber:'N/A', zone:'Surulere', status:'available', location:{ lat:6.5037, lng:3.3568 }, rating:5.0, totalDeliveries:87 },
  ]);
  console.log('Riders seeded');

  // Mock reviews with Nigerian phone numbers
  const mockReviews = [
    { product:products[0]._id, name:'Amaka Nwosu', phone:'+234 803 441 2521', rating:5, comment:'Genuine product, well-packaged and arrived in 22 minutes. The rider called ahead too. Highly recommend!', status:'approved', isMock:true, verifiedPurchase:true },
    { product:products[0]._id, name:'Tunde Fashola', phone:'+234 708 992 9134', rating:4, comment:'Good experience overall. Delivery was a bit slower than expected at 35 min, but product quality is excellent.', status:'approved', isMock:true, verifiedPurchase:true },
    { product:products[0]._id, name:'Chidinma Ike', phone:'+234 912 334 7783', rating:5, comment:'Tracked the rider on the map in real time — that feature alone is worth 5 stars. Medicine was fresh and properly sealed.', status:'approved', isMock:true, verifiedPurchase:true },
    { product:products[3]._id, name:'Biodun Adeyemi', phone:'+234 806 551 0023', rating:5, comment:'The BP monitor is exactly as described. Accurate readings, easy to use. Fast delivery to Victoria Island!', status:'approved', isMock:true, verifiedPurchase:true },
    { product:products[2]._id, name:'Ngozi Ezenwachi', phone:'+234 901 228 6677', rating:4, comment:'Good quality Vitamin C. Tabs dissolve quickly. Delivery was on time and rider was polite.', status:'approved', isMock:true, verifiedPurchase:true },
    { product:products[0]._id, name:'Victor Okorie', phone:'+234 805 773 2210', rating:2, comment:'Packaging was slightly damaged but medicine was fine. Needs better packaging.', status:'pending', isMock:true, verifiedPurchase:true },
  ];
  await Review.insertMany(mockReviews);
  console.log('Reviews seeded');

  // Site content
  await SiteContent.insertMany([
    { key:'hero', label:'Hero banner', value:{ headline:'Medicines & health products, at your door in 30 min', subheadline:'Licensed pharmacy partners, real-time rider GPS, AI-calculated delivery fees.', badge:'Fast health delivery', cta:'Shop now', bgColor:'#E1F5EE' } },
    { key:'categoryOrder', label:'Category display order', value:['Medicines','Devices','Baby Care','Vitamins','First Aid','Diagnostics'] },
    { key:'bankDetails', label:'Bank transfer details', value:{ bankName:'', accountNumber:'', accountName:'', note:'Please use your order number as the transfer narration/reference.' } },
  ]);
  console.log('Site content seeded');

  // Default delivery fee rule
  await DeliveryFeeRule.create({ storeLat:6.5244, storeLng:3.3792, baseFee:500, baseFeeMaxKm:2, perKmRate:80, peakHourSurcharge:100, peakHours:['07:00-09:00','17:00-20:00'], maxRadiusKm:15, freeDeliveryThreshold:15000, isActive:true });
  console.log('Fee rules seeded');

  console.log('\n✅ Seed complete!');
  console.log('Admin login: admin@medirun.com / admin123');
  console.log('Test login:  test@medirun.com  / test123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
