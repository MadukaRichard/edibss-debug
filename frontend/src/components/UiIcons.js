import React from 'react';
import {
  LuBaby,
  LuBanknote,
  LuBike,
  LuChevronDown,
  LuClipboardList,
  LuClock3,
  LuFlaskConical,
  LuHeartPulse,
  LuHospital,
  LuImage,
  LuLayoutDashboard,
  LuLeaf,
  LuLocateFixed,
  LuLogOut,
  LuMapPin,
  LuMenu,
  LuPackage,
  LuPill,
  LuPhoneCall,
  LuShieldCheck,
  LuShoppingCart,
  LuStar,
  LuThermometer,
  LuHouse,
  LuMap,
  LuNavigation,
  LuArrowRight,
  LuArrowLeft,
  LuCloud, // <-- 1. NEW ICON IMPORTED HERE!
} from 'react-icons/lu';

export const CategoryIconMap = {
  All: LuHospital,
  Medicines: LuPill,
  Devices: LuHeartPulse,
  'Baby Care': LuBaby,
  Vitamins: LuLeaf,
  'First Aid': LuShieldCheck,
  Diagnostics: LuThermometer,
  Puff: LuCloud, // <-- 2. NEW CATEGORY ADDED TO THE DICTIONARY HERE!
  default: LuPackage,
};

export const StatusIconMap = {
  confirmed: LuClipboardList,
  preparing: LuFlaskConical,
  in_transit: LuBike,
  delivered: LuHouse,
};

export const NavIconMap = {
  dashboard: LuLayoutDashboard,
  products: LuPill,
  orders: LuPackage,
  riders: LuBike,
  reviews: LuStar,
  hero: LuImage,
  feeRules: LuBanknote,
  payment: LuBanknote,
};

export const AppIcons = {
  logo: LuPill,
  cart: LuShoppingCart,
  menu: LuMenu,
  chevronDown: LuChevronDown,
  logOut: LuLogOut,
  phone: LuPhoneCall,
  mapPin: LuMapPin,
  map: LuMap,
  locateFixed: LuLocateFixed,
  navigation: LuNavigation,
  arrowRight: LuArrowRight,
  arrowLeft: LuArrowLeft,
  clock: LuClock3,
  image: LuImage,
  package: LuPackage,
  riders: LuBike,
  reviews: LuStar,
  payment: LuBanknote,
};

export const CategoryIcon = ({ category, size = 18, strokeWidth = 2.1, ...props }) => {
  const Icon = CategoryIconMap[category] || CategoryIconMap.default;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...props} />;
};

export const StatusIcon = ({ status, size = 18, strokeWidth = 2.1, ...props }) => {
  const Icon = StatusIconMap[status] || LuPackage;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...props} />;
};